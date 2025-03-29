'use strict';

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/user.model');
const Store = require('../../models/store.model');
const jwt = require('jsonwebtoken');

let testStoreowner;
let testStore1;
let testStore2;
let testStore3;
let adminToken;
let storeownerToken;
let driverToken;
let inventoryManagerToken;
let allUserTokens = {
  admin: '',
  storeowner: '',
  driver: '',
  inventoryManager: ''
};


beforeAll(async () => {
  // Create a mock store and mock owner in the test database.
  // The test database was started in jest.setup.js
  testStoreowner = await User.create({
    googleId: 'test-google-id-2',
    username: 'teststoreowner',
    email: 'john.mcnellie@email.com',
    preferred_name: 'John McNellie',
    phone_number: '+1-555-555-5555',
    role: 'storeowner',
    date_created: '2021-01-01'
  });

  testStore1 = await Store.create({
    name: 'Test Store1',
    street: '123 Main St',
    city: 'Anytown',
    state: 'NY',
    zip_code: '12345',
    phone_number: '+1-555-555-5555',
    email: 'teststore@email.com',
    owner_id: testStoreowner._id,
    operating_hours: '9-5',
    website: 'http://teststore.com'
  });

  testStore2 = await Store.create({
    name: 'Test Store2',
    street: '123 Main St',
    city: 'Anytown',
    state: 'NY',
    zip_code: '12345',
    phone_number: '+1-555-555-5555',
    email: 'teststore@email.com',
    owner_id: testStoreowner._id,
    operating_hours: '9-5',
    website: 'http://teststore.com'
  });

  testStore3 = await Store.create({
    name: 'Test Store3',
    street: '123 Main St',
    city: 'Anytown',
    state: 'NY',
    zip_code: '12345',
    phone_number: '+1-555-555-5555',
    email: 'teststore@email.com',
    owner_id: testStoreowner._id,
    operating_hours: '9-5',
    website: 'http://teststore.com'
  });

  // Generate a valid JWT for authentication
  adminToken = jwt.sign({ userId: testStoreowner._id, role: 'admin' }, process.env.JWT_SECRET || 'mocksecret', { expiresIn: '1h' });
  allUserTokens.admin = adminToken;
  storeownerToken = jwt.sign({ userId: testStoreowner._id, role: 'storeowner' }, process.env.JWT_SECRET || 'mocksecret', { expiresIn: '1h' });
  allUserTokens.storeowner = storeownerToken;
  driverToken = jwt.sign({ userId: testStoreowner._id, role: 'driver' }, process.env.JWT_SECRET || 'mocksecret', { expiresIn: '1h' });
  allUserTokens.driver = driverToken;
  inventoryManagerToken = jwt.sign({ userId: testStoreowner._id, role: 'inventoryManager' }, process.env.JWT_SECRET || 'mocksecret', { expiresIn: '1h' });
  allUserTokens.inventoryManager = inventoryManagerToken;
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await Store.deleteMany({});
  }
});

/******************************************
 *** Begin Test Suite: Stores Routes     ***
 ******************************************/
describe('Stores API Routes', () => {

  // Test 1: GET /stores should return all stores (using the roles admin, storeowner, driver, inentoryManager)
  Object.keys(allUserTokens).forEach((role, index) => {  
    test('GET /stores should return all stores ' + role, async () => {
      const res = await request(app)
        .get('/stores')
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(3);
    });
  

    // Test 2: GET /stores/:id should return a single store ( accessed by admin, storeowner, driver, inventoryManger )
    test('GET /stores/:id should return a single store', async () => {
      const res = await request(app)
        .get(`/stores/${testStore2._id}`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', 'teststore@email.com');
    });

    // Test 3: GET /stores?name=? should return a single store by name ( accessed by admin, storeowner, driver, inventoryManger )
    test('GET /stores?name=? should return a single store by name', async () => {
      const res = await request(app)
        .get(`/stores?name=Test Store1`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('name', 'Test Store1');
    });

    // Test 4: GET /stores?street=? should return a single store by street
    test('GET /stores?street=? should return a single store by street', async () => {
      const res = await request(app)
        .get(`/stores?street=123 Main St`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('street', testStore3.street);
    });

    // Test 5: GET /stores?city=? should return a single store by city
    test('GET /stores?city=? should return a single store by city', async () => {
      const res = await request(app)
        .get(`/stores?city=Anytown`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('city', 'Anytown');
    });

    // Test 6: GET /stores?state=? should return a single store by state
    test('GET /stores?state=? should return a single store by state', async () => {
      const res = await request(app)
        .get(`/stores?state=NY`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('state', 'NY');
    });

    // Test 7: GET /stores?zip_code=? should return a single store by zip code
    test('GET /stores?zip_code=? should return a single store by zip code', async () => {
      const res = await request(app)
        .get(`/stores?zip_code=12345`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('zip_code', '12345');
    });

    // Test 8: GET /stores?phone_number=? should return a single store by phone number
    test('GET /stores?phone_number=? should return a single store by phone number', async () => {
      const res = await request(app)
        .get(`/stores?phone_number=1-555-555-5555`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('phone_number', '+1-555-555-5555');
    });

    // Test 9: GET /stores?email=? should return a single store by email
    test('GET /stores?email=? should return a single store by email', async () => {
      const res = await request(app)
        .get(`/stores?email=teststore@email.com`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('email', 'teststore@email.com');
    });

    // Test 10: GET /stores?owner_id=? should return a single store by owner_id
    test('GET /stores?owner_id=? should return a single store by owner_id', async () => {
      const res = await request(app)
        .get(`/stores?owner_id=${testStoreowner._id}`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('owner_id', testStoreowner._id.toString());
    });

    // Test 11: GET /stores?operating_hours=? should return a single store by operating_hours
    test('GET /stores?operating_hours=? should return a single store by operating_hours', async () => {
      const res = await request(app)
        .get(`/stores?operating_hours=9-5`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('operating_hours', '9-5');
    });

    // Test 12: GET /stores?website=? should return a single store by website
    test('GET /stores?website=? should return a single store by website', async () => {
      const res = await request(app)
        .get(`/stores?website=http://teststore.com`)
        .set('Authorization', `Bearer ${allUserTokens[role]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('website', 'http://teststore.com');
    });
  });

  // Test 13: POST /stores should allow admin, storeowner, inventoryManager to create a store
  test('POST /stores should allow admin, storeowner, driver, inventoryManager to create a store', async () => {
    const res = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Store4',
        street: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zip_code: '12345',
        phone_number: '+1-555-555-5555',
        email: 'david.goliath@email.com',
        owner_id: testStoreowner._id,
        operating_hours: '9-5',
        website: 'http://teststore4.com'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Store was successfully created.');
    expect(res.body.newStore).toHaveProperty('name', 'Test Store4');
  });

  // Test 14: POST /stores shouldn't allow driver to create a store
  test('POST /stores should allow admin, storeowner, driver, inventoryManager to create a store', async () => {
    const res = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        name: 'Test Store4',
        street: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zip_code: '12345',
        phone_number: '+1-555-555-5555',
        email: 'david.goliath@email.com',
        owner_id: testStoreowner._id,
        operating_hours: '9-5',
        website: 'http://teststore4.com'
      });

    expect(res.statusCode).toBe(403);
  });


  // Test 15: PUT /stores/:id should allow admin, storeowner, inventoryManager to update a store
  test('PUT /stores/:id should allow admin, storeowner, driver, inventoryManager to update a store', async () => {
    const res = await request(app)
      .put(`/stores/${testStore1._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Store 1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Store updated successfully.');
  });

  // Test 16: PUT /stores/:id shouldn't allow driver to update a store
  test('PUT /stores/:id should allow admin, storeowner, driver, inventoryManager to update a store', async () => {
    const res = await request(app)
      .put(`/stores/${testStore1._id.toString()}`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ name: 'Updated Store 1' });

    expect(res.statusCode).toBe(403);
  });

  // Test 17: DELETE /stores/:id should allow admin, storeowner, inventoryManager to delete a store
  test('DELETE /stores/:id should allow admin, storeowner', async () => {
    const res = await request(app)
      .delete(`/stores/${testStore1._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

      expect(res.statusCode).toBe(204);
  })
  
  // Test 18: DELETE /stores/:id shouldn't allow driver to delete a store
  test('DELETE /stores/:id should allow admin, storeowner', async () => {
    const res = await request(app)
      .delete(`/stores/${testStore1._id.toString()}`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send();

    expect(res.statusCode).toBe(403);
  })
  
});
