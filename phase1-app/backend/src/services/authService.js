const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'strikezone-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthService {
  /**
   * Register a new user
   */
  async signup({ email, password, fullName, companyName }) {
    // Check if user exists
    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with pending status
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, company_name, role, status)
       VALUES ($1, $2, $3, $4, 'user', 'pending')
       RETURNING user_id, email, full_name, company_name, role, status, created_at`,
      [email.toLowerCase(), passwordHash, fullName, companyName]
    );

    return {
      user: result.rows[0],
      message: 'Account created. Please wait for admin approval.',
    };
  }

  /**
   * Sign in user
   */
  async signin({ email, password }) {
    // Find user
    const result = await pool.query(
      'SELECT user_id, email, password_hash, full_name, company_name, role, status FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Invalid email or password');
    }

    // Check status
    if (user.status === 'pending') {
      throw new Error('Your account is pending approval. Please wait for admin to approve.');
    }
    if (user.status === 'suspended') {
      throw new Error('Your account has been suspended. Please contact support.');
    }
    if (user.status === 'rejected') {
      throw new Error('Your account registration was rejected.');
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        companyName: user.company_name,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    const result = await pool.query('SELECT user_id, email, full_name FROM users WHERE email = $1', [email.toLowerCase()]);

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return { message: 'If this email is registered, you will receive a password reset link.' };
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE user_id = $3',
      [resetTokenHash, resetExpires, user.user_id]
    );

    // In production, send email with reset link
    // For now, just return the token (only in development)
    const isDev = process.env.NODE_ENV !== 'production';

    return {
      message: 'If this email is registered, you will receive a password reset link.',
      ...(isDev && { resetToken, resetLink: `http://localhost:3000/reset-password?token=${resetToken}` }),
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT user_id FROM users 
       WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const userId = result.rows[0].user_id;
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [passwordHash, userId]
    );

    return { message: 'Password reset successful. You can now sign in.' };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const result = await pool.query(
      'SELECT user_id, email, full_name, company_name, role, status, created_at, last_login FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * List all users (admin only)
   */
  async listUsers({ status, role, page = 1, limit = 50 }) {
    let query = 'SELECT user_id, email, full_name, company_name, role, status, created_at, last_login FROM users WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (status) {
      query += ` AND status = $${paramIdx++}`;
      params.push(status);
    }
    if (role) {
      query += ` AND role = $${paramIdx++}`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    return {
      users: result.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Approve user (admin only)
   */
  async approveUser(userId, adminId) {
    const result = await pool.query(
      `UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1
       RETURNING user_id, email, full_name, status`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return { user: result.rows[0], message: 'User approved successfully' };
  }

  /**
   * Reject user (admin only)
   */
  async rejectUser(userId, adminId, reason) {
    const result = await pool.query(
      `UPDATE users SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1
       RETURNING user_id, email, full_name, status`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return { user: result.rows[0], message: 'User rejected' };
  }

  /**
   * Suspend user (admin only)
   */
  async suspendUser(userId, adminId) {
    const result = await pool.query(
      `UPDATE users SET status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1
       RETURNING user_id, email, full_name, status`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return { user: result.rows[0], message: 'User suspended' };
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId, newRole, adminId) {
    if (!['admin', 'user'].includes(newRole)) {
      throw new Error('Invalid role');
    }

    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2
       RETURNING user_id, email, full_name, role`,
      [newRole, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return { user: result.rows[0], message: `User role updated to ${newRole}` };
  }
}

module.exports = new AuthService();
