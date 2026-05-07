// ============================================================
// Authentication & Authorization Middleware
// - verifyToken: validates JWT from Authorization header
// - authorize: checks if user role is in allowed roles list
// ============================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

/**
 * Middleware factory to restrict access to specific roles.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'faculty')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.',
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorize };
