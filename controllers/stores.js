'use strict';

const Store = require('../models/store.model');

// Retrieve all stores with optional filtering
const getAllStores = async (req, res) => {
  try {
    const query = createStoreFilter(req);

    const stores = await Store.find(query);

    // Check if stores were found
    if (!stores) {
      return res.status(404).json({ message: 'No matching stores found.' });
    }
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stores.', error: error.message });
  }
};

// Retrieve a single store by ID
const getSingleStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    // Check if store was found
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving store.', error: error.message });
  }
};

// Get stores by filter
const createStoreFilter = (req) => {
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
  return query;
};

// Create a new store
const createSingleStore = async (req, res) => {
  try {
    const store = new Store({
      name: req.body.name,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zip_code: req.body.zip_code,
      phone_number: req.body.phone_number,
      email: req.body.email,
      owner_id: req.body.owner_id,
      operating_hours: req.body.operating_hours,
      website: req.body.website
    });

    const newStore = await store.save();
    res.status(201).json({ message: 'Store was successfully created.', newStore });
  } catch (error) {
    res.status(500).json({ message: 'Error creating store.', error: error.message });
  }
};

// Update a single store
const updateSingleStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    // Check if store was found
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    store.name = req.body.name;
    store.street = req.body.street;
    store.city = req.body.city;
    store.state = req.body.state;
    store.zip_code = req.body.zip_code;
    store.phone_number = req.body.phone_number;
    store.email = req.body.email;
    store.owner_id = req.body.owner_id;
    store.operating_hours = req.body.operating_hours;
    store.website = req.body.website;

    const updatedStore = await store.save();
    res.status(200).json({ message: 'Store updated successfully.', updatedStore });
  } catch (error) {
    res.status(500).json({ message: 'Error updating store.', error: error.message });
  }
};

// Delete a single store
const deleteSingleStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    // Check if store was found
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    await store.remove();
    res.status(200).json({ message: 'Store deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting store.', error: error.message });
  }
};

module.exports = {
  getAllStores,
  getSingleStore,
  createSingleStore,
  updateSingleStore,
  deleteSingleStore
};
