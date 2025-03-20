'use strict';

const express = require('express');
const router = express.Router();
const swaggerDocs = require('./swagger');
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const candyRoutes = require('./candy');
const storesRoutes = require('./stores');
const ordersRoutes = require('./orders');
const utilities = require('../utilities/index');

// Mount the entry point route to display the main page
router.get('/', require('../controllers/index').buildIndex);

// Mount the Swagger routes to serve the API documentation
router.use('/', utilities.handleErrors(swaggerDocs));

// Mount the sub-router to handle all routes under /authRoutes
router.use('/auth', utilities.handleErrors(authRoutes));

// Mount a sub-router to handle all routes under /user
router.use('/users', utilities.handleErrors(usersRoutes));

// Mount a sub-router to handle all routes under /candy
router.use('/candy', utilities.handleErrors(candyRoutes));

// Mount a sub-router to handle all routes under /stores
router.use('/stores', utilities.handleErrors(storesRoutes));

// Mount a sub-router to handle all routes under /orders
router.use('/orders', utilities.handleErrors(ordersRoutes));

module.exports = router;
