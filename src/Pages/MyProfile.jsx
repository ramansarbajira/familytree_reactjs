import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout';
import Post from './Post';
import Gallery from './Gallery';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  // Dummy data for posts
  const samplePosts = [
    {
      id: 1,
      title: "Beautiful Sunset",
      likes: 25,
      comments: 10,
      images: [
        "https://via.placeholder.com/300x200",
        "https://via.placeholder.com/300x201",
        "https://via.placeholder.com/300x202",
        "https://via.placeholder.com/300x203",
        "https://via.placeholder.com/300x204"
      ]
    }
  ];

  // Dummy data for gallery
  const sampleGalleryImages = [
    { id: 1, image: "https://via.placeholder.com/300x300" },
    { id: 2, image: "https://via.placeholder.com/301x301" }
  ];

  // Placeholder functions
 const handleViewProfile = () => {
  navigate('/profile');
};
  const handlePostClick = (post) => console.log("Post clicked:", post);
  const handleAddPost = () => console.log("Add post clicked");
  const handleAddGalleryImage = (img) => console.log("Add gallery image:", img);
  const handleGalleryImageClick = (index) => console.log("Gallery image clicked:", index);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="mx-auto bg-white min-h-screen">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="h-32 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>

          <div className="px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-16 relative z-10">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 w-full text-center sm:text-left mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-3 gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Sabarinath_Rajendran29</h1>
                    <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">FAM-8927 👑</p>
                  </div>
                  <button 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={handleViewProfile}
                  >
                    View Profile
                  </button>
                </div>

                <div className="flex justify-center sm:justify-start gap-8 text-base text-gray-800 mb-4">
                  <div className="text-center">
                    <span className="block font-bold text-lg">12</span>
                    <span className="text-gray-600 text-sm">Posts</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">1.2k</span>
                    <span className="text-gray-600 text-sm">Followers</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">890</span>
                    <span className="text-gray-600 text-sm">Following</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 max-w-2xl">
              <h2 className="font-semibold mb-2 text-gray-900">About</h2>
              <p className="text-gray-700 leading-relaxed">
                No big plans, no big dreams — just a simple life with good people, good food, and peaceful moments.
                <span className="text-blue-600 cursor-pointer hover:underline ml-1">more</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex justify-center">
            <div className="flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'posts'
                    ? 'text-gray-900 border-gray-900 font-semibold'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                POSTS
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-2 px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'gallery'
                    ? 'text-gray-900 border-gray-900 font-semibold'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                GALLERY
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-50 min-h-screen p-4">
          {activeTab === 'posts' ? (
            <Post posts={samplePosts} onPostClick={handlePostClick} onAddPost={handleAddPost} />
          ) : (
            <Gallery
              galleryImages={sampleGalleryImages}
              onAddGalleryImage={handleAddGalleryImage}
              onGalleryImageClick={handleGalleryImageClick}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyProfile;