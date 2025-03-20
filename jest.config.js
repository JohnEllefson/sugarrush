'use strict';

module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 60000, // Timeout for MongoDB Memory Server
  globals: {
    'process.env.NODE_ENV': 'test' // Set environment for testing
  }
};
