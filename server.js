'use strict';

// Import the required modules
require('dotenv').config(); // Load environment variables first
const express = require('express');
const https = require('https');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const mongodb = require('./db/connect');
const routes = require('./routes/index');
const utilities = require('./utilities/index');

// Initialize Passport and restore authentication state
require('./auth/passportConfig');

// Detect if running in a test environment
const isTest = process.env.NODE_ENV === 'test';

// Ensure all Mongoose schemas are registered
require('./models/candy.model');
require('./models/order.model');
require('./models/store.model');
require('./models/user.model');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 8080;
const httpsPort = process.env.HTTPS_PORT || 8443;

// Load SSL certificates only for local development
let sslOptions = null;
if (!isProduction) {
  try {
    sslOptions = {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem')
    };
  } catch (err) {
    console.warn('SSL certificates not found. Running without HTTPS locally.', err);
    sslOptions = null; // Allow fallback to HTTP
  }
}

// CORS configuration
const allowedOrigins = [
  process.env.LOCAL_BASE_URL,
  `${process.env.LOCAL_BASE_URL}/api-docs`,
  process.env.REMOTE_BASE_URL,
  `${process.env.REMOTE_BASE_URL}/api-docs`
];

// Mount CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// CORS preflight handling
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// Middleware setup
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

// Passport middleware (skip during tests)
if (!isTest) {
  app.use(passport.initialize());
  app.use(passport.session());
}

// Global response headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  next();
});

// Routes
app.use('/', utilities.handleErrors(routes));

// Health check route
app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Test route to force an internal server error
app.get('/cause-internal-error', (_req, _res, next) => {
  next(new Error('Forced internal server error'));
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Prevent Express from starting if running Jest tests
if (!isTest) {
  // Start HTTP server
  const httpServer = app.listen(port, async () => {
    try {
      await mongodb.connectMongoose();
      console.log(`HTTP server running at http://localhost:${port}`);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  });

  // Start HTTPS server (only for local development)
  let httpsServer = null;
  if (sslOptions && !isProduction) {
    httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(httpsPort, () => {
      console.log(`HTTPS server running at https://localhost:${httpsPort}`);
    });
  }

  // Graceful shutdown handlers
  const shutdown = () => {
    console.log('Shutting down servers...');
    httpServer.close(() => console.log('HTTP server closed.'));
    if (httpsServer) {
      httpsServer.close(() => console.log('HTTPS server closed.'));
    }
  };

  process.once('SIGUSR2', () => {
    shutdown();
    process.kill(process.pid, 'SIGUSR2');
  });

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Export for testing
module.exports = app;
