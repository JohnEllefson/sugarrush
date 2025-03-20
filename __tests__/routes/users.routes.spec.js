'use strict';

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');

let testUser;
let authToken;

beforeAll(async () => {
  // Create a mock user in the test database.
  // The test database was started in jest.setup.js
  testUser = await User.create({
    googleId: 'test-google-id',
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
    preferred_name: 'John Doe',
    phone_number: '+1-555-555-5555'
  });

  // Generate a valid JWT for authentication
  authToken = jwt.sign({ userId: testUser._id, role: 'admin' }, process.env.JWT_SECRET || 'mocksecret', { expiresIn: '1h' });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({});
  }
});

/******************************************
 *** Begin Test Suite: Users Routes     ***
 ******************************************/
describe('Users API Routes', () => {

  // Test 1: GET /users should return all users (admin only)
  test('GET /users should return all users (admin only)', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test 2: GET /users/:id should return a single user
  test('GET /users/:id should return a single user', async () => {
    const res = await request(app)
      .get(`/users/${testUser._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  // Test 3: PUT /users/:id should allow user to update their own profile
  test('PUT /users/:id should allow user to update their own profile', async () => {
    const res = await request(app)
      .put(`/users/${testUser._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ preferred_name: 'Updated Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.preferred_name).toBe('Updated Name');
  });

  // Test 4: DELETE /users/:id should allow admin to delete a user
  test('DELETE /users/:id should allow admin to delete a user', async () => {
    const res = await request(app)
      .delete(`/users/${testUser._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    const deletedUser = await User.findById(testUser._id);
    expect(deletedUser).toBeNull();
  });

  // Test 5: Unauthorized access to GET /users should return 403
  test('GET /users should return 403 for unauthorized users', async () => {
    const res = await request(app)
    .get('/users')
    .set('Authorization', 'Bearer invalidtoken');
  
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: 'Invalid token. Access denied.' });
  });

  // Test 6: Unauthorized access to GET /users/:id should return 401
  test('GET /users/:id should return 401 for unauthorized users', async () => {
    const res = await request(app)
      .get(`/users/${testUser._id}`)

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Authorization header missing. Access denied.' });
  });

  // Test 7: Unauthorized PUT /users/:id should return 401
  test('PUT /users/:id should return 401 for unauthorized users', async () => {
    const res = await request(app)
      .put(`/users/${testUser._id}`)
      .send({ preferred_name: 'Not In Database' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Authorization header missing. Access denied.' });
  });

  // Test 8: Unauthorized DELETE /users/:id should return 401
  test('DELETE /users/:id should return 401 for unauthorized users', async () => {
    const res = await request(app)
      .delete(`/users/${testUser._id}`)

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Authorization header missing. Access denied.' });
  });
});
