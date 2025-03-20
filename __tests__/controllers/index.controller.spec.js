'use strict';

const httpMocks = require('node-mocks-http');
const { buildIndex } = require('../../controllers/index');

/******************************************
 *** Begin Test Suite: Index Controller ***
 ******************************************/
describe('Index Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Check the buildIndex function
  test('buildIndex should return API information', async () => {
    const req = httpMocks.createRequest({
      method: 'GET'
    });
    const res = httpMocks.createResponse();

    await buildIndex(req, res);

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('message', 'Welcome to the SugarRush API');
    expect(data.available_routes).toHaveProperty('/api-docs', "View the API documentation");
  });
});