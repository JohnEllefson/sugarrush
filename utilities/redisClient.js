'use strict';

const { Redis } = require('@upstash/redis');

let redisClient;

// Skip Redis in test mode
if (process.env.NODE_ENV === 'test') {
  console.log('Skipping Redis connection in test environment');
  redisClient = {
    get: async () => null,
    set: async () => null,
    del: async () => null
  };
} else {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });

  console.log('Connected to Upstash Redis');
}

module.exports = redisClient;
