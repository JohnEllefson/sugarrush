'use strict';

const { body, param, validationResult } = require('express-validator');
const storesValidate = {};

/*************************************
 *  MongoId validation rules
 *************************************/
storesValidate.idRules = () => {
  return [param('id').isMongoId().withMessage('Invalid ID')];
};

/*************************************
 *  Check MongoId validation
 *************************************/
storesValidate.checkId = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

/*************************************
 *  Store creation validation rules
 *************************************/
storesValidate.storeAddRules = () => {
  return [
    body('name').trim().escape().notEmpty().withMessage('Store name is required'),

    body('street').trim().escape().notEmpty().withMessage('Street address is required'),

    body('city').trim().escape().notEmpty().withMessage('City is required'),

    body('state')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('State is required')
      .isLength({ min: 2, max: 2 })
      .withMessage('State must be a 2-letter abbreviation'),

    body('zip_code')
      .trim()
      .notEmpty()
      .withMessage('ZIP code is required')
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('ZIP code must be in the format: 12345 or 12345-6789'),

    body('phone_number')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+1-\d{3}-\d{3}-\d{4}$/)
      .withMessage('Phone number must be in the format: +1-XXX-XXX-XXXX'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email address'),

    body('owner_id')
      .notEmpty()
      .withMessage('Owner ID is required')
      .isMongoId()
      .withMessage('Invalid Owner ID'),

    body('operating_hours').trim().escape().notEmpty().withMessage('Operating hours are required'),

    body('website')
      .trim()
      .notEmpty()
      .withMessage('Website is required')
      .isURL()
      .withMessage('Must be a valid URL')
  ];
};

/*************************************
 *  Store update validation rules
 *************************************/
storesValidate.storeUpdateRules = () => {
  return [
    body('name').optional().trim().escape().notEmpty().withMessage('Store name cannot be empty'),

    body('street')
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Street address cannot be empty'),

    body('city').optional().trim().escape().notEmpty().withMessage('City cannot be empty'),

    body('state')
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage('State cannot be empty')
      .isLength({ min: 2, max: 2 })
      .withMessage('State must be a 2-letter abbreviation'),

    body('zip_code')
      .optional()
      .trim()
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('ZIP code must be in the format: 12345 or 12345-6789'),

    body('phone_number')
      .optional()
      .trim()
      .matches(/^\+1-\d{3}-\d{3}-\d{4}$/)
      .withMessage('Phone number must be in the format: +1-XXX-XXX-XXXX'),

    body('email').optional().trim().isEmail().withMessage('Must be a valid email address'),

    body('owner_id').optional().isMongoId().withMessage('Invalid Owner ID'),

    body('operating_hours')
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Operating hours cannot be empty'),

    body('website').optional().trim().isURL().withMessage('Must be a valid URL')
  ];
};

/*************************************
 *  Store validation check
 *************************************/
storesValidate.checkStore = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

module.exports = storesValidate;
