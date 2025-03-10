'use strict';

const express = require('express');
const authController = require('../controllers/auth');
const utilities = require('../utilities/index');

const router = express.Router();

// Initiate Google OAuth
router.get('/google', utilities.handleErrors(authController.googleAuth));

// Google OAuth callback
router.get(
  '/google/callback',
  utilities.handleErrors(authController.googleCallback),
  utilities.handleErrors(authController.googleCallbackHandler)
);

module.exports = router;
