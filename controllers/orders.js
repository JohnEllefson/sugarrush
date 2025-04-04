'use strict';

const Order = require('../models/order.model');
const mongoose = require('mongoose');

// Retrieve all orders with optional filtering
const getAllOrders = async (req, res) => {
  try {
    const query = {};

    // Apply optional filters
    if (req.query.status) {
      query.delivery_status = req.query.status;
    }
    if (req.query.driver) {
      // Convert driver (deliverer_id) to ObjectId
      if (mongoose.Types.ObjectId.isValid(req.query.driver)) {
        query.deliverer_id = new mongoose.Types.ObjectId(req.query.driver);
      } else {
        return res.status(400).json({ message: 'Invalid driver ID format' });
      }
    }
    if (req.query.candy) {
      // Convert candy_ordered.candy_id to ObjectId
      if (mongoose.Types.ObjectId.isValid(req.query.candy)) {
        query['candy_ordered.candy_id'] = new mongoose.Types.ObjectId(req.query.candy);
      } else {
        return res.status(400).json({ message: 'Invalid candy ID format' });
      }
    }

    const orders = await Order.find(query);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No matching orders found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
  }
};

// Retrieve a single order by ID
const getSingleOrder = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve order', error: error.message });
  }
};

// Create a new order
const createSingleOrder = async (req, res) => {
  try {
    const order = new Order({
      store_id: req.body.store_id,
      deliverer_id: req.body.deliverer_id,
      candy_ordered: req.body.candy_ordered,
      total_price: req.body.total_price,
      date_created: req.body.date_created || new Date(),
      last_updated: new Date(),
      delivery_status: req.body.delivery_status,
      delivery_address: req.body.delivery_address,
      delivery_contact: req.body.delivery_contact,
      delivery_phone_number: req.body.delivery_phone_number
    });

    if (!order) {
      return res.status(400).json({ message: 'Order object is empty' });
    }

    await order.save();
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({ message: 'New order added', id: order._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Update a single order
const updateSingleOrder = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    // Ensure last_updated field is always updated
    req.body.last_updated = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// Delete a single order
const deleteSingleOrder = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  createSingleOrder,
  updateSingleOrder,
  deleteSingleOrder
};
