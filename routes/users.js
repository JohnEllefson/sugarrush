'use strict';

const express = require('express');
const { authenticateJWT } = require('../utilities/authentication');
const usersController = require('../controllers/users');
const utilities = require('../utilities/index');
const usersValidate = require('../utilities/users-validation');

const router = express.Router();

// Return all users. Admins can see all users, regular users can only see themselves.
router.get('/', authenticateJWT, utilities.handleErrors(usersController.getAllUsers));

// Return a single user. Admins can see all users, regular users can only see themselves.
router.get(
  '/:id',
  authenticateJWT,
  usersValidate.idRules(),
  usersValidate.checkId,
  utilities.handleErrors(usersController.getSingleUser)
);

// Delete a single user (only accessible by the direct user or admin)
router.delete(
  '/:id',
  authenticateJWT,
  usersValidate.idRules(),
  usersValidate.checkId,
  utilities.handleErrors(usersController.deleteSingleUser)
);

// Update user info (only accessible by the direct user or admin)
router.put(
  '/:id',
  authenticateJWT,
  usersValidate.idRules(),
  usersValidate.checkId,
  usersValidate.userRules(),
  usersValidate.checkUser,
  utilities.handleErrors(usersController.updateSingleUser)
);

// Logout route
router.post('/logout', authenticateJWT, utilities.handleErrors(usersController.userLogout));

module.exports = router;
