'use strict';

const { body, param, validationResult } = require('express-validator');
const usersValidate = {};

/*************************************
 *  MongoId validation rules
 *************************************/
usersValidate.idRules = () => {
  return [param('id').isMongoId().withMessage('Invalid ID')];
};

/*************************************
 *  Check MongoId validation
 *************************************/
usersValidate.checkId = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

/*************************************
 *  User validation rules
 *************************************/
usersValidate.userRules = () => {
  return [
    body('preferred_name')
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage('Preferred name must be at least 1 character'),

    body('role')
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .isIn(['admin', 'storeowner', 'driver', 'inventoryManager', 'temporary'])
      .withMessage(
        'Role must be one of the following: temporary, storeowner, driver, inventoryManager, or admin'
      ),

    body('phone_number')
      .optional()
      .trim()
      .matches(/^\+1-\d{3}-\d{3}-\d{4}$/)
      .withMessage('Phone number must be in the format: +1-XXX-XXX-XXXX')
  ];
};

/*************************************
 *  Army validation check
 *************************************/
usersValidate.checkUser = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

module.exports = usersValidate;
