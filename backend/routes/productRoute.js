import express from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// Multer setup for handling multipart/form-data (file uploads)
// Route for adding a new product
productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct,
);

// Route for listing all products
productRouter.get("/list", listProducts);

// Route for removing a product
productRouter.post("/remove", adminAuth, removeProduct);

// Route for getting a single product info
productRouter.post("/single", singleProduct);

export default productRouter;
