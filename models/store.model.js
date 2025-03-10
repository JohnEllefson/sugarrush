'use strict';

const mongoose = require('mongoose');

// Create a schema for the stores collection
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip_code: {
    type: String,
    required: true,
    match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
  },
  phone_number: {
    type: String,
    required: true,
    match: [/^\+1-\d{3}-\d{3}-\d{4}$/, 'Please enter a valid US phone number']
  },
  email: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  operating_hours: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  }
});

module.exports = mongoose.model('Store', storeSchema);
