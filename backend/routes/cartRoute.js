import express from "express";
import {
  addToCart,
  getUserCart,
  updateCart,
} from "../controllers/cartController.js";
import authUser from "../middleware/auth.js";

const cartRouter = express.Router();

// Define routes for cart operations

// Route to get user cart data
cartRouter.post("/get", authUser, getUserCart);

// Route to add products to user cart
cartRouter.post("/add", authUser, addToCart);

// Route to update products in user cart
cartRouter.post("/update", authUser, updateCart);

export default cartRouter;
