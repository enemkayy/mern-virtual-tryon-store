import { ShopContext } from "./Context";
import { products } from "../assets/frontend_assets/assets";
import { useState } from "react";
import { toast } from "react-toastify";

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const [cartItems, setCartItems] = useState({});
  const [search,setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false)

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
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
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

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
