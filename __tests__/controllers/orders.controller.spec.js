const httpMocks = require('node-mocks-http');
const mongoose = require('mongoose');
const OrdersController = require('../../controllers/orders');
const Order = require('../../models/order.model');

jest.mock('../../models/order.model');

/*******************************************
 *** Begin Test Suite: Orders Controller ***
 *******************************************/
describe('Orders Controller Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

 /******************************************
  *** Begin Tests: getAllOrders          ***
  ******************************************/
  describe('getAllOrders', () => {
    test('should return all orders', async () => {
      const mockOrders = [{ _id: '1', item: 'Candy' }];
      Order.find.mockResolvedValue(mockOrders);

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await OrdersController.getAllOrders(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockOrders);
    });

    test('should handle errors when retrieving orders', async () => {
      Order.find.mockRejectedValue(new Error('Database error'));

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await OrdersController.getAllOrders(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: 'Failed to retrieve orders',
        error: 'Database error'
      });
    });

    test('should return 400 for invalid driver ID', async () => {
      const req = httpMocks.createRequest({ query: { driver: 'invalid-id' } });
      const res = httpMocks.createResponse();
    
      await OrdersController.getAllOrders(req, res);
    
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'Invalid driver ID format' });
    });
    
    test('should return 400 for invalid candy ID', async () => {
      const req = httpMocks.createRequest({ query: { candy: 'bad-id' } });
      const res = httpMocks.createResponse();
    
      await OrdersController.getAllOrders(req, res);
    
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'Invalid candy ID format' });
    });
    
    test('should return 404 if no matching orders are found', async () => {
      Order.find.mockResolvedValue([]);
    
      const req = httpMocks.createRequest({ query: { status: 'delivered' } });
      const res = httpMocks.createResponse();
    
      await OrdersController.getAllOrders(req, res);
    
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'No matching orders found' });
    });

    test('should apply valid driver ID filter', async () => {
      const validDriverId = '507f1f77bcf86cd799439011';
      const mockOrders = [{ _id: '1', item: 'Candy', deliverer_id: validDriverId }];

      Order.find.mockResolvedValue(mockOrders);

      const req = httpMocks.createRequest({ query: { driver: validDriverId } });
      const res = httpMocks.createResponse();

      await OrdersController.getAllOrders(req, res);

      expect(Order.find).toHaveBeenCalledWith({
        deliverer_id: expect.any(mongoose.Types.ObjectId)
      });
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockOrders);
    });

    test('should apply valid candy ID filter', async () => {
      const validCandyId = '507f191e810c19729de860ea';
      const mockOrders = [
        {
          _id: '2',
          candy_ordered: [{ candy_id: validCandyId }]
        }
      ];

      Order.find.mockResolvedValue(mockOrders);

      const req = httpMocks.createRequest({ query: { candy: validCandyId } });
      const res = httpMocks.createResponse();

      await OrdersController.getAllOrders(req, res);

      expect(Order.find).toHaveBeenCalledWith({
        ['candy_ordered.candy_id']: expect.any(mongoose.Types.ObjectId)
      });
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockOrders);
    });
  });

 /******************************************
  *** Begin Tests: getSingleOrder        ***
  ******************************************/
  describe('getSingleOrder', () => {
    test('should return a single order by ID', async () => {
      const mockOrder = { _id: '123', item: 'Candy' };
      Order.findById.mockResolvedValue(mockOrder);

      const req = httpMocks.createRequest({ params: { id: '123' } });
      const res = httpMocks.createResponse();

      await OrdersController.getSingleOrder(req, res);

      expect(Order.findById).toHaveBeenCalledWith('123');
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockOrder);
    });

    test('should return 404 if order not found', async () => {
      Order.findById.mockResolvedValue(null);

      const req = httpMocks.createRequest({ params: { id: '123' } });
      const res = httpMocks.createResponse();

      await OrdersController.getSingleOrder(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Order not found' });
    });

    test('should handle errors when retrieving a single order', async () => {
      Order.findById.mockRejectedValue(new Error('Error retrieving order'));

      const req = httpMocks.createRequest({ params: { id: '123' } });
      const res = httpMocks.createResponse();

      await OrdersController.getSingleOrder(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: 'Failed to retrieve order',
        error: 'Error retrieving order'
      });
    });

    test('should return 400 if ID is not provided', async () => {
      const req = httpMocks.createRequest({ params: {} });
      const res = httpMocks.createResponse();
    
      await OrdersController.getSingleOrder(req, res);
    
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'ID parameter is required' });
    });
  });

 /******************************************
  *** Begin Tests: deleteSingleOrder     ***
  ******************************************/
  describe('deleteSingleOrder', () => {
    test('should delete an order by ID', async () => {
      Order.findByIdAndDelete.mockResolvedValue({ _id: '321', item: 'Chocolate' });

      const req = httpMocks.createRequest({ params: { id: '321' } });
      const res = httpMocks.createResponse();

      await OrdersController.deleteSingleOrder(req, res);

      expect(Order.findByIdAndDelete).toHaveBeenCalledWith('321');
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Order deleted successfully' });
    });

    test('should return 404 if order to delete is not found', async () => {
      Order.findByIdAndDelete.mockResolvedValue(null);

      const req = httpMocks.createRequest({ params: { id: '321' } });
      const res = httpMocks.createResponse();

      await OrdersController.deleteSingleOrder(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Order not found' });
    });

    test('should handle errors when deleting order', async () => {
      Order.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

      const req = httpMocks.createRequest({ params: { id: '321' } });
      const res = httpMocks.createResponse();

      await OrdersController.deleteSingleOrder(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: 'Failed to delete order',
        error: 'Delete failed'
      });
    });

    test('should return 400 if ID is not provided in delete', async () => {
      const req = httpMocks.createRequest({ params: {} });
      const res = httpMocks.createResponse();
    
      await OrdersController.deleteSingleOrder(req, res);
    
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'ID parameter is required' });
    });    
  });

 /******************************************
  *** Begin Tests: createSingleOrder     ***
  ******************************************/
  describe('createSingleOrder', () => {
    test('should create a new order', async () => {
      const mockSavedOrder = { _id: 'abc123' };
    
      const saveMock = jest.fn().mockImplementation(function () {
        this._id = mockSavedOrder._id;
        return Promise.resolve(this);
      });
    
      jest.spyOn(Order.prototype, 'save').mockImplementation(saveMock);
    
      const req = httpMocks.createRequest({
        body: {
          store_id: 'store1',
          deliverer_id: 'driver1',
          candy_ordered: [],
          total_price: 100,
          delivery_status: 'pending',
          delivery_address: '123 Candy St',
          delivery_contact: 'Jane Doe',
          delivery_phone_number: '123-456-7890'
        }
      });
    
      const res = httpMocks.createResponse();
      await OrdersController.createSingleOrder(req, res);
    
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({
        message: 'New order added',
        id: 'abc123'
      });
    });    

    test('should handle errors when creating order', async () => {
      jest.spyOn(Order.prototype, 'save').mockRejectedValue(new Error('Create failed'));

      const req = httpMocks.createRequest({
        body: {
          store_id: 'store1',
          deliverer_id: 'driver1',
          candy_ordered: [],
          total_price: 100,
          delivery_status: 'pending',
          delivery_address: '123 Candy St',
          delivery_contact: 'Jane Doe',
          delivery_phone_number: '123-456-7890'
        }
      });

      const res = httpMocks.createResponse();
      await OrdersController.createSingleOrder(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: 'Failed to create order',
        error: 'Create failed'
      });
    });
  });

 /******************************************
  *** Begin Tests: updateSingleOrder     ***
  ******************************************/
  describe('updateSingleOrder', () => {
    test('should update an order by ID', async () => {
      const mockUpdated = { _id: '789', item: 'Taffy' };
      Order.findByIdAndUpdate.mockResolvedValue(mockUpdated);

      const req = httpMocks.createRequest({
        params: { id: '789' },
        body: { item: 'Taffy' }
      });
      const res = httpMocks.createResponse();

      await OrdersController.updateSingleOrder(req, res);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        '789',
        expect.objectContaining({ item: 'Taffy' }),
        { new: true, runValidators: true }
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Order updated successfully',
        order: mockUpdated
      });
    });

    test('should return 404 if order to update is not found', async () => {
      Order.findByIdAndUpdate.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: '789' },
        body: { item: 'Caramel' }
      });
      const res = httpMocks.createResponse();

      await OrdersController.updateSingleOrder(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Order not found' });
    });

    test('should handle errors when updating order', async () => {
      Order.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

      const req = httpMocks.createRequest({
        params: { id: '789' },
        body: { item: 'Toffee' }
      });
      const res = httpMocks.createResponse();

      await OrdersController.updateSingleOrder(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: 'Failed to update order',
        error: 'Update failed'
      });
    });

    test('should return 400 if ID is not provided in update', async () => {
      const req = httpMocks.createRequest({ params: {}, body: {} });
      const res = httpMocks.createResponse();
    
      await OrdersController.updateSingleOrder(req, res);
    
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'ID parameter is required' });
    });
  });
});
