"use strict";

const candyModel = require("../models/candy.model");
const candyController = {};

// Retrieve all candy items with optional filtering
candyController.getAllCandy = async (req, res) => {
  try {
    const query = {};

    if (req.query.name) {
      query.name = new RegExp(req.query.name, "i");
    }
    if (req.query.description) {
      query.description = new RegExp(req.query.description, "i");
    }
    if (req.query.container) {
      query.shipping_container = req.query.container;
    }

    const result = await candyModel.find(query);

    if (result.length === 0) {
      return res.status(404).json({ message: "No matching candy items found" });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching all candy:", err);
    res.status(500).json({
      message: "Failed to retrieve candy items",
      error: err.message || "Unknown error",
    });
  }
};

// Retrieve a single candy item by ID
candyController.getSingleCandy = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    const result = await candyModel.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Candy item not found" });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching candy by ID:", err);
    res.status(500).json({
      message: "Failed to retrieve candy item",
      error: err.message || "Unknown error",
    });
  }
};

// Create a new candy item
candyController.createSingleCandy = async (req, res) => {
  try {
    const candyInfo = {
      name: req.body.name,
      description: req.body.description,
      shipping_container: req.body.shipping_container,
      price_per_unit: req.body.price_per_unit,
      stock_quantity: req.body.stock_quantity,
      supplier_name: req.body.supplier_name,
      date_added: new Date().toLocaleDateString("en-CA"),
    };

    const newCandy = new candyModel(candyInfo);

    const result = await newCandy.save();

    if (!result) {
      throw new Error("Candy creation failed");
    }

    res.status(201).json({
      id: result._id,
      message: "New candy item added",
    });
    console.log({ result, message: "New candy created successfully." });
  } catch (err) {
    console.error("Error making new candy:", err);
    res.status(500).json({
      message: "Failed to create candy item",
      error: err.message || "Unknown error",
    });
  }
};

// Update a single candy item
candyController.updateSingleCandy = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    const candyInfo = {
      name: req.body.name,
      description: req.body.description,
      shipping_container: req.body.shipping_container,
      price_per_unit: req.body.price_per_unit,
      stock_quantity: req.body.stock_quantity,
      supplier_name: req.body.supplier_name,
      date_added: req.body.date_added,
    };

    const result = await candyModel.findByIdAndUpdate(
      req.params.id,
      candyInfo,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!result) {
      return res.status(404).json({ message: "Candy item not found" });
    }

    res.status(200).json({
      message: "Candy item updated successfully",
      candy: result,
    });
    console.log({
      updatedCandy: result,
      message: "Updated candy information.",
    });
  } catch (err) {
    console.error("Error updating candy:", err);
    res.status(500).json({
      message: "Failed to update candy item",
      error: err.message || "Unknown error",
    });
  }
};

// Delete a single candy item
candyController.deleteSingleCandy = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    const result = await candyModel.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Candy item not found" });
    }

    if (result) {
      res.status(200).json({
        message: "Candy item deleted successfully",
      });
      console.log({
        result,
        deletedId: result._id,
        message: "Candy item deleted successfully",
      });
    }
  } catch (err) {
    console.error("Error deleting candy:", err);
    res.status(500).json({
      message: "Failed to delete candy item",
      error: err.message || "Unknown error",
    });
  }
};

module.exports = candyController;
