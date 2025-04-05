const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const CandyController = require("../../controllers/candy");
const Candy = require("../../models/candy.model");

jest.mock("../../models/candy.model");

/******************************************
 *** Begin Test Suite: Candy Controller ***
 ******************************************/
describe("Candy Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /******************************************
   *** Begin Tests: getAllCandy           ***
   ******************************************/
  describe("getAllCandy", () => {
    test("should return all candy items", async () => {
      const mockCandy = [{ _id: "1", name: "Lollipop" }];
      Candy.find.mockResolvedValue(mockCandy);

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await CandyController.getAllCandy(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockCandy);
    });

    test("should handle errors when retrieving candy items", async () => {
      Candy.find.mockRejectedValue(new Error("Database error"));

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await CandyController.getAllCandy(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Failed to retrieve candy items",
        error: "Database error",
      });
    });

    test("should return 404 if no matching candy items found", async () => {
      Candy.find.mockResolvedValue([]);

      const req = httpMocks.createRequest({ query: { name: "Nonexistent" } });
      const res = httpMocks.createResponse();

      await CandyController.getAllCandy(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "No matching candy items found",
      });
    });

    test("should apply valid description filter", async () => {
      const mockCandy = [
        { _id: "2", name: "Gum", description: "Chewy and sweet" },
      ];
      Candy.find.mockResolvedValue(mockCandy);

      const req = httpMocks.createRequest({ query: { description: "chewy" } });
      const res = httpMocks.createResponse();

      await CandyController.getAllCandy(req, res);

      expect(Candy.find).toHaveBeenCalledWith({
        description: expect.any(RegExp),
      });
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockCandy);
    });

    test("should apply valid container filter", async () => {
      const mockCandy = [
        { _id: "3", name: "Hard Candy", shipping_container: "Tin" },
      ];
      Candy.find.mockResolvedValue(mockCandy);

      const req = httpMocks.createRequest({ query: { container: "Tin" } });
      const res = httpMocks.createResponse();

      await CandyController.getAllCandy(req, res);

      expect(Candy.find).toHaveBeenCalledWith({
        shipping_container: "Tin",
      });
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockCandy);
    });
  });

  /******************************************
   *** Begin Tests: getSingleCandy        ***
   ******************************************/
  describe("getSingleCandy", () => {
    test("should return a single candy item by ID", async () => {
      const mockCandy = { _id: "abc", name: "Caramel" };
      Candy.findById.mockResolvedValue(mockCandy);

      const req = httpMocks.createRequest({ params: { id: "abc" } });
      const res = httpMocks.createResponse();

      await CandyController.getSingleCandy(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockCandy);
    });

    test("should return 404 if candy item not found", async () => {
      Candy.findById.mockResolvedValue(null);

      const req = httpMocks.createRequest({ params: { id: "abc" } });
      const res = httpMocks.createResponse();

      await CandyController.getSingleCandy(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: "Candy item not found" });
    });

    test("should handle errors when retrieving a single candy item", async () => {
      Candy.findById.mockRejectedValue(new Error("Find failed"));

      const req = httpMocks.createRequest({ params: { id: "abc" } });
      const res = httpMocks.createResponse();

      await CandyController.getSingleCandy(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Failed to retrieve candy item",
        error: "Find failed",
      });
    });

    test("should return 400 if ID is not provided", async () => {
      const req = httpMocks.createRequest({ params: {} });
      const res = httpMocks.createResponse();

      await CandyController.getSingleCandy(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "ID parameter is required",
      });
    });
  });

  /******************************************
   *** Begin Tests: deleteSingleCandy     ***
   ******************************************/
  describe("deleteSingleCandy", () => {
    test("should delete a candy item by ID", async () => {
      Candy.findByIdAndDelete.mockResolvedValue({
        _id: "456",
        name: "Sour Patch",
      });

      const req = httpMocks.createRequest({ params: { id: "456" } });
      const res = httpMocks.createResponse();

      await CandyController.deleteSingleCandy(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Candy item deleted successfully",
      });
    });

    test("should return 404 if candy item not found", async () => {
      Candy.findByIdAndDelete.mockResolvedValue(null);

      const req = httpMocks.createRequest({ params: { id: "456" } });
      const res = httpMocks.createResponse();

      await CandyController.deleteSingleCandy(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: "Candy item not found" });
    });

    test("should handle errors when deleting candy item", async () => {
      Candy.findByIdAndDelete.mockRejectedValue(new Error("Delete failed"));

      const req = httpMocks.createRequest({ params: { id: "456" } });
      const res = httpMocks.createResponse();

      await CandyController.deleteSingleCandy(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Failed to delete candy item",
        error: "Delete failed",
      });
    });

    test("should return 400 if ID is not provided for delete", async () => {
      const req = httpMocks.createRequest({ params: {} });
      const res = httpMocks.createResponse();

      await CandyController.deleteSingleCandy(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "ID parameter is required",
      });
    });
  });

  /******************************************
   *** Begin Tests: createSingleCandy     ***
   ******************************************/
  describe("createSingleCandy", () => {
    test("should create a new candy item", async () => {
      const mockSavedCandy = { _id: "new123" };
      const saveMock = jest.fn().mockImplementation(function () {
        this._id = mockSavedCandy._id;
        return Promise.resolve(this);
      });
      jest.spyOn(Candy.prototype, "save").mockImplementation(saveMock);

      const req = httpMocks.createRequest({
        body: {
          name: "Bubble Gum",
          description: "Chewy and sweet",
          shipping_container: "Box",
          price_per_unit: 0.99,
          stock_quantity: 100,
          supplier_name: "GumCorp",
        },
      });
      const res = httpMocks.createResponse();

      await CandyController.createSingleCandy(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({
        message: "New candy item added",
        id: "new123",
      });
    });

    test("should handle errors when creating candy item", async () => {
      jest
        .spyOn(Candy.prototype, "save")
        .mockRejectedValue(new Error("Create failed"));

      const req = httpMocks.createRequest({
        body: {
          name: "Bubble Gum",
          description: "Chewy and sweet",
          shipping_container: "Box",
          price_per_unit: 0.99,
          stock_quantity: 100,
          supplier_name: "GumCorp",
        },
      });
      const res = httpMocks.createResponse();

      await CandyController.createSingleCandy(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Failed to create candy item",
        error: "Create failed",
      });
    });
  });

  /******************************************
   *** Begin Tests: updateSingleCandy     ***
   ******************************************/
  describe("updateSingleCandy", () => {
    test("should update a candy item by ID", async () => {
      const mockUpdated = { _id: "up123", name: "Updated Candy" };
      Candy.findByIdAndUpdate.mockResolvedValue(mockUpdated);

      const req = httpMocks.createRequest({
        params: { id: "up123" },
        body: { name: "Updated Candy" },
      });
      const res = httpMocks.createResponse();

      await CandyController.updateSingleCandy(req, res);

      expect(Candy.findByIdAndUpdate).toHaveBeenCalledWith(
        "up123",
        { name: "Updated Candy" },
        { new: true, runValidators: true }
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Candy item updated successfully",
        candy: mockUpdated,
      });
    });

    test("should return 404 if candy item not found", async () => {
      Candy.findByIdAndUpdate.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        params: { id: "up123" },
        body: { name: "Nonexistent" },
      });
      const res = httpMocks.createResponse();

      await CandyController.updateSingleCandy(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: "Candy item not found" });
    });

    test("should handle errors when updating candy item", async () => {
      Candy.findByIdAndUpdate.mockRejectedValue(new Error("Update failed"));

      const req = httpMocks.createRequest({
        params: { id: "up123" },
        body: { name: "Failing Update" },
      });
      const res = httpMocks.createResponse();

      await CandyController.updateSingleCandy(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Failed to update candy item",
        error: "Update failed",
      });
    });

    test("should return 400 if ID is not provided in update", async () => {
      const req = httpMocks.createRequest({ params: {}, body: {} });
      const res = httpMocks.createResponse();

      await CandyController.updateSingleCandy(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "ID parameter is required",
      });
    });
  });
});
