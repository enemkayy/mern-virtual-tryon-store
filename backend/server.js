import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import tryonRouter from "./routes/tryonRoute.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares (functions that run before the route handlers)

// Parse JSON bodies (as sent by API clients) and make it available in req.body
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing) to allow requests from different origins (e.g., frontend running on a different port)
app.use(cors());

// API Endpoints (Route handlers)
// Define routes for user and product operations and cart operations
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/tryon", tryonRouter);

app.get("/", (req, res) => {
  res.send("API working");
});

// Start the server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

startServer();
