const authService = require('../services/authService');

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    // Get full user info
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    req.user = user;
    req.userId = user.user_id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication - attaches user if token present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = authService.verifyToken(token);
      const user = await authService.getUserById(decoded.userId);
      if (user && user.status === 'active') {
        req.user = user;
        req.userId = user.user_id;
      }
    }
    next();
  } catch (err) {
    // Ignore errors for optional auth
    next();
  }
};

/**
 * Admin only middleware - must be used after authenticate
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Extract user ID from request for filtering data
 */
const getUserIdFilter = (req) => {
  // Admin viewing another user's data
  if (req.user?.role === 'admin' && req.query.viewAsUser) {
    return parseInt(req.query.viewAsUser);
  }
  // Regular user or admin viewing their own data
  return req.userId;
};

module.exports = {
  authenticate,
  optionalAuth,
  adminOnly,
  getUserIdFilter,
};
