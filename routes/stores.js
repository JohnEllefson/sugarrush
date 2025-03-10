'use strict';

// Import the required modules
const express = require('express');
const storesController = require('../controllers/stores');
const storesValidate = require('../utilities/stores-validation');
const { authenticateJWT, authorizeRoles } = require('../utilities/authentication');
const utilities = require('../utilities/index');

// Create a new router
const router = express.Router();

// Return all stores (admin, store owner, driver, and inventory manager only)
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'driver', 'inventoryManager'),
  utilities.handleErrors(storesController.getAllStores)
);

// Return a single store (admin, store owner, driver, and inventory manager only)
router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'driver', 'inventoryManager'),
  storesValidate.idRules(),
  storesValidate.checkId,
  utilities.handleErrors(storesController.getSingleStore)
);

// Delete a single store (admin, store owner, and inventory manager only)
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'inventoryManager'),
  storesValidate.idRules(),
  storesValidate.checkId,
  utilities.handleErrors(storesController.deleteSingleStore)
);

// Create a new store (admin, store owner, and inventory manager only)
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'inventoryManager'),
  storesValidate.storeAddRules(),
  storesValidate.checkStore,
  utilities.handleErrors(storesController.createSingleStore)
);

// Update a single store (admin, store owner, and inventory manager only)
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'inventoryManager'),
  storesValidate.idRules(),
  storesValidate.checkId,
  storesValidate.storeUpdateRules(),
  storesValidate.checkStore,
  utilities.handleErrors(storesController.updateSingleStore)
);

module.exports = router;
