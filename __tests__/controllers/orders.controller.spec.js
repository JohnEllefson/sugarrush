const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const Order = require('../models/order'); // Adjust the path to your Order model
const ordersController = require('../controllers/ordersController'); // Adjust the path to your Orders controller

jest.mock('../models/order'); // Mock the Order model

describe('Orders Controller Tests', () => {
  // Test for getting all orders
  describe('GET /orders', () => {
    it('should return a list of all orders', async () => {
      // Create mock data for the orders
      const mockOrders = [
        { _id: mongoose.Types.ObjectId(), customerName: 'John Doe', totalAmount: 100 },
        { _id: mongoose.Types.ObjectId(), customerName: 'Jane Doe', totalAmount: 50 },
      ];

      // Mock the find method to return the mock data
      Order.find.mockResolvedValue(mockOrders);

      // Create a mock request and response object
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Call the controller method
      await ordersController.getAllOrders(req, res);

      // Check the response
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(mockOrders);
    });
  });

  // Test for getting a single order by ID
  describe('GET /orders/:id', () => {
    it('should return a single order', async () => {
      const order = { _id: mongoose.Types.ObjectId(), customerName: 'John Doe', totalAmount: 100 };

      // Mock the findById method to return the order
      Order.findById.mockResolvedValue(order);

      const req = httpMocks.createRequest({
        params: { id: order._id.toString() },
      });
      const res = httpMocks.createResponse();

      await ordersController.getOrderById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(order);
    });

    it('should return 404 if order not found', async () => {
      Order.findById.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: 'nonexistent-id' },
      });
      const res = httpMocks.createResponse();

      await ordersController.getOrderById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getData().message).toBe('Order not found');
    });
  });

  // Test for creating a new order
  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const newOrder = { customerName: 'John Doe', totalAmount: 100 };

      // Mock the create method to return the new order
      Order.create.mockResolvedValue(newOrder);

      const req = httpMocks.createRequest({
        body: newOrder,
      });
      const res = httpMocks.createResponse();

      await ordersController.createOrder(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getData()).toEqual(newOrder);
    });

    it('should return 400 if data is invalid', async () => {
      const invalidOrder = { customerName: '', totalAmount: 'invalid' };

      const req = httpMocks.createRequest({
        body: invalidOrder,
      });
      const res = httpMocks.createResponse();

      await ordersController.createOrder(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getData().message).toBe('Invalid data');
    });
  });

  // Test for updating an order
  describe('PUT /orders/:id', () => {
    it('should update an order', async () => {
      const updatedOrder = { customerName: 'Jane Doe', totalAmount: 150 };
      Order.findByIdAndUpdate.mockResolvedValue(updatedOrder);

      const req = httpMocks.createRequest({
        params: { id: '1' },
        body: updatedOrder,
      });
      const res = httpMocks.createResponse();

      await ordersController.updateOrder(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(updatedOrder);
    });

    it('should return 404 if order not found', async () => {
      Order.findByIdAndUpdate.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: '999' },
        body: { customerName: 'John Doe' },
      });
      const res = httpMocks.createResponse();

      await ordersController.updateOrder(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getData().message).toBe('Order not found');
    });
  });

  // Test for deleting an order
  describe('DELETE /orders/:id', () => {
    it('should delete an order', async () => {
      Order.findByIdAndDelete.mockResolvedValue({ _id: '1', customerName: 'John Doe' });

      const req = httpMocks.createRequest({
        params: { id: '1' },
      });
      const res = httpMocks.createResponse();

      await ordersController.deleteOrder(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData().message).toBe('Order deleted');
    });

    it('should return 404 if order not found', async () => {
      Order.findByIdAndDelete.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: '999' },
      });
      const res = httpMocks.createResponse();

      await ordersController.deleteOrder(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getData().message).toBe('Order not found');
    });
  });
});
