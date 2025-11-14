import React from "react"; // Import shimmer styles (create this if not already)

const PostsShimmer = () => {
  const shimmerPosts = Array(3).fill(0); // You can adjust the number

  return (
    <div className="space-y-6">
      {shimmerPosts.map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden relative"
        >
          {/* Header shimmer */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
              <div className="shimmer-glow"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-3 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-glow"></div>
              </div>
              <div className="w-1/5 h-3 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-glow"></div>
              </div>
            </div>
          </div>

          {/* Image shimmer */}
          <div className="w-full h-64 bg-gray-200 relative overflow-hidden">
            <div className="shimmer-glow"></div>
          </div>

          {/* Caption shimmer */}
          <div className="p-4 space-y-2">
            <div className="w-3/4 h-3 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-glow"></div>
            </div>
            <div className="w-2/3 h-3 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-glow"></div>
            </div>
            <div className="w-1/2 h-3 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-glow"></div>
            </div>
          </div>

          {/* Actions shimmer */}
          <div className="flex gap-6 px-4 pb-4">
            {[1, 2, 3].map((icon) => (
              <div
                key={icon}
                className="w-5 h-5 bg-gray-200 rounded-full relative overflow-hidden"
              >
                <div className="shimmer-glow"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsShimmer;
