'use strict';

const Order = require('../models/order.model');
const mongoose = require('mongoose');

// Retrieve all orders with optional filtering
const getAllOrders = async (_req, _res) => {};

// Retrieve a single order by ID
const getSingleOrder = async (_req, _res) => {};

// Create a new order
const createSingleOrder = async (_req, _res) => {};

// Update a single order
const updateSingleOrder = async (_req, _res) => {};

// Delete a single order
const deleteSingleOrder = async (_req, _res) => {};

module.exports = {
  getAllOrders,
  getSingleOrder,
  createSingleOrder,
  updateSingleOrder,
  deleteSingleOrder
};
