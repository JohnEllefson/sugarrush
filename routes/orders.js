'use strict';

// Import the required modules
const express = require('express');
const ordersController = require('../controllers/orders');
const ordersValidate = require('../utilities/orders-validation');
const { authenticateJWT, authorizeRoles } = require('../utilities/authentication');
const utilities = require('../utilities/index');

// Create a new router
const router = express.Router();

// Return all orders (admin, store owner, driver, and inventory manager only)
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'driver', 'inventoryManager'),
  utilities.handleErrors(ordersController.getAllOrders)
);

// Return a single order (admin, store owner, driver, and inventory manager only)
router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'driver', 'inventoryManager'),
  ordersValidate.idRules(),
  ordersValidate.checkId,
  utilities.handleErrors(ordersController.getSingleOrder)
);

// Delete a single order (admin, store owner, and inventory manager only)
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'inventoryManager'),
  ordersValidate.idRules(),
  ordersValidate.checkId,
  utilities.handleErrors(ordersController.deleteSingleOrder)
);

// Create a new order (admin, store owner, and inventory manager only)
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'inventoryManager'),
  ordersValidate.orderAddRules(),
  ordersValidate.checkOrder,
  utilities.handleErrors(ordersController.createSingleOrder)
);

// Update a single order (admin, store owner, and inventory manager only)
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'storeowner', 'inventoryManager'),
  ordersValidate.idRules(),
  ordersValidate.checkId,
  ordersValidate.orderUpdateRules(),
  ordersValidate.checkOrder,
  utilities.handleErrors(ordersController.updateSingleOrder)
);

module.exports = router;
