'use strict';

const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Order = require('../../models/order.model');

jest.mock('../../models/order.model');

const SECRET = process.env.JWT_SECRET || 'secret';
const createToken = (role) =>
  jwt.sign({ googleAccessToken: 'token', userId: 'mock-user-id', role }, SECRET);

const adminToken = createToken('admin');
const storeToken = createToken('storeowner');
const driverToken = createToken('driver');
const inventoryToken = createToken('inventoryManager');
const userToken = createToken('user');

/******************************************
 *** Begin Test Suite: Orders Routes    ***
 ******************************************/
describe('Orders Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /orders', () => {
    // Test 1: Check for orders
    test('should return orders for authorized roles', async () => {
      const mockOrders = [{ _id: '1', total_price: 10 }, { _id: '2', total_price: 20 }];
      Order.find.mockResolvedValue(mockOrders);

      const res = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${storeToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockOrders);
    });

    // Test 2: Check for empty orders
    test('should deny access for unauthorized users', async () => {
      const res = await request(app).get('/orders');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /orders/:id', () => {
    // Test 3: Check for single order
    test('should return single order for valid ID', async () => {
      const mockOrder = { _id: '60f8f8f8f8f8f8f8f8f8f8f8', total_price: 30 };
      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/orders/60f8f8f8f8f8f8f8f8f8f8f8')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockOrder);
    });

    // Test 4: Check for non-existing order
    test('should return 404 if order not found', async () => {
      Order.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/orders/60f8f8f8f8f8f8f8f8f8f8f9')
        .set('Authorization', `Bearer ${inventoryToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe('POST /orders', () => {
    // Test 5: Check for order creation
    test('should create a new order for allowed roles', async () => {
      const mockOrder = { _id: 'abc123' };
    
      // Assign the _id to the instance after instantiation
      Order.mockImplementation(function () {
        this.save = jest.fn().mockImplementation(() => {
          this._id = mockOrder._id;
          return Promise.resolve(this);
        });
      });
    
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          store_id: '601c1f1f1f1f1f1f1f1f1f1f',
          deliverer_id: '601c1f1f1f1f1f1f1f1f1f1f',
          candy_ordered: [{ candy_id: '601c1f1f1f1f1f1f1f1f1f1f', quantity: 2 }],
          total_price: 50,
          date_created: new Date().toISOString(),
          delivery_status: 'pending',
          delivery_address: '123 Sweet St',
          delivery_contact: 'John Doe',
          delivery_phone_number: '+1-555-123-4567'
        });
    
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('id', 'abc123'); // Validate id
    });    

    // Test 6: Check for order creation with missing fields
    test('should deny creation for invalid roles', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          store_id: '601c1f1f1f1f1f1f1f1f1f1f',
          deliverer_id: '601c1f1f1f1f1f1f1f1f1f1f',
          candy_ordered: [{ candy_id: '601c1f1f1f1f1f1f1f1f1f1f', quantity: 2 }],
          total_price: 20,
          delivery_status: 'pending',
          delivery_address: '123 Sweet St',
          delivery_contact: 'John Doe',
          delivery_phone_number: '555-1234'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /orders/:id', () => {
    // Test 7: Check for order update
    test('should update an existing order', async () => {
      const updatedOrder = { _id: '456', total_price: 100 };
      Order.findByIdAndUpdate.mockResolvedValue(updatedOrder);
  
      const res = await request(app)
        .put('/orders/456456456456456456456456')
        .set('Authorization', `Bearer ${storeToken}`)
        .send({
          total_price: 100,
          delivery_status: 'shipped',
          delivery_address: '456 Sugar Ln',
          delivery_contact: 'Jane Doe',
          delivery_phone_number: '+1-555-987-6543',
          date_created: new Date().toISOString()
        });
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('order');
      expect(res.body.order.total_price).toBe(100);
    });
  
    // Test 8: Check for order update with invalid ID
    test('should return 404 if order not found', async () => {
      Order.findByIdAndUpdate.mockResolvedValue(null);
  
      const res = await request(app)
        .put('/orders/999999999999999999999999')
        .set('Authorization', `Bearer ${inventoryToken}`)
        .send({
          total_price: 100,
          delivery_status: 'shipped',
          delivery_address: '456 Sugar Ln',
          delivery_contact: 'Jane Doe',
          delivery_phone_number: '+1-555-987-6543',
          date_created: new Date().toISOString()
        });
  
      expect(res.statusCode).toBe(404);
    });
  });  

  describe('DELETE /orders/:id', () => {
    // Test 9: Check for order deletion
    test('should delete order for admin', async () => {
      Order.findByIdAndDelete.mockResolvedValue({ _id: '789' });

      const res = await request(app)
        .delete('/orders/789789789789789789789789')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });

    // Test 10: Check for order deletion with invalid ID
    test('should return 404 if order not found', async () => {
      Order.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete('/orders/404404404404404404404404')
        .set('Authorization', `Bearer ${storeToken}`);

      expect(res.statusCode).toBe(404);
    });

    // Test 11: Check for order deletion with non-admin role
    test('should block non-admin roles from deleting', async () => {
      const res = await request(app)
        .delete('/orders/789789789789789789789789')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
