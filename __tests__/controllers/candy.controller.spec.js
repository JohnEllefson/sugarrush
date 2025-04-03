const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const Candy = require('../models/candy'); // Adjust the path to your Candy model
const candyController = require('../controllers/candyController'); // Adjust the path to your Candy controller

jest.mock('../models/candy'); // Mock the Candy model

describe('Candy Controller Tests', () => {
  // Test for getting all candies
  describe('GET /candies', () => {
    it('should return a list of all candies', async () => {
      // Create mock data for the candies
      const mockCandies = [
        { _id: mongoose.Types.ObjectId(), name: 'Candy 1', price: 5 },
        { _id: mongoose.Types.ObjectId(), name: 'Candy 2', price: 3 },
      ];
      
      // Mock the find method to return the mock data
      Candy.find.mockResolvedValue(mockCandies);

      // Create a mock request and response object
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Call the controller method
      await candyController.getAllCandies(req, res);

      // Check the response
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(mockCandies);
    });
  });

  // Test for getting a single candy by ID
  describe('GET /candies/:id', () => {
    it('should return a single candy', async () => {
      const candy = { _id: mongoose.Types.ObjectId(), name: 'Candy 1', price: 5 };

      // Mock the findById method to return the candy
      Candy.findById.mockResolvedValue(candy);

      const req = httpMocks.createRequest({
        params: { id: candy._id.toString() },
      });
      const res = httpMocks.createResponse();

      await candyController.getCandyById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(candy);
    });

    it('should return 404 if candy not found', async () => {
      Candy.findById.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: 'nonexistent-id' },
      });
      const res = httpMocks.createResponse();

      await candyController.getCandyById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getData().message).toBe('Candy not found');
    });
  });

  // Test for adding a new candy
  describe('POST /candies', () => {
    it('should create a new candy', async () => {
      const newCandy = { name: 'Candy 3', price: 7 };

      // Mock the create method to return the new candy
      Candy.create.mockResolvedValue(newCandy);

      const req = httpMocks.createRequest({
        body: newCandy,
      });
      const res = httpMocks.createResponse();

      await candyController.createCandy(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getData()).toEqual(newCandy);
    });

    it('should return 400 if data is invalid', async () => {
      const invalidCandy = { name: '', price: 'invalid' };

      const req = httpMocks.createRequest({
        body: invalidCandy,
      });
      const res = httpMocks.createResponse();

      await candyController.createCandy(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getData().message).toBe('Invalid data');
    });
  });

  // Test for updating a candy
  describe('PUT /candies/:id', () => {
    it('should update a candy', async () => {
      const updatedCandy = { name: 'Updated Candy', price: 10 };
      Candy.findByIdAndUpdate.mockResolvedValue(updatedCandy);

      const req = httpMocks.createRequest({
        params: { id: '1' },
        body: updatedCandy,
      });
      const res = httpMocks.createResponse();

      await candyController.updateCandy(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(updatedCandy);
    });

    it('should return 404 if candy not found', async () => {
      Candy.findByIdAndUpdate.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: '999' },
        body: { name: 'Candy' },
      });
      const res = httpMocks.createResponse();

      await candyController.updateCandy(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getData().message).toBe('Candy not found');
    });
  });

  // Test for deleting a candy
  describe('DELETE /candies/:id', () => {
    it('should delete a candy', async () => {
      Candy.findByIdAndDelete.mockResolvedValue({ _id: '1', name: 'Candy 1' });

      const req = httpMocks.createRequest({
        params: { id: '1' },
      });
      const res = httpMocks.createResponse();

      await candyController.deleteCandy(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData().message).toBe('Candy deleted');
    });

    it('should return 404 if candy not found', async () => {
      Candy.findByIdAndDelete.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: '999' },
      });
      const res = httpMocks.createResponse();

      await candyController.deleteCandy(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getData().message).toBe('Candy not found');
    });
  });
});
