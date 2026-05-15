import { ShopContext } from "./Context";
import { products } from "../assets/frontend_assets/assets";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const [cartItems, setCartItems] = useState({});
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size before adding to cart.");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      // If the item already exists in the cart, check if the size exists and update the quantity
      if (cartData[itemId][size]) {
        // If the size already exists, increment the quantity
        cartData[itemId][size] += 1;
        // If the size does not exist, add it to the item with a quantity of 1
      } else {
        cartData[itemId][size] = 1;
      }
      // If the item does not exist in the cart, add it with the size and quantity
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;

    // Loop through the cartItems object to calculate the total count of items in the cart
    for (const items in cartItems) {
      // Loop through each size of the item to calculate the total quantity for that item
      for (const item in cartItems[items]) {
        try {
          // Add the quantity of the current size to the total count
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.error("Error calculating cart count:", error);
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;
    setCartItems(cartData);
  };

  const getCartAmount = () => {
    let totalAmount = 0;    
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += cartItems[items][item] * itemInfo.price;
          }
        } catch (error) {
          console.error("Error calculating cart amount:", error);
        }
      }
    }
    return totalAmount;
  }

  const value = {
    products,
    currency,
    delivery_fee,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
