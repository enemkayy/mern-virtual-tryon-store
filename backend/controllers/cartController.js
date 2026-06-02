import userModel from "../models/userModel.js";

// add products to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    // If the item already exists in the cart, check if the size exists and update the quantity
    if (cartData[itemId]) {
      // If the size already exists, increment the quantity
      if (cartData[itemId][size]) {
        // If the size already exists, increment the quantity
        cartData[itemId][size] += 1;
      } else {
        // If the size does not exist, add it to the item with a quantity of 1
        cartData[itemId][size] = 1;
      }
      // If the item does not exist in the cart, add it with the size and quantity of 1
    } else {
      cartData[itemId] = {};
      // If the size does not exist, add it to the item with a quantity of 1
      cartData[itemId][size] = 1;
    }

    // Update the user's cart data in the database
    await userModel.findByIdAndUpdate(userId, { cartData: cartData });
    res.json({ success: true, message: "Item added to cart successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update products in user cart
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    cartData[itemId][size] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData: cartData });
    res.json({ success: true, message: "Cart updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get user cart data
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
