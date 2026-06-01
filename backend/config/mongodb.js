import mongoose from "mongoose";
import dns from "node:dns/promises";

// Set custom DNS servers to avoid potential DNS resolution issues
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });

  await mongoose.connect(`${process.env.MONGODB_URL}`);
};
export default connectDB;
