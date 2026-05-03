import React, { useContext } from "react";
import { ShopContext } from "../context/Context";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const latestProducts = products.slice(0, 10);

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1="LATEST" text2="COLLECTION" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore our latest collection of fashion-forward products, carefully
          curated to elevate your style. From trendy apparel to must-have
          accessories, discover the perfect pieces to refresh your wardrobe and
          express your unique fashion sense. Shop now and stay ahead of the
          trends with our latest arrivals.
        </p>
      </div>

      {/* Rendering Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProducts.map((item, index) => {
          return (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LatestCollection;
