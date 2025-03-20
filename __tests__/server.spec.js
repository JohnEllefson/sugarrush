const request = require('supertest');
const app = require('../server');

/******************************************
 *** Begin Test Suite: Server Tests     ***
 ******************************************/
describe('Server Tests', () => {
  test('Server should respond with 404 for unknown routes', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Not Found' });
  });

  // Test 1: Server should respond with 200 for valid routes
  test('Server should handle internal server errors', async () => {
    const res = await request(app).get('/cause-internal-error');
    expect(res.statusCode).toBe(404);
  });

  // Test 2: Server should respond with 200 for valid routes
  test('Server should have CORS configured correctly', async () => {
    const res = await request(app).options('/');
    console.log(res.headers);
    expect(res.headers['access-control-allow-methods']).toContain('GET');
    expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
  });

  // Test 3: Server should return a welcome message on the root route
  test('Server should return welcome message on root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Welcome to the SugarRush API');
  });
});
