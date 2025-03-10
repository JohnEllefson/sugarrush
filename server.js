'use strict';

// Import the required modules
require('dotenv').config(); // This must load before other modules
const express = require('express');
const https = require('https');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const mongodb = require('./db/connect');
const routes = require('./routes/index');
const utilites = require('./utilities/index');

// Initialize Passport and restore authentication state
require('./auth/passportConfig');

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

// Add CORS preflight handling
app.options('*', cors());

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

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global response headers
app.use('/', (_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Routes
app.use('/', utilites.handleErrors(routes));

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

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
