import { useCallback, useContext, useEffect } from "react";
import { ShopContext } from "../context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const verifyPayment = useCallback(async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/verifyStripe",
        { success, orderId },
        { headers: { token } },
      );

      if (response.data.success) {
        setCartItems({});
        toast.success("Payment verified.");
        navigate("/orders");
      } else {
        toast.error("Payment verification failed.");
        navigate("/cart");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      navigate("/cart");
    }
  }, [backendUrl, navigate, orderId, setCartItems, success, token]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">
        Verifying your payment, please wait...
      </p>
    </div>
  );
};

export default Verify;
