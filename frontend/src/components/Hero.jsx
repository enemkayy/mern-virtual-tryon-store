import React from "react";
import { assets } from "../assets/frontend_assets/assets";

const Hero = () => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch border border-gray-400 h-auto lg:h-130">
      {/* Hero Left Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-10 lg:py-0 h-full px-6 sm:px-12 lg:px-20">
        <div className="text-[#414141] text-left max-w-130 lg:max-w-none">
          <div className="flex items-center gap-2">
            <p className="w-8 md:w-11 h-0.5 bg-[#414141]"></p>
            <p className="font-medium text-sm md:text-base">OUR BESTSELLERS</p>
          </div>
          <h1 className="prata-regular text-3xl md:text-4xl lg:text-5xl leading-snug">
            Latest Arrivals
          </h1>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm md:text-base">SHOP NOW</p>
            <p className="w-8 md:w-11 h-px bg-[#414141]"></p>
          </div>
        </div>
      </div>

      {/* Hero Right Side */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full overflow-hidden">
        <img
          className="block w-full h-auto lg:h-full object-contain lg:object-cover object-center"
          src={assets.hero_img}
          alt="hero"
        />
      </div>
    </div>
  );
};

export default Hero;
