import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
  },
  { minimize: false },
);

// This line checks if a model named "user" already exists in mongoose's models. If it does, it uses that existing model.
// If it doesn't, it creates a new model using the userSchema and assigns it to the name "user".
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
