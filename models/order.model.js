'use strict';

const mongoose = require('mongoose');

// Create a schema for the orders collection
const orderSchema = new mongoose.Schema({
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  deliverer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candy_ordered: [
    {
      candy_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candy',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      }
    }
  ],
  total_price: {
    type: Number,
    required: true,
    min: [0, 'Total price must be a positive value']
  },
  date_created: {
    type: Date,
    default: Date.now,
    required: true
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  delivery_status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered'],
    default: 'pending'
  },
  delivery_address: {
    type: String,
    required: true,
    trim: true
  },
  delivery_contact: {
    type: String,
    required: true,
    trim: true
  },
  delivery_phone_number: {
    type: String,
    required: true,
    match: [/^\+1-\d{3}-\d{3}-\d{4}$/, 'Please enter a valid US phone number']
  }
});

module.exports = mongoose.model('Order', orderSchema);
