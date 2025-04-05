"use strict";

const mongoose = require("mongoose");

// Create a schema for the candy collection
const candySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shipping_container: {
      type: String,
      enum: ["pallet", "crate", "cardboardBox", "displayBox"],
      default: "cardboardBox",
    },
    price_per_unit: {
      type: Number,
      required: true,
      min: [0, "Price per unit must be a positive value"],
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: [0, "Stock quantity must be a positive value"],
    },
    supplier_name: {
      type: String,
      required: true,
      minlength: [2, "Supplier name must be at least 2 characters long"],
      trim: true,
    },
    date_added: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Candy", candySchema, "candy");
