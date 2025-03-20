'use strict';

const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const User = require('../../models/user.model');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const redisClient = require('../../utilities/redisClient');
const {
  getAllUsers,
  getSingleUser,
  updateSingleUser,
  deleteSingleUser,
  userLogout
} = require('../../controllers/users');

jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('../../utilities/redisClient');

let testUser1;
let testUser2;

beforeAll(async () => {
  // Create mock users in the test database.
  // The test database was started in jest.setup.js
  testUser1 = await User.create({
    googleId: 'test-google-id-1',
    username: 'Test User 1',
    email: 'test1@example.com',
    role: 'admin',
    preferred_name: 'John',
    phone_number: '+1-555-555-5555'
  });

  testUser2 = await User.create({
    googleId: 'test-google-id-2',
    username: 'Test User 2',
    email: 'test2@example.com',
    role: 'temporary',
    preferred_name: 'David',
    phone_number: '+1-777-777-7777'
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({});
  }
});

/******************************************
 *** Begin Test Suite: Users Controller ***
 ******************************************/
describe('Users Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

 /******************************************
  *** Begin Tests: getAllUsers           ***
  ******************************************/
  // Test 1: Ensure all users are returned when requested by an admin
  test('getAllUsers should return users', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.length).toBe(2);
    expect(data[0]).toHaveProperty('username', 'Test User 1');
    expect(data[1]).toHaveProperty('username', 'Test User 2');
  });

  // Test 2: Ensure users with a specific role are returned
  test('getAllUsers should return users with a specific role', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      query: { role: 'temporary' },
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.length).toBe(1);
    expect(data[0]).toHaveProperty('role', 'temporary');
  });

  // Test 3: Ensure users matching the user name are returned
  test('getAllUsers should return users matching the user name', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      query: { name: 'Test User 2' },
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.length).toBe(1);
    expect(data[0]).toHaveProperty('username', 'Test User 2');
  });

  // Test 4: Ensure a 404 error is returned when no users match the query
  test('getAllUsers should return 404 when no users match the query', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      query: { name: 'Nonexistent User' },
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'No matching users found' });
  });

  // Test 5: Ensure a regular user can only see their own data
  test('getAllUsers should return only the user making the request if they are not an admin', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      user: { role: 'temporary', userId: testUser2._id.toString() }
    });
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.length).toBe(1);
    expect(data[0]._id).toBe(testUser2._id.toString());
  });

  // Test 6: Ensure a regular user receives 404 if no matching users exist after filtering
  test('getAllUsers should return 404 if no matching users exist after filtering', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      user: { role: 'temporary', userId: new mongoose.Types.ObjectId().toString() }
    });
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'No matching users found' });
  });

  // Test 7: Ensure a server error returns status 500
  test('getAllUsers should return 500 on server error', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    // Simulate an error by making User.find() throw an error
    jest.spyOn(User, 'find').mockRejectedValueOnce(new Error('Database failure'));

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Error retrieving users', error: 'Database failure' });

    // Restore the original function
    User.find.mockRestore();
  });

  /******************************************
   *** Begin Tests: getSingleUser         ***
  ******************************************/
  // Test 1: Ensure a user is returned when requested by an admin
  test('getSingleUser should return a user when requested by an admin', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: { id: testUser2._id.toString() },
      user: { role: 'admin', userId: testUser1._id.toString() }
    });
    const res = httpMocks.createResponse();

    await getSingleUser(req, res);

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('email', 'test2@example.com');
  });

  // Test 2: Ensure a user is only able to view their own profile
  test('getSingleUser should allow a user to view their own profile', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: { id: testUser2._id.toString() },
      user: { role: 'temporary', userId: testUser2._id.toString() }
    });
    const res = httpMocks.createResponse();

    await getSingleUser(req, res);

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data._id).toBe(testUser2._id.toString());
  });

  // Test 3: Ensure a user cannot view another user's profile unless they are an admin
  test('getSingleUser should return 403 if a user tries to view another user’s profile', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: { id: testUser1._id.toString() },
      user: { role: 'temporary', userId: testUser2._id.toString() }
    });
    const res = httpMocks.createResponse();

    await getSingleUser(req, res);

    expect(res.statusCode).toBe(403);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Only the user or an admin can view this user' });
  });

  // Test 4: Ensure 400 error is returned when ID parameter is missing
  test('getSingleUser should return 400 if ID parameter is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: {},
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await getSingleUser(req, res);

    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'ID parameter is required' });
  });

  // Test 5: Ensure 404 error is returned when user is not found
  test('getSingleUser should return 404 if user is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const req = httpMocks.createRequest({
      method: 'GET',
      params: { id: nonExistentId },
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await getSingleUser(req, res);

    expect(res.statusCode).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'User not found' });
  });

  // Test 6: Ensure 500 error is returned when an internal server error occurs
  test('getSingleUser should return 500 on server error', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: { id: testUser1._id.toString() },
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    // Simulate an error by making User.findById throw an error
    jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database failure'));

    await getSingleUser(req, res);

    expect(res.statusCode).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Error retrieving user', error: 'Database failure' });

    // Restore the original function
    User.findById.mockRestore();
  });

  /******************************************
   *** Begin Tests: updateSingleUser      ***
  ******************************************/
  // Test 1: Ensure update fails with a 400 error when ID parameter is missing
  test('updateSingleUser should return 400 if ID parameter is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: {},
      user: { role: 'admin' },
      body: { preferred_name: 'Updated Name' }
    });
    const res = httpMocks.createResponse();

    await updateSingleUser(req, res);

    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'ID parameter is required' });
  });

  // Test 2: Ensure update fails with a 404 error when the user is not found
  test('updateSingleUser should return 404 if user is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: nonExistentId },
      user: { role: 'admin' },
      body: { preferred_name: 'Updated Name' }
    });
    const res = httpMocks.createResponse();

    await updateSingleUser(req, res);

    expect(res.statusCode).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'User not found' });
  });

  // Test 3: Ensure that only admins can update the user role
  test('updateSingleUser should return 403 if a non-admin tries to update a user role', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: testUser2._id.toString() },
      user: { role: 'temporary', userId: testUser2._id.toString() },
      body: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await updateSingleUser(req, res);

    expect(res.statusCode).toBe(403);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Only admins can update user roles' });
  });

  // Test 4: Ensure that only the user or an admin can update preferred_name or phone_number
  test('updateSingleUser should return 403 if a user tries to update another user’s preferred_name or phone_number', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: testUser1._id.toString() },
      user: { role: 'temporary', userId: testUser2._id.toString() },
      body: { preferred_name: 'Unauthorized Update', phone_number: '+1-888-888-8888' }
    });
    const res = httpMocks.createResponse();

    await updateSingleUser(req, res);

    expect(res.statusCode).toBe(403);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Only the user or an admin can update this information' });
  });

  // Test 5: Ensure update does not modify googleId, username, or email
  test('updateSingleUser should not modify googleId, username, or email', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: testUser2._id.toString() },
      user: { role: 'admin', userId: testUser1._id.toString() },
      body: {
        preferred_name: 'Updated Name',
        googleId: 'new-google-id',
        username: 'newUsername',
        email: 'newemail@example.com'
      }
    });
    const res = httpMocks.createResponse();

    await updateSingleUser(req, res);

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.user.preferred_name).toBe('Updated Name');
    expect(data.user.googleId).toBe(testUser2.googleId); // Should remain unchanged
    expect(data.user.username).toBe(testUser2.username); // Should remain unchanged
    expect(data.user.email).toBe(testUser2.email); // Should remain unchanged
  });

    // Test 6: Ensure admin can update the phone number
    test('updateSingleUser admin can update the phone number', async () => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: { id: testUser2._id.toString() },
        user: { role: 'admin', userId: testUser1._id.toString() },
        body: {
          phone_number: '+1-888-888-8888',
        }
      });
      const res = httpMocks.createResponse();
  
      await updateSingleUser(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.user.phone_number).toBe('+1-888-888-8888');
    });

  // Test 7: Ensure a server error returns status 500
  test('updateSingleUser should return 500 on server error', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      params: { id: testUser1._id.toString() },
      user: { role: 'admin' },
      body: { preferred_name: 'Updated Name' }
    });
    const res = httpMocks.createResponse();

    // Simulate an error by making User.findByIdAndUpdate throw an error
    jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Database failure'));

    await updateSingleUser(req, res);

    expect(res.statusCode).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Error updating user', error: 'Database failure' });

    // Restore the original function
    User.findByIdAndUpdate.mockRestore();
  });


 /******************************************
  *** Begin Tests: deleteSingleUser      ***
  ******************************************/
  // Test 1: Ensure deleteSingleUser removes a user
  test('deleteSingleUser should remove a user', async () => {
    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: testUser2._id.toString() },
      user: { role: 'admin', userId: testUser1._id.toString() }
    });
    const res = httpMocks.createResponse();

    await deleteSingleUser(req, res);

    expect(res.statusCode).toBe(200);
    const deletedUser = await User.findById(testUser2._id);
    expect(deletedUser).toBeNull();
  });

  // Test 2: Ensure delete fails with a 400 error when ID parameter is missing
  test('deleteSingleUser should return 400 if ID parameter is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: {},
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await deleteSingleUser(req, res);

    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'ID parameter is required' });
  });

  // Test 3: Ensure only the user or an admin can delete the user account
  test('deleteSingleUser should return 403 if a user tries to delete another user’s account', async () => {
    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: testUser1._id.toString() },
      user: { role: 'temporary', userId: testUser2._id.toString() }
    });
    const res = httpMocks.createResponse();

    await deleteSingleUser(req, res);

    expect(res.statusCode).toBe(403);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Only the user or an admin can delete this account' });
  });

  // Test 4: Ensure delete fails with a 404 error when the user is not found
  test('deleteSingleUser should return 404 if user is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: nonExistentId },
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    await deleteSingleUser(req, res);

    expect(res.statusCode).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'User not found' });
  });

  // Test 5: Ensure a server error returns status 500
  test('deleteSingleUser should return 500 on server error', async () => {
    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: testUser1._id.toString() },
      user: { role: 'admin' }
    });
    const res = httpMocks.createResponse();

    // Simulate an error by making User.findByIdAndDelete throw an error
    jest.spyOn(User, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Database failure'));

    await deleteSingleUser(req, res);

    expect(res.statusCode).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Failed to delete user', error: 'Database failure' });

    // Restore the original function
    User.findByIdAndDelete.mockRestore();
  });

  /******************************************
   *** Begin Tests: userLogout            ***
  ******************************************/
  // Test 1: Ensure logout fails with a 400 error when Authorization header is missing
  test('userLogout should return 400 if Authorization header is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: {} // No authorization header
    });
    const res = httpMocks.createResponse();

    await userLogout(req, res);

    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Authorization header missing.' });
  });

  // Test 2: Ensure logout fails with a 400 error when JWT is invalid
  test('userLogout should return 400 if JWT is invalid', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { authorization: 'Bearer invalidToken' },
      user: {} // No valid JWT decoding possible
    });
    const res = httpMocks.createResponse();

    jwt.decode.mockReturnValue(null); // Simulate an invalid JWT

    await userLogout(req, res);

    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ message: 'Invalid JWT provided.' });
  });

  // Test 3: Ensure logout correctly revokes the Google access token
  test('userLogout should revoke Google access token if present', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { Authorization: 'Bearer validToken' },
      user: { googleAccessToken: 'mockGoogleToken' }
    });
    const res = httpMocks.createResponse();

    jwt.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }); // Valid JWT
    redisClient.set.mockResolvedValueOnce('OK');

    await userLogout(req, res);

    expect(axios.post).toHaveBeenCalledWith(
      `https://oauth2.googleapis.com/revoke?token=mockGoogleToken`,
      null,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'User logged out successfully. JWT blacklisted and Google token revoked.'
    });
  });

  // Test 4: Ensure logout correctly blacklists a valid JWT
  test('userLogout should blacklist a valid JWT', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const fakeDecodedToken = { exp: currentTime + 3600 }; // Token expires in 1 hour

    jwt.decode.mockReturnValue(fakeDecodedToken);
    redisClient.set.mockResolvedValueOnce('OK');

    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { Authorization: 'Bearer validToken' },
      user: {}
    });
    const res = httpMocks.createResponse();

    await userLogout(req, res);

    expect(redisClient.set).toHaveBeenCalledWith('validToken', 'blacklisted', { EX: 3600 });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'User logged out successfully. JWT blacklisted and Google token revoked.'
    });
  });

  // Test 5: Ensure logout handles expired JWT correctly
  test('userLogout should not blacklist an already expired JWT', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const expiredDecodedToken = { exp: currentTime - 10 }; // Token expired 10 seconds ago

    jwt.decode.mockReturnValue(expiredDecodedToken);
    redisClient.set.mockResolvedValueOnce('OK');

    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { Authorization: 'Bearer expiredToken' },
      user: {}
    });
    const res = httpMocks.createResponse();

    await userLogout(req, res);

    expect(redisClient.set).not.toHaveBeenCalled(); // Should not be called for expired tokens
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'User logged out successfully. JWT blacklisted and Google token revoked.'
    });
  });

  // Test 6: Ensure a server error returns status 500
  test('userLogout should return 500 on server error', async () => {
    jwt.decode.mockImplementation(() => {
      throw new Error('Decoding failure');
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { Authorization: 'Bearer validToken' },
      user: {}
    });
    const res = httpMocks.createResponse();

    await userLogout(req, res);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Error logging out.' });
  });
});
