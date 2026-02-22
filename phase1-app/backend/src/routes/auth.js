const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticate, adminOnly } = require('../middleware/auth');

/**
 * POST /api/auth/signup - Register new user
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, companyName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const result = await authService.signup({ email, password, fullName, companyName });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/signin - Sign in user
 */
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.signin({ email, password });
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

/**
 * POST /api/auth/forgot-password - Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/reset-password - Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me - Get current user info
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        userId: req.user.user_id,
        email: req.user.email,
        fullName: req.user.full_name,
        companyName: req.user.company_name,
        role: req.user.role,
        status: req.user.status,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/users - List all users (admin only)
 */
router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const { status, role, page = 1, limit = 50 } = req.query;
    const result = await authService.listUsers({ 
      status, 
      role, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/users/:userId/approve - Approve user (admin only)
 */
router.post('/users/:userId/approve', authenticate, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await authService.approveUser(parseInt(userId), req.user.user_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/users/:userId/reject - Reject user (admin only)
 */
router.post('/users/:userId/reject', authenticate, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const result = await authService.rejectUser(parseInt(userId), req.user.user_id, reason);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/users/:userId/suspend - Suspend user (admin only)
 */
router.post('/users/:userId/suspend', authenticate, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await authService.suspendUser(parseInt(userId), req.user.user_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/auth/users/:userId/role - Update user role (admin only)
 */
router.patch('/users/:userId/role', authenticate, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const result = await authService.updateUserRole(parseInt(userId), role, req.user.user_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
