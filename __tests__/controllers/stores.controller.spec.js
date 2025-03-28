'use strict';

const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const User = require('../../models/user.model');
const Store = require('../../models/store.model');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const redisClient = require('../../utilities/redisClient');
const {
  getAllStores,
  getSingleStore,
  createSingleStore,
  updateSingleStore,
  deleteSingleStore
} = require('../../controllers/stores');

jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('../../utilities/redisClient');

let testStoreowner;
let testStore1;
let testStore2;

beforeAll(async () => {
  // Create mock stores and storeowner in the test database.
  // The test database was started in jest.setup.js
  testStoreowner = await User.create({
    googleId: 'test-google-id-2',
    username: 'teststoreowner',
    email: 'joseph.mcnellie@email.com',
    preferred_name: 'Joseph McNellie',
    phone_number: '+1-555-555-5555',
    role: 'storeowner',
    date_created: '2021-01-01'
  });

  testStore1 = await Store.create({
    name: 'Test Store 1',
    street: '123 Main St',
    city: 'Anytown',
    state: 'NY',
    zip_code: '12345',
    phone_number: '+1-555-555-5555',
    email: 'teststore1@email.com',
    owner_id: testStoreowner._id,
    operating_hours: '9-5',
    website: 'http://teststore1.com'
  });

  testStore2 = await Store.create({
    name: 'Test Store 2',
    street: '456 Elm St',
    city: 'Othertown',
    state: 'CA',
    zip_code: '54321',
    phone_number: '+1-867-530-2222',
    email: 'teststore2@email.com',
    owner_id: testStoreowner._id,
    operating_hours: '10-6',
    website: 'http://teststore2.com'
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await Store.deleteMany({});
  }
});

/******************************************
 *** Begin Test Suite: Stores Controller ***
 ******************************************/
 describe('Stores Controller', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
   /******************************************
    *** Begin Tests: getAllStores           ***
    ******************************************/
    // Test 1: Ensure all stores are returned when requested
    test('getAllStores should return stores', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(2);
      expect(data[0]).toHaveProperty('name', 'Test Store 1');
      expect(data[1]).toHaveProperty('name', 'Test Store 2');
    }); 

    // Test 2: Query store paramenters by name
    test('getAllStores should return stores by name', async () => {

    // Test 3: Query store paramenters by street
    // Test 4: Query store paramenters by city
    // Test 5: Query store paramenters by state
    // Test 6: Query store paramenters by zip code
    // Test 7: Query store paramenters by phone number
    // Test 8: Query store paramenters by email
    // Test 9: Query store paramenters by owner_id
    // Test 10: Query store paramenters by operating hours
    // Test 11: Query store paramenters by website

    // Test 12: Ensure a single store is returned by ID
    test('getSingleStore should return a single store by ID', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          id: testStore1._id
        }
      });
      const res = httpMocks.createResponse();
  
      await getSingleStore(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('name', testStore1.name);
    });

    // Test 13: Ensure a single store is created
    test('createSingleStore should create a single store', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'Test Store 3',
          street: '789 Oak St',
          city: 'Smalltown',
          state: 'TX',
          zip_code: '67890',
          phone_number: '+1-123-456-7890',
          email: 'test.store3@email.com',
          owner_id: testStoreowner._id.toString(),
          operating_hours: '9-5',
          website: 'http://teststore3.com'
        }
      });
        const res = httpMocks.createResponse();
        await createSingleStore(req, res);
        expect(res.statusCode).toBe(201);
        const data = JSON.parse(res._getData());
        expect(data).toHaveProperty('message', 'Store was successfully created.');
        expect(data.newStore).toHaveProperty('name', 'Test Store 3');
      });

    // Test 14: Ensure a single store is updated
    test('updateSingleStore should update a single store', async () => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: {
          id: testStore1._id
        },
        body: {
          name: 'Updated Store 1'
        }
      });
      const res = httpMocks.createResponse();
  
      await updateSingleStore(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('message', 'Store was successfully updated.');
      expect(data.updatedStore).toHaveProperty('name', 'Updated Store 1');
      console.log('data', data);
    });

    // Test 15: Ensure a single store is deleted
    // Test 16: list stores by owner id
    // 

});