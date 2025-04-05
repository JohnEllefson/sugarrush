"use strict";

// Import the required modules
const express = require("express");
const candyController = require("../controllers/candy");
const candyValidate = require("../utilities/candy-validation");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../utilities/authentication");
const utilities = require("../utilities/index");

// Create a new router
const router = express.Router();

// Return all candy items (admin, store owner, driver, and inventory manager only)
router.get(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "storeowner", "driver", "inventoryManager"),
  utilities.handleErrors(candyController.getAllCandy)
);

// Return a single candy item (admin, store owner, driver, and inventory manager only)
router.get(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin", "storeowner", "driver", "inventoryManager"),
  candyValidate.idRules(),
  candyValidate.checkId,
  utilities.handleErrors(candyController.getSingleCandy)
);

// Delete a single candy item (admin and inventory manager only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin", "inventoryManager"),
  candyValidate.idRules(),
  candyValidate.checkId,
  utilities.handleErrors(candyController.deleteSingleCandy)
);

// Create a new candy item (admin and inventory manager only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "inventoryManager"),
  candyValidate.candyAddRules(),
  candyValidate.checkCandy,
  utilities.handleErrors(candyController.createSingleCandy)
);

// Update a single candy item (admin and inventory manager only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin", "inventoryManager"),
  candyValidate.idRules(),
  candyValidate.checkId,
  candyValidate.candyUpdateRules(),
  candyValidate.checkCandy,
  utilities.handleErrors(candyController.updateSingleCandy)
);

module.exports = router;
