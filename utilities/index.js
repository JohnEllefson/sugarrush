'use strict';

const { validationResult } = require('express-validator');
const Util = {};

// Middleware For Handling Errors
Util.handleErrors = (fn) => async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Error handler for async functions
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = Util;
