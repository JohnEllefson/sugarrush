'use strict';

const Store = require('../models/store.model');
const mongoose = require('mongoose');

// Retrieve all stores with optional filtering
const getAllStores = async (_req, _res) => {};

// Retrieve a single store by ID
const getSingleStore = async (_req, _res) => {};

// Create a new store
const createSingleStore = async (_req, _res) => {};

// Update a single store
const updateSingleStore = async (_req, _res) => {};

// Delete a single store
const deleteSingleStore = async (_req, _res) => {};

module.exports = {
  getAllStores,
  getSingleStore,
  createSingleStore,
  updateSingleStore,
  deleteSingleStore
};
