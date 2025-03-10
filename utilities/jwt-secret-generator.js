'use strict';

const crypto = require('crypto');

// Function to generate a 256-bit (32 bytes) secret
function generateJwtSecret() {
  const secret = crypto.randomBytes(32).toString('hex');
  console.log(`JWT_SECRET=${secret}`);
  return secret;
}

module.exports = generateJwtSecret;
