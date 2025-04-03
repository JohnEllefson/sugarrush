'use strict';

const Order = require('../models/order.model');
const mongoose = require('mongoose');

// Retrieve all orders with optional filtering
const getAllOrders = async (req, res) => {
  try {
    const query = {};

    // Apply optional filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.customer) {
      query.customerName = new RegExp(req.query.customer, 'i'); // Case-insensitive search
    }

    let orders = await Order.find(query);

    // Restrict access: Only admins see all orders; others see only their orders
    if (req.user.role !== 'admin') {
      orders = orders.filter((order) => order.customerId.toString() === req.user.userId);
    }

    // If no orders are found after filtering, return 404
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No matching orders found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving orders', error: err.message });
  }
};

// Retrieve a single order by ID
const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restrict access: Only allow the owner or an admin to view the order
    if (req.user.role !== 'admin' && order.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving order', error: err.message });
  }
};

// Create a new order
const createSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restrict access: Only allow the owner or an admin to view the order
    if (req.user.role !== 'admin' && order.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving order', error: err.message });
  }
};

// Update a single order
const updateSingleOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restrict access: Only allow the owner or an admin to update the order
    if (req.user.role !== 'admin' && updatedOrder.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order', error: err.message });
  }
};

// Delete a single order
const deleteSingleOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restrict access: Only allow the owner or an admin to delete the order
    if (req.user.role !== 'admin' && deletedOrder.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting order', error: err.message });
  }
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  createSingleOrder,
  updateSingleOrder,
  deleteSingleOrder
};
