"use strict";

const { body, param, validationResult } = require("express-validator");
const candyValidate = {};

/*************************************
 *  MongoId validation rules
 *************************************/
candyValidate.idRules = () => {
  return [param("id").isMongoId().withMessage("Invalid ID")];
};

/*************************************
 *  Check MongoId validation
 *************************************/
candyValidate.checkId = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

/*************************************
 *  Candy creation validation rules
 *************************************/
candyValidate.candyAddRules = () => {
  return [
    body("name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Candy name is required"),

    body("description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required"),

    body("shipping_container")
      .optional()
      .trim()
      .escape()
      .isIn(["pallet", "crate", "cardboardBox", "displayBox"])
      .withMessage(
        "Shipping container must be one of: pallet, crate, cardboardBox, or displayBox"
      ),

    body("price_per_unit")
      .notEmpty()
      .withMessage("Price per unit is required")
      .isFloat({ min: 0.01 })
      .withMessage("Price per unit must be a positive number"),

    body("stock_quantity")
      .notEmpty()
      .withMessage("Stock quantity is required")
      .isInt({ min: 0 })
      .withMessage("Stock quantity must be a non-negative integer"),

    body("supplier_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Supplier name is required")
      .isLength({ min: 2 })
      .withMessage("Supplier name must be at least 2 characters long"),

    body("date_added")
      .notEmpty()
      .withMessage("Date added is required")
      .isISO8601()
      .toDate()
      .withMessage("Date must be in ISO8601 format (YYYY-MM-DD)"),
  ];
};

/*************************************
 *  Candy update validation rules
 *************************************/
candyValidate.candyUpdateRules = () => {
  return [
    body("name")
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Candy name cannot be empty"),

    body("description")
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description cannot be empty"),

    body("shipping_container")
      .optional()
      .trim()
      .escape()
      .isIn(["pallet", "crate", "cardboardBox", "displayBox"])
      .withMessage(
        "Shipping container must be one of: pallet, crate, cardboardBox, or displayBox"
      ),

    body("price_per_unit")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Price per unit must be a positive number"),

    body("stock_quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock quantity must be a non-negative integer"),

    body("supplier_name")
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Supplier name cannot be empty")
      .isLength({ min: 2 })
      .withMessage("Supplier name must be at least 2 characters long"),

    body("date_added")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Date must be in ISO8601 format (YYYY-MM-DD)"),
  ];
};

/*************************************
 *  Candy validation check
 *************************************/
candyValidate.checkCandy = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

module.exports = candyValidate;
