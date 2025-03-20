'use strict';

// Import the required modules
const mongoose = require('mongoose');

// Detect if running in Jest test environment
const isTest = process.env.NODE_ENV === 'test';

let db;

// Connect to MongoDB using Mongoose
async function connectMongoose() {
  try {
    if (isTest) {
      console.log('Skipping real database connection (Jest test environment)');
      return; // Prevent connecting to the real database during testing
    }

    if (!db) {
      const uri = process.env.MONGODB_URI;
      await mongoose.connect(uri);

      db = mongoose.connection;
      console.log('Connected to MongoDB using Mongoose!');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB using Mongoose:', error);
    throw error;
  }
}

// Return the database object
function getDb() {
  return db;
}

module.exports = { connectMongoose, getDb };
