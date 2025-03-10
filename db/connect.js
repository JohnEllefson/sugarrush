'use strict';

// Import the required modules
const mongoose = require('mongoose');

// Load the connection string from .env
const uri = process.env.MONGODB_URI;

// Create a database object to store the connection
let db;

// Connect to MongoDB using Mongoose
async function connectMongoose() {
  try {
    if (!db) {
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
