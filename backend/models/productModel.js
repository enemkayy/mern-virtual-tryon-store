// Product Model
// This file defines the schema and model for products in the virtual try-on store application.
// It uses Mongoose to create a schema that outlines the structure of product documents in the MongoDB database.
// The schema includes fields such as name, description, price, image, category, subCategory, sizes, bestseller status, and date of creation.
// The model is then exported for use in other parts of the application, such as in route handlers for creating, retrieving, updating, and deleting products.

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: { type: Array, required: true },
  bestseller: { type: Boolean, default: false },
  date: { type: Number, required: true },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
