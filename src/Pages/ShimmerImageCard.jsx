import React from "react";

const ShimmerImageCard = ({ width = 340, height = 190 }) => (
  <div
    className="relative rounded-2xl overflow-hidden shadow-lg"
    style={{ width, height, background: "#eee" }}
  >
    {/* Shimmer Layer */}
    <div className="absolute inset-0 shimmer-glow" />
    {/* Text Placeholder */}
    <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/50 to-transparent w-full">
      <div className="h-6 w-24 mb-2 rounded bg-gray-300 shimmer-glow" />
      <div className="h-4 w-16 rounded bg-gray-300 shimmer-glow" />
    </div>
  </div>
);


export default ShimmerImageCard;
