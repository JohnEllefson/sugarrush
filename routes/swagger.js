'use strict';

const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger-output.json');

// Determine the base URL dynamically based on environment
const BASE_URL =
  process.env.NODE_ENV === 'production' ? process.env.REMOTE_BASE_URL : process.env.LOCAL_BASE_URL;

// Update Swagger OAuth2 security schema with the correct URLs
swaggerDocument.components.securitySchemes.OAuth2.flows.authorizationCode.authorizationUrl = `${BASE_URL}/auth/google`;
swaggerDocument.components.securitySchemes.OAuth2.flows.authorizationCode.tokenUrl = `${BASE_URL}/auth/google/callback`;

// Define the server URL for Swagger
const SERVER_URL = [{ url: BASE_URL, description: 'Host server' }];

// Update Swagger document dynamically at runtime with server information
swaggerDocument.servers = SERVER_URL;

// Remove OAuth routes from Swagger documentation
if (swaggerDocument.paths['/auth/google']) {
  delete swaggerDocument.paths['/auth/google'];
}
if (swaggerDocument.paths['/auth/google/callback']) {
  delete swaggerDocument.paths['/auth/google/callback'];
}

// Remove the "auth" tag if no remaining paths use it
if (swaggerDocument.tags) {
  swaggerDocument.tags = swaggerDocument.tags.filter((tag) => tag.name !== 'auth');
}

router.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    OAuth: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scopes: ['openid', 'profile', 'email'],
      usePkceWithAuthorizationCodeGrant: true,
      useBasicAuthenticationWithAccessCodeGrant: true
    },
    oauth2RedirectUrl: `${BASE_URL}/api-docs/oauth2-redirect.html`
  })
);

module.exports = router;
