import React from "react";

const HomePageShimmer = () => {
  const shimmerCards = Array(4).fill(0);
  const shimmerButtons = Array(3).fill(0);
  const shimmerPosts = Array(2).fill(0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 p-4 space-y-10 relative overflow-hidden">
        {/* Logo */}
        <div className="h-8 w-3/4 bg-gray-200 rounded relative overflow-hidden">
          <div className="shimmer-glow"></div>
        </div>

        {/* Nav items */}
        <div className="space-y-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-4 w-5/6 bg-gray-200 rounded relative overflow-hidden"
              >
                <div className="shimmer-glow"></div>
              </div>
            ))}
        </div>

        {/* Bottom user section */}
        <div className="mt-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full relative overflow-hidden">
            <div className="shimmer-glow"></div>
          </div>
          <div className="w-1/2 h-3 bg-gray-200 rounded relative overflow-hidden">
            <div className="shimmer-glow"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header / Topbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full relative overflow-hidden">
              <div className="shimmer-glow"></div>
            </div>
            <div className="w-32 h-4 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-glow"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gray-200 rounded-full relative overflow-hidden"
                >
                  <div className="shimmer-glow"></div>
                </div>
              ))}
          </div>
        </div>

        {/* Main Body */}
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-5 py-6 pt-3 space-y-7">
          {/* Top Cards */}
          <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {shimmerCards.map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 flex items-center gap-3 relative overflow-hidden"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg relative overflow-hidden">
                  <div className="shimmer-glow"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 relative overflow-hidden">
                    <div className="shimmer-glow"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 relative overflow-hidden">
                    <div className="shimmer-glow"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {shimmerButtons.map((_, i) => (
              <div
                key={i}
                className="h-10 sm:h-12 bg-gray-200 rounded-md sm:rounded-lg relative overflow-hidden"
              >
                <div className="shimmer-glow"></div>
              </div>
            ))}
          </div>

          {/* Feed / Posts */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 space-y-6">
            {shimmerPosts.map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden"
              >
                {/* Post Header */}
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

                {/* Post Image */}
                <div className="w-full h-64 bg-gray-200 relative overflow-hidden">
                  <div className="shimmer-glow"></div>
                </div>

                {/* Post Caption */}
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

                {/* Post Actions */}
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
        </div>
      </div>
    </div>
  );
};

export default HomePageShimmer;
