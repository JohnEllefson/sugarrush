'use strict';

const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const User = require('../../models/user.model');
const Store = require('../../models/store.model');

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
let testStoreowner2;
let testStore1;
let testStore2;
let testStore3;
let testStore4;
let testStore5;

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

  testStoreowner2 = await User.create({
    googleId: 'test-google-id-3',
    username: 'teststoreowner2',
    email: 'tony.evans@email.com',
    preferred_name: 'Tony Evans',
    phone_number: '+1-801-534-2222',
    role: 'storeowner',
    date_created: '2022-01-01'
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
    owner_id: testStoreowner2._id,
    operating_hours: '10-6',
    website: 'http://teststore2.com'
  });

  testStore3 = await Store.create({
    name: 'Test Store 3',
    street: '789 Oak St',
    city: 'Smalltown',
    state: 'TX',
    zip_code: '67890',
    phone_number: '+1-123-456-7890',
    email: 'teststore3@email.com',
    owner_id: testStoreowner._id,
    operating_hours: '9-5',
    website: 'http://teststore3.com'
  });

  testStore4 = await Store.create({
    name: 'Test Store 4',
    street: '123 Oak St',
    city: 'Smalltown',
    state: 'TX',
    zip_code: '67890',
    phone_number: '+1-555-555-5555',
    email: 'teststore4@email.com',
    owner_id: testStoreowner._id,
    operating_hours: '9-5',
    website: 'http://teststore4.com'
  });

  testStore5 = await Store.create({
    name: 'Test Store 5',
    street: '123 Elm St',
    city: 'Smalltown',
    state: 'TX',
    zip_code: '67890',
    phone_number: '+1-555-555-5555',
    email: 'teststore5@email.com',
    owner_id: testStoreowner._id,
    operating_hours: '10-6',
    website: 'http://teststore5.com'
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
  
   /*******************************************
    *** Begin Tests: getAllStores           ***
    *******************************************/
    // Test 1: Ensure all stores are returned when requested
    test('getAllStores should return stores', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(5);
      expect(data[0]).toHaveProperty('name', testStore1.name);
      expect(data[1]).toHaveProperty('name', testStore2.name);
      expect(data[2]).toHaveProperty('name', testStore3.name);
      expect(data[3]).toHaveProperty('name', testStore4.name);
      expect(data[4]).toHaveProperty('name', testStore5.name);

    }); 

    // Test 2: Query store paramenters by name
    test('getAllStores should return stores by name', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          name: 'Test Store 1'
        }
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(1);
      expect(data[0]).toHaveProperty('name', 'Test Store 1');
      
    });

    // Test 3: Query store paramenters by street
    test('getAllStores should return stores by street', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          street: 'Oak St'
        }
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(2);
      expect(data[0]).toHaveProperty('street', '789 Oak St');
      expect(data[1]).toHaveProperty('street', '123 Oak St');
    });

    // Test 4: Query store paramenters by city
    test('getAllStores should return stores by city', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          city: 'Smalltown'
        }
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(3);
      expect(data[0]).toHaveProperty('name', 'Test Store 3');
      expect(data[1]).toHaveProperty('name', 'Test Store 4');
      expect(data[2]).toHaveProperty('name', 'Test Store 5');
    });

    // Test 5: Query store paramenters by state
    test('getAllStores should return stores by state', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          state: 'NY'
        }
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(1);
      expect(data[0]).toHaveProperty('state', 'NY');
    });

    // Test 6: Query store paramenters by zip code
    test('getAllStores should return stores by zip code', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          zip_code: '67890'
        }
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(3);
      expect(data[0]).toHaveProperty('name', 'Test Store 3');
      expect(data[1]).toHaveProperty('name', 'Test Store 4');
      expect(data[2]).toHaveProperty('name', 'Test Store 5');
    });

    // Test 7: Query store paramenters by phone number
    test('getAllStores should return stores by phone number', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          phone_number: '+1-555-555-5555'
        }
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
    
      expect(data.length).toBe(3);
      
      expect(data[0]).toHaveProperty('name', 'Test Store 1');
      expect(data[1]).toHaveProperty('name', 'Test Store 4');
      expect(data[2]).toHaveProperty('name', 'Test Store 5');
    });

    // Test 8: Query store paramenters by email
    test('getAllStores should return stores by email', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          email: 'teststore2@email.com'
        }
      });
      const res = httpMocks.createResponse();

      await getAllStores(req, res);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(1);
      expect(data[0]).toHaveProperty('name', 'Test Store 2');
    });

    // Test 9: Query store paramenters by owner_id
    test('getAllStores should return stores by owner_id', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          owner_id: testStoreowner._id.toString()
        }
      });
      const res = httpMocks.createResponse();
  
      await getAllStores(req, res);
  
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(4);
    });

    // Test 10: Query store paramenters by operating hours
    test('getAllStores should return stores by operating_hours', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          operating_hours: '9-5'
        }
      });
      const res = httpMocks.createResponse();

      await getAllStores(req, res);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(3);
      expect(data[0]).toHaveProperty('name', 'Test Store 1');
      expect(data[1]).toHaveProperty('name', 'Test Store 3');
      expect(data[2]).toHaveProperty('name', 'Test Store 4');

    });

    // Test 11: Query store paramenters by website
    test('getAllStores should return stores by website', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          website: 'http://teststore1.com'
        }
      });
      const res = httpMocks.createResponse();

      await getAllStores(req,res);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.length).toBe(1);
      expect(data[0]).toHaveProperty('name', 'Test Store 1'); 
    })

   /*******************************************
    *** Begin Tests: getSingleStore         ***
    *******************************************/
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

   /*******************************************
    *** Begin Tests: createSingleStore      ***
    *******************************************/
    // Test 13: Ensure a single store is created
    test('createSingleStore should create a single store', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'Test Store 6',
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
        expect(data.newStore).toHaveProperty('name', 'Test Store 6');
      });

   /*******************************************
    *** Begin Tests: updateSingleStore      ***
    *******************************************/
    // Test 14: Ensure a single store is updated
    test('updateSingleStore should update a single store', async () => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: {
          id: testStore1._id.toString()
        },
        body: {
          name: 'Updated Store 1'
        }
      });
      const res = httpMocks.createResponse();
      
      await updateSingleStore(req, res);
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('message', 'Store updated successfully.');

      const req2 = httpMocks.createRequest({
        method: 'GET',
        params: {
          id: testStore1._id.toString()
        }
      });
      const res2 = httpMocks.createResponse();
  
      await getSingleStore(req2, res2);
      const data2 = JSON.parse(res2._getData());

      expect(data2).toHaveProperty('name', 'Updated Store 1');
    });

   /*******************************************
    *** Begin Tests: deleteSingleStore      ***
    *******************************************/
    // Test 15: Ensure a single store is deleted
    test('Single store is deleted by id', async () => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        params: {
          id: testStore1._id.toString()
        }
      });
      const res = httpMocks.createResponse();
      
      await deleteSingleStore(req, res);
      expect(res.statusCode).toBe(204);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('message','Store deleted successfully.');

      const req2 = httpMocks.createRequest({
        method: 'GET',
        params: {
          _id: testStore1._id.toString()
        }
      });
      const res2 = httpMocks.createResponse();
  
      await getSingleStore(req2, res2);
      const data2 = JSON.parse(res2._getData());
      
      expect(data2).toHaveProperty('message', 'Store not found.');
           
    })
});