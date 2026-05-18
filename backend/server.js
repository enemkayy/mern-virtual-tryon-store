import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares (functions that run before the route handlers)
app.use(express.json());
app.use(cors());

// API Endpoints (Route handlers)

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
