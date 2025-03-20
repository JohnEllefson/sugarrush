'use strict';

require('../../jest.setup');
const request = require('supertest');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const authController = require('../../controllers/auth');
const User = require('../../models/user.model');

jest.mock('passport', () => ({
  authenticate: jest.fn(() => (req, res, next) => next()),
  use: jest.fn(),
  initialize: jest.fn(),
  session: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt-token'),
}));

jest.mock('../../models/user.model');

/******************************************
*** Begin Tests: Auth Controller       ***
******************************************/
describe('Auth Controller Tests', () => {
  let testUser;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  
    testUser = {
      _id: 'mock-user-id',
      googleId: 'mock-google-id',
      username: 'mockuser',
      email: 'mockuser@example.com',
      role: 'admin',
      save: jest.fn().mockResolvedValue(testUser),
    };
  
    // Mock findOne to return testUser when requested
    User.findOne.mockImplementation(async ({ googleId }) => {
      return googleId === 'mock-google-id' ? testUser : null;
    });
  
    // Mock User constructor
    User.mockImplementation(({ googleId, username, email, role }) => {
      return {
        _id: 'mock-user-id',
        googleId,
        username,
        email,
        role,
        save: jest.fn().mockResolvedValue(this),
      };
    });
  
    // Ensure save correctly resolves with a valid object
    User.prototype.save.mockImplementation(function () {
      return Promise.resolve(this);
    });
  });  

  // Test 1: Google OAuth login flow
  test('Google OAuth callback should create a new user if not found', async () => {
    User.findOne.mockImplementation(async ({ googleId }) => {
      return googleId === 'mock-google-id' ? null : testUser;
    });    

    const req = {
      user: {
        googleAccessToken: 'mock-access-token',
        googleId: 'mock-google-id',
        username: 'mockuser',
        email: 'mockuser@example.com',
      },
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await authController.googleCallbackHandler(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ googleId: 'mock-google-id' });
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        googleAccessToken: 'mock-access-token',
        userId: expect.stringMatching(/^mock-user-id|[0-9a-fA-F]{24}$/),
        username: 'mockuser',
        email: 'mockuser@example.com',
        role: 'admin',
      }),
      expect.any(String),
      expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login successful',
      token: 'mocked-jwt-token',
      user: { username: 'mockuser', email: 'mockuser@example.com', role: 'admin' },
    });
  });

  // Test 2: Google OAuth callback with existing user
  test('Google OAuth callback should update user details if they changed', async () => {
    User.findOne.mockResolvedValue(testUser);

    const req = {
      user: {
        googleAccessToken: 'mock-access-token',
        googleId: 'mock-google-id',
        username: 'newusername',
        email: 'newemail@example.com',
      },
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    console.log('Mocked User:', User.findOne.mock.results);

    await authController.googleCallbackHandler(req, res);

    expect(testUser.username).toBe('newusername');
    expect(testUser.email).toBe('newemail@example.com');
    expect(testUser.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Login successful' })
    );
  });

  // Test 3: Google OAuth callback with error
  test('Google OAuth callback should return 500 on internal error', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    const req = {
      user: {
        googleAccessToken: 'mock-access-token',
        googleId: 'mock-google-id',
        username: 'mockuser',
        email: 'mockuser@example.com',
      },
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    console.log('Mocked User:', User.findOne.mock.results);

    await authController.googleCallbackHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
