// __tests__/routes/candy.routes.spec.js

const request = require("supertest");
const app = require("../../server");
const jwt = require("jsonwebtoken");
const Candy = require("../../models/candy.model");

// Generate mock JWT tokens
const generateToken = ({ role }) =>
  jwt.sign({ id: `${role}_id`, role }, process.env.JWT_SECRET || "test_secret");

const tokens = {
  user: generateToken({ role: "user" }),
  storeowner: generateToken({ role: "storeowner" }),
  admin: generateToken({ role: "admin" }),
  inventoryManager: generateToken({ role: "inventoryManager" }),
};

// Mock data
const mockCandy = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "Bubblegum",
    description: "Chewy gum",
    price_per_unit: 0.5,
    shipping_container: "box",
  },
];

const singleCandy = mockCandy[0];

jest.mock("../../models/candy.model");

jest.mock("express-validator", () => {
  const originalModule = jest.requireActual("express-validator");
  return {
    ...originalModule,
    validationResult: () => ({
      isEmpty: () => true,
      array: () => [],
    }),
  };
});

/******************************************
 *** Begin Test Suite: Candy Routes     ***
 ******************************************/
describe("Candy Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("GET /candy", () => {
    // Test 1: Check for candy items
    test("should return candy items for authorized roles", async () => {
      Candy.find.mockResolvedValue(mockCandy);

      const res = await request(app)
        .get("/candy")
        .set("Authorization", `Bearer ${tokens.storeowner}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockCandy);
    });

    // Test 2: Check for empty candy items
    test("should deny access for unauthorized users", async () => {
      const res = await request(app).get("/candy");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /candy/:id", () => {
    // Test 3: Check for single candy item
    test("should return a candy item for valid ID", async () => {
      Candy.findById.mockResolvedValue(singleCandy);

      const res = await request(app)
        .get(`/candy/${singleCandy._id}`)
        .set("Authorization", `Bearer ${tokens.storeowner}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(singleCandy);
    });

    // Test 4: Check for non-existing candy item
    test("should return 404 if candy not found", async () => {
      Candy.findById.mockResolvedValue(null);

      const res = await request(app)
        .get("/candy/507f1f77bcf86cd799439099")
        .set("Authorization", `Bearer ${tokens.storeowner}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe("POST /candy", () => {
    // Test 5: Check for creating a new candy item
    test("should create a new candy for allowed roles", async () => {
      const newCandy = {
        name: "Lollipop",
        description: "Sweet hard candy",
        price_per_unit: 0.75,
        shipping_container: "jar",
        quantity: 100,
        category: "Hard Candy",
      };

      // Mock the Candy constructor and save() call
      Candy.mockImplementation(function (data) {
        return {
          ...data,
          _id: "candy2",
          save: jest.fn().mockResolvedValue({
            _id: "candy2",
            ...data,
          }),
        };
      });

      const res = await request(app)
        .post("/candy")
        .set("Authorization", `Bearer ${tokens.inventoryManager}`)
        .send(newCandy);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "New candy item added");
      expect(res.body).toHaveProperty("id", "candy2");
    });

    // Test 6: Check for invalid role
    test("should deny creation for invalid roles", async () => {
      const res = await request(app)
        .post("/candy")
        .set("Authorization", `Bearer ${tokens.user}`)
        .send({ name: "Lollipop" });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("PUT /candy/:id", () => {
    // Test 7: Check for updating a candy item
    test("should update candy for valid ID", async () => {
      Candy.findByIdAndUpdate.mockResolvedValue({
        ...singleCandy,
        name: "Updated Lollipop",
      });

      const res = await request(app)
        .put(`/candy/${singleCandy._id}`)
        .set("Authorization", `Bearer ${tokens.inventoryManager}`)
        .send({ name: "Updated Lollipop" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("candy");
      expect(res.body.candy.name).toBe("Updated Lollipop");
    });

    // Test 8: Check for invalid ID
    test("should return 404 if candy not found", async () => {
      Candy.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put("/candy/507f1f77bcf86cd799439099")
        .set("Authorization", `Bearer ${tokens.inventoryManager}`)
        .send({ name: "Nonexistent" });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /candy/:id", () => {
    // Test 9: Check for deleting a candy item
    test("should delete candy for admin", async () => {
      Candy.findByIdAndDelete.mockResolvedValue(singleCandy);

      const res = await request(app)
        .delete(`/candy/${singleCandy._id}`)
        .set("Authorization", `Bearer ${tokens.admin}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });

    // Test 10: Check for invalid ID
    test("should return 404 if candy not found", async () => {
      Candy.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete("/candy/507f1f77bcf86cd799439099")
        .set("Authorization", `Bearer ${tokens.inventoryManager}`);

      expect(res.statusCode).toBe(404);
    });

    // Test 11: Check for non-admin role
    test("should block non-admin roles from deleting", async () => {
      const res = await request(app)
        .delete(`/candy/${singleCandy._id}`)
        .set("Authorization", `Bearer ${tokens.user}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
