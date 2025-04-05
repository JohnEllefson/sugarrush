'use strict';

const Candy = require('../models/candy.model');

// Retrieve all candy items with optional filtering
const getAllCandy = async (req, res) => {
  try {
    const query = {};

    // Apply optional filters
    if (req.query.name) {
      query.name = new RegExp(req.query.name, 'i'); // Case-insensitive search
    }
    if (req.query.description) {
      query.description = new RegExp(req.query.description, 'i'); // Case-insensitive search
    }
    if (req.query.container) {
      query.shipping_container = req.query.container;
    }

    const candyItems = await Candy.find(query);

    if (!candyItems || candyItems.length === 0) {
      return res.status(404).json({ message: 'No matching candy items found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(candyItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve candy items', error: error.message });
  }
};

// Retrieve a single candy item by ID
const getSingleCandy = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    const candy = await Candy.findById(req.params.id);
    if (!candy) {
      return res.status(404).json({ message: 'Candy item not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(candy);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve candy item', error: error.message });
  }
};

// Create a new candy item
const createSingleCandy = async (req, res) => {
  try {
    const candy = new Candy({
      name: req.body.name,
      description: req.body.description,
      shipping_container: req.body.shipping_container,
      price_per_unit: req.body.price_per_unit,
      stock_quantity: req.body.stock_quantity,
      supplier_name: req.body.supplier_name,
      date_added: req.body.date_added || new Date()
    });

    if (!candy) {
      return res.status(400).json({ message: 'Candy object is empty' });
    }

    await candy.save();
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({ message: 'New candy item added', id: candy._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create candy item', error: error.message });
  }
};

// Update a single candy item
const updateSingleCandy = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    const updatedCandy = await Candy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedCandy) {
      return res.status(404).json({ message: 'Candy item not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: 'Candy item updated successfully', candy: updatedCandy });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update candy item', error: error.message });
  }
};

// Delete a single candy item
const deleteSingleCandy = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    const candy = await Candy.findByIdAndDelete(req.params.id);
    if (!candy) {
      return res.status(404).json({ message: 'Candy item not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: 'Candy item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete candy item', error: error.message });
  }
};

module.exports = {
  getAllCandy,
  getSingleCandy,
  createSingleCandy,
  updateSingleCandy,
  deleteSingleCandy
};
