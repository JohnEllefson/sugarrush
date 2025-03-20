const request = require('supertest');
const app = require('../../server'); 

describe('Index API Routes', () => {
  // Test 1: Ensure the root endpoint returns the welcome message
  test('GET / should return a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'Welcome to the SugarRush API',
      available_routes: {
        '/api-docs': 'View the API documentation',
      },
    });
  });

  // Test 2: Ensure non-existing routes return a 404 error
  test('GET /nonexistent should return 404 for unknown routes', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  // Test 3: Ensure the authentication route is accessible
  test('GET /auth should return 404 or redirect', async () => {
    const res = await request(app).get('/auth');
    expect([301, 302, 404]).toContain(res.statusCode);
  });

  // Test 4: Ensure the users route is accessible
  test('GET /users should return 401 for unauthorized access', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(401);
  });

  // Test 5: Ensure the candy route is accessible
  test('GET /candy should return 401 for unauthorized access', async () => {
    const res = await request(app).get('/candy');
    expect(res.statusCode).toBe(401);
  });

  // Test 6: Ensure the stores route is accessible
  test('GET /stores should return 401 for unauthorized access', async () => {
    const res = await request(app).get('/stores');
    expect(res.statusCode).toBe(401);
  });

  // Test 7: Ensure the orders route is accessible
  test('GET /orders should return 401 for unauthorized access', async () => {
    const res = await request(app).get('/orders');
    expect(res.statusCode).toBe(401);
  });
});
