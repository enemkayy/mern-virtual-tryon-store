import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/Context";
import ProductItem from "./ProductItem";
import Title from "./Title";

const RelatedProducts = ({ category, subCategory, productId }) => {
  const { products } = useContext(ShopContext);

  const related = useMemo(() => {
    if (products.length > 0) {
      return products
        .filter(
          (item) =>
            item.category === category &&
            item.subCategory === subCategory &&
            item._id !== productId,
        )
        .slice(0, 5);
    }
    return [];
  }, [products, category, subCategory, productId]);
  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
