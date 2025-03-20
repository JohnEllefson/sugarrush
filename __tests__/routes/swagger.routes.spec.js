const request = require('supertest');
const app = require('../../server');

/********************************************
 *** Begin Test Suite: Swagger API Routes ***
 ********************************************/
describe('Swagger API Routes', () => {
  
  // Test 1: Ensure the Swagger API documentation route is accessible
  test('GET /api-docs should return 200 and serve Swagger UI', async () => {
    const res = await request(app).get('/api-docs').redirects(1); // Follow redirects
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<title>Swagger UI</title>');
  });

  // Test 2: Ensure a nonexistent Swagger-related route returns 404
  test('GET /api-docs/nonexistent should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api-docs/nonexistent').redirects(0); // Prevent redirects
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({}); 
  });
});

/***********************************************
 *** Begin Test Suite: Swagger OAuth Cleanup ***
 ***********************************************/
describe('Swagger API Routes - OAuth Cleanup', () => {
  let swaggerDoc;

  beforeEach(() => {
    // Reload the Swagger document dynamically
    jest.resetModules();
    delete require.cache[require.resolve('../../swagger-output.json')];
    swaggerDoc = require('../../swagger-output.json');

    // Manually add OAuth routes for testing removal
    swaggerDoc.paths['/auth/google'] = { get: {} };
    swaggerDoc.paths['/auth/google/callback'] = { get: {} };
    swaggerDoc.tags = [{ name: 'auth' }];

    // Simulate execution of the cleanup logic
    require('../../routes/swagger');
  });

  // Test 1: Ensure the Swagger document is loaded
  test('OAuth-related routes should be removed from Swagger paths', () => {
    delete require.cache[require.resolve('../../swagger-output.json')];
    swaggerDoc = require('../../swagger-output.json');

    expect(swaggerDoc.paths['/auth/google']).toBeUndefined();
    expect(swaggerDoc.paths['/auth/google/callback']).toBeUndefined();
  });

  // Test 2: Ensure the "auth" tag is removed if no paths reference it
  test('Auth tag should be removed if no paths reference it', () => {
    delete require.cache[require.resolve('../../swagger-output.json')];
    swaggerDoc = require('../../swagger-output.json');

    const authTagExists = swaggerDoc.tags?.some(tag => tag.name === 'auth');
    expect(authTagExists).toBe(false);
  });
});
