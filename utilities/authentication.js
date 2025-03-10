'use strict';

const jwt = require('jsonwebtoken');
const redisClient = require('../utilities/redisClient');

// Middleware to verify JWT and check blacklist
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      return res.status(403).json({ message: 'Token is blacklisted. Access denied.' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token. Access denied.' });

      req.user = user; // Attach decoded user info
      next();
    });
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware for role-based protection
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (allowedRoles.includes(req.user.role) || req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  };
};

module.exports = { authenticateJWT, authorizeRoles };
