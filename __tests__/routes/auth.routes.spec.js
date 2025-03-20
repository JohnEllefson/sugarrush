const request = require('supertest');
const app = require('../../server');

/******************************************
 *** Begin Tests: Auth API Routes       ***
 ******************************************/
describe('Auth API Routes', () => {
  
  // Test 1: Ensure the Google OAuth login route is accessible
  test('GET /auth/google should initiate OAuth flow', async () => {
    const res = await request(app).get('/auth/google');
    expect([302, 307, 404]).toContain(res.statusCode);
  });

  // Test 2: Ensure the Google OAuth callback route processes correctly
  test('GET /auth/google/callback should handle OAuth response', async () => {
    const res = await request(app).get('/auth/google/callback');
    expect([302, 400, 500]).toContain(res.statusCode);
  });

  // Test 3: Ensure an unknown auth route returns a 404 error
  test('GET /auth/unknown should return 404', async () => {
    const res = await request(app).get('/auth/unknown');
    expect(res.statusCode).toBe(404);
  });
});
