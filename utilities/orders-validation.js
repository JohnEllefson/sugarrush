'use strict';

const { body, param, validationResult } = require('express-validator');
const ordersValidate = {};

/*************************************
 *  MongoId validation rules
 *************************************/
ordersValidate.idRules = () => {
  return [param('id').isMongoId().withMessage('Invalid ID')];
};

/*************************************
 *  Check MongoId validation
 *************************************/
ordersValidate.checkId = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

/*************************************
 *  Order creation validation rules
 *************************************/
ordersValidate.orderAddRules = () => {
  return [
    body('store_id')
      .notEmpty()
      .withMessage('Store ID is required')
      .isMongoId()
      .withMessage('Invalid Store ID'),

    body('deliverer_id')
      .notEmpty()
      .withMessage('Deliverer ID is required')
      .isMongoId()
      .withMessage('Invalid Deliverer ID'),

    body('candy_ordered')
      .isArray({ min: 1 })
      .withMessage('Candy order must contain at least one item'),

    body('candy_ordered.*.candy_id')
      .notEmpty()
      .withMessage('Candy ID is required')
      .isMongoId()
      .withMessage('Invalid Candy ID'),

    body('candy_ordered.*.quantity')
      .notEmpty()
      .withMessage('Candy quantity is required')
      .isInt({ min: 1 })
      .withMessage('Candy quantity must be at least 1'),

    body('total_price')
      .notEmpty()
      .withMessage('Total price is required')
      .isFloat({ min: 0.01 })
      .withMessage('Total price must be a positive number'),

    body('date_created')
      .notEmpty()
      .withMessage('Date created is required')
      .isISO8601()
      .toDate()
      .withMessage('Date must be in ISO8601 format (YYYY-MM-DD)'),

    body('last_updated')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Last updated date must be in ISO8601 format (YYYY-MM-DDTHH:MM:SSZ)'),

    body('delivery_status')
      .optional()
      .trim()
      .isIn(['pending', 'shipped', 'delivered'])
      .withMessage('Delivery status must be one of: pending, shipped, or delivered'),

    body('delivery_address').notEmpty().withMessage('Delivery address is required').trim().escape(),

    body('delivery_contact').notEmpty().withMessage('Delivery contact is required').trim().escape(),

    body('delivery_phone_number')
      .notEmpty()
      .withMessage('Delivery phone number is required')
      .matches(/^\+1-\d{3}-\d{3}-\d{4}$/)
      .withMessage('Phone number must be in the format: +1-XXX-XXX-XXXX')
  ];
};

/*************************************
 *  Order update validation rules
 *************************************/
ordersValidate.orderUpdateRules = () => {
  return [
    body('store_id').optional().isMongoId().withMessage('Invalid Store ID'),

    body('deliverer_id').optional().isMongoId().withMessage('Invalid Deliverer ID'),

    body('candy_ordered')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Candy order must contain at least one item'),

    body('candy_ordered.*.candy_id').optional().isMongoId().withMessage('Invalid Candy ID'),

    body('candy_ordered.*.quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Candy quantity must be at least 1'),

    body('total_price')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Total price must be a positive number'),

    body('date_created')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Date must be in ISO8601 format (YYYY-MM-DD)'),

    body('last_updated')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Last updated date must be in ISO8601 format (YYYY-MM-DDTHH:MM:SSZ)'),

    body('delivery_status')
      .optional()
      .trim()
      .isIn(['pending', 'shipped', 'delivered'])
      .withMessage('Delivery status must be one of: pending, shipped, or delivered'),

    body('delivery_address').optional().trim().escape(),

    body('delivery_contact').optional().trim().escape(),

    body('delivery_phone_number')
      .optional()
      .matches(/^\+1-\d{3}-\d{3}-\d{4}$/)
      .withMessage('Phone number must be in the format: +1-XXX-XXX-XXXX')
  ];
};

/*************************************
 *  Order validation check
 *************************************/
ordersValidate.checkOrder = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

module.exports = ordersValidate;
