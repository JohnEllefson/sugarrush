'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferred_name: { type: String, default: '' },
  phone_number: { type: String, default: '' },
  role: {
    type: String,
    enum: ['admin', 'storeowner', 'inventoryManager', 'driver', 'temporary'],
    default: 'user'
  },
  date_created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
