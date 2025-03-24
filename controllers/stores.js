'use strict';

const Store = require('../models/store.model');
const mongoose = require('mongoose');

// Retrieve all stores with optional filtering
const getAllStores = async (req, res) => {
  try {
    const query = {};

    // Apply optional filters
    if (req.query.name) {
      query.name = new RegExp(req.query.name, 'i'); // Case-insensitive search
    }
    if (req.query.street) {
      query.street = new RegExp(req.query.street, 'i'); // Case-insensitive search
    }
    if (req.query.city) {
      query.city = new RegExp(req.query.city, 'i'); // Case-insensitive search
    }
    if (req.query.state) {
      query.state = new RegExp(req.query.state, 'i'); // Case-insensitive search
    }
    if (req.query.zip_code) {
      query.zip_code = new RegExp(req.query.zip_code, 'i'); // Case-insensitive search
    }
    if (req.query.phone) {
      query.phone = new RegExp(req.query.phone_number, 'i'); // Case-insensitive search
    }
    if (req.query.email) {
      query.email = new RegExp(req.query.email, 'i'); // Case-insensitive search
    }
    if (req.query.owner_id) {
      query.owner_id = new RegExp(req.query.owner_id, 'i'); // Case-insensitive search
    }
    if (req.query.operating_hours) {
      query.operating_hours = new RegExp(req.query.operating_hours, 'i'); // Case-insensitive search
    }
    if (req.query.website) {
      query.website = new RegExp(req.query.website, 'i'); // Case-insensitive search
    }
    const stores = await Store.find(query);

    // Check if stores were found
    if (!stores) {
      return res.status(404).json({ message: 'No matching stores found.' });
    }
    //
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stores.', error: error.message });
  }
};

// Retrieve a single store by ID
const getSingleStore = async (req, res) => {};

// Create a new store
const createSingleStore = async (req, res) => {};

// Update a single store
const updateSingleStore = async (req, res) => {};

// Delete a single store
const deleteSingleStore = async (req, res) => {};

module.exports = {
  getAllStores,
  getSingleStore,
  createSingleStore,
  updateSingleStore,
  deleteSingleStore
};
