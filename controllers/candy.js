"use strict";

const candyModel = require("../models/candy.model");
const candyController = {};
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

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
      return res.status(404).json({ error: "No matching candy items found" });
    }

    const filteredResult = result.map((doc) => {
      const candy = doc.toObject();
      const { createdBy, ...showCandy } = candy;
      return showCandy;
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(filteredResult);
  } catch (error) {
    console.error("Error fetching all candy:", error);
    res.status(500).json({ error: "Failed to retrieve candy items" });
  }
};

// Retrieve a single candy item by ID
candyController.getSingleCandy = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID parameter is required" });
    }

    const result = await candyModel.findOne({ _id: new ObjectId(id) });
    if (!result) {
      return res.status(404).json({ message: "No matching candy items found" });
    }

    const filteredResult = result
      ? { ...result.toObject(), createdBy: undefined }
      : null;

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(filteredResult);
  } catch (error) {
    console.error("Error fetching candy by ID:", error);
    res.status(500).json({ error: "No matching candy items found" });
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

    const result = await candyModel.create(candyInfo);

    res.status(201).json({
      _id: result._id,
      ...candyInfo,
      message: "New candy created successfully.",
    });
    console.log({ result, message: "New candy created successfully." });
  } catch (error) {
    console.error("Error making new candy:", error);
    res.status(500).json({ error: "Failed to create candy item" });
  }
};

// Update a single candy item
candyController.updateSingleCandy = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID parameter is required" });
    }

    const candy = await candyModel.findOne({ _id: new ObjectId(id) });

    if (!candy) {
      return res.status(404).json({ error: "No matching candy items found" });
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
    const result = await candyModel.replaceOne(
      { _id: new ObjectId(id) },
      candyInfo
    );

    if (result.modifiedCount > 0) {
      res.status(204).send();
      console.log({ upsertedId: id, message: "Updated candy information." });
    }
  } catch (error) {
    console.error("Error updating candy:", error);
    res.status(500).json({ error: "Failed to update candy." });
  }
};

// Delete a single candy item
candyController.deleteSingleCandy = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID parameter is required" });
    }
    const candy = await candyModel.findOne({ _id: new ObjectId(id) });

    if (!candy) {
      return res.status(404).json({ error: "No matching candy items found" });
    }

    const result = await candyModel.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ ...result, deletedId: id, message: "Candy removed." });
      console.log({ result, deletedId: id, message: "Candy removed." });
    }
  } catch (error) {
    console.error("Error deleting candy:", error);
    res.status(500).json({ error: "Failed to delete candy." });
  }
};

module.exports = candyController;
