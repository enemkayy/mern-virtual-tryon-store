import React, { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/Context";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadOrderData = useCallback(async () => {
    try {
      if (!token) return [];

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        return response.data.orders.flatMap((order) =>
          order.items.map((item) => ({
            ...item,
            status: order.status,
            payment: order.payment,
            paymentMethod: order.paymentMethod,
            date: order.date,
          })),
        );
      }

      return [];
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return [];
    }
  }, [backendUrl, token]);

  const updateOrderData = useCallback((items) => {
    setOrderData([...items].reverse());
  }, []);

  const refreshOrderData = useCallback(async () => {
    setLoading(true);
    const loadingToast = toast.loading("Refreshing order data...");

    try {
      const items = await loadOrderData();
      updateOrderData(items);
      toast.update(loadingToast, {
        render: "Order data refreshed.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, [loadOrderData, updateOrderData]);

  useEffect(() => {
    if (!token) return;

    let ignoreResponse = false;

    loadOrderData().then((items) => {
      if (!ignoreResponse) {
        updateOrderData(items);
        setHasLoaded(true);
      }
    });

    return () => {
      ignoreResponse = true;
    };
  }, [loadOrderData, token, updateOrderData]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {hasLoaded && orderData.length === 0 ? (
          <div className="py-16 text-center text-gray-500 border border-dashed rounded-lg bg-gray-50">
            <p className="text-lg font-medium text-gray-700">
              You have no orders yet.
            </p>
            <p className="mt-2 text-sm">
              Start shopping to track your orders here.
            </p>
            <Link
              to="/collection"
              className="inline-flex items-center justify-center mt-6 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-sm transition-colors hover:bg-gray-800"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          orderData.map((item, index) => (
            <div
              key={index}
              className="py-4 border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-6 text-sm">
                <img
                  src={item.image[0]}
                  alt={item.name}
                  className="w-16 sm:w-20"
                />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">
                    Date:{" "}
                    <span className="text-gray-400">
                      {new Date(item.date).toDateString()}
                    </span>
                  </p>
                  <p className="mt-1">
                    Payment:{" "}
                    <span className="text-gray-400">{item.paymentMethod}</span>
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-between">
                <div className="flex items-center gap-2">
                  <p
                    className={`min-w-2 h-2 rounded-full ${
                      item.status === "Order Placed"
                        ? "bg-orange-400"
                        : item.status === "Packing"
                          ? "bg-yellow-500"
                          : item.status === "Shipped"
                            ? "bg-blue-500"
                            : item.status === "Out for delivery"
                              ? "bg-indigo-500"
                              : "bg-green-500" // Delivered
                    }`}
                  ></p>
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>
                <button
                  disabled={loading}
                  onClick={refreshOrderData}
                  className={`border px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200 ${
                    loading
                      ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                      : "hover:bg-gray-50 active:bg-gray-100 text-gray-700"
                  }`}
                >
                  {loading ? "Updating..." : "Track Order"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
