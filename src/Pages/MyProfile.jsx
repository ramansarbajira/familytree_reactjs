import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    images: [],
    author: 'You'
  });
  const fileInputRef = useRef(null);

  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Family moments',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
      ],
      description: 'Today we celebrate our 15th anniversary with our lovable two kids 💕',
      likes: '1,524',
      comments: '1k',
      author: 'Sabarinath_Rajendran29'
    },
    {
      id: 2,
      title: 'Vacation time',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400'
      ],
      description: 'Family vacation memories!',
      likes: '321',
      comments: '98',
      author: 'Sabarinath_Rajendran29'
    },
  ]);

  const [galleryImages, setGalleryImages] = useState([
    { id: 1, image: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=400' },
    { id: 4, image: 'https://images.unsplash.com/photo-1541976844346-f18aeac57b06?w=400' },
  ]);

  const handleAddPost = () => {
    if (newPost.images.length > 0 && newPost.title.trim()) {
      const updatedPost = {
        id: posts.length + 1,
        ...newPost,
        likes: '0',
        comments: '0'
      };
      setPosts([updatedPost, ...posts]);
      setNewPost({
        title: '',
        description: '',
        images: [],
        author: 'You'
      });
      setShowPostModal(false);
    }
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleAddGalleryImage = () => {
    const newImage = {
      id: galleryImages.length + 1,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    };
    setGalleryImages([...galleryImages, newImage]);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setCurrentImageIndex(0);
  };

  const handleGalleryImageClick = (imageIndex) => {
    setSelectedGalleryImage(galleryImages[imageIndex]);
    setCurrentGalleryIndex(imageIndex);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewPost({...newPost, images: [...newPost.images, ...imageUrls]});
  };

  const removeImage = (index) => {
    const updatedImages = [...newPost.images];
    URL.revokeObjectURL(updatedImages[index]); // Clean up memory
    updatedImages.splice(index, 1);
    setNewPost({...newPost, images: updatedImages});
  };

  const nextImage = () => {
    if (selectedPost && selectedPost.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedPost.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedPost && selectedPost.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedPost.images.length - 1 : prev - 1
      );
    }
  };

  const nextGalleryImage = () => {
    if (galleryImages.length > 1) {
      const nextIndex = currentGalleryIndex === galleryImages.length - 1 ? 0 : currentGalleryIndex + 1;
      setCurrentGalleryIndex(nextIndex);
      setSelectedGalleryImage(galleryImages[nextIndex]);
    }
  };

  const prevGalleryImage = () => {
    if (galleryImages.length > 1) {
      const prevIndex = currentGalleryIndex === 0 ? galleryImages.length - 1 : currentGalleryIndex - 1;
      setCurrentGalleryIndex(prevIndex);
      setSelectedGalleryImage(galleryImages[prevIndex]);
    }
  };

  const renderImageCollage = (images) => {
    if (!images || images.length === 0) return null;
    
    if (images.length === 1) {
      return (
        <img
          src={images[0]}
          alt="post"
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    
    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="post"
              className="w-full h-full object-cover"
            />
          ))}
        </div>
      );
    }
    
    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          <img
            src={images[0]}
            alt="post"
            className="row-span-2 w-full h-full object-cover"
          />
          <img
            src={images[1]}
            alt="post"
            className="w-full h-full object-cover"
          />
          <img
            src={images[2]}
            alt="post"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    if (images.length >= 4) {
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-full relative">
          {images.slice(0, 4).map((img, i) => (
            <img
              key={i}
              src={img}
              alt="post"
              className={`w-full h-full object-cover ${i === 3 ? 'brightness-75' : ''}`}
            />
          ))}
          {images.length > 4 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm">
              +{images.length - 4} more
            </div>
          )}
        </div>
      );
    }
  };

  const AddNewCard = ({ onClick, type = "Post", className }) => (
    <div 
      onClick={onClick}
      className={`border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors ${className}`}
    >
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-4xl text-gray-400 mb-2">+</div>
        <span className="text-gray-500 text-base font-medium">Add New {type}</span>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}> 
      <div className="mx-auto p-2 bg-white">
        {/* Profile Header */}
        <div className="bg-white p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2 gap-2">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">Sabarinath_Rajendran29</h1>
                  <p className="text-sm font-semibold text-gray-800">FAM-8927 👑</p>
                </div>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 w-full sm:w-auto"
                  onClick={handleViewProfile}
                >
                  View profile
                </button>
              </div>
              
              <div className="flex justify-center sm:justify-start gap-6 text-base text-gray-800 mb-3">
                <span><strong>{posts.length}</strong> Posts</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-800">
            <h2 className="font-semibold mb-1">About</h2>
            <p className="text-gray-700">
              No big plans, no big dreams — just a simple life with good people, good food, and peaceful moments. This page? Just bits and pieces of a quiet, ordinary journey. 💤 and the day.. More 
            </p>
          </div>
        </div>

        {/* Tabs */}
      <div className="bg-gray-100 border-b border-gray-200">
  <div className="flex justify-center relative">
    {/* Add a full-width border line */}
    <div className="absolute top-0 left-0 right-0 border-t-2 border-gray-200"></div>
    
    <button
      onClick={() => setActiveTab('posts')}
      className={`flex items-center gap-2 px-6 py-3 text-base font-medium bg-transparent relative z-10 ${
        activeTab === 'posts' ? 'text-gray-800 font-semibold' : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      <span className="text-lg">⊞</span>
      Posts
    </button>

    <button
      onClick={() => setActiveTab('gallery')}
      className={`flex items-center gap-2 px-6 py-3 text-base font-medium bg-transparent relative z-10 ${
        activeTab === 'gallery' ? 'text-gray-800 font-semibold' : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      <span className="text-lg">🔖</span>
      Gallery
    </button>
  </div>
</div>

        {/* Content Section */}
        <div className="bg-white p-6">
          {activeTab === 'posts' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Add New Post Card - now with fixed height */}
              <AddNewCard 
                onClick={() => setShowPostModal(true)} 
                type="Post" 
                 className="h-42 w-48" 
              />
              
              {/* Existing Posts as Cards */}
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="relative group cursor-pointer h-64"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="w-full h-full rounded-lg overflow-hidden">
                    {renderImageCollage(post.images)}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex flex-col items-center justify-center p-4">
                    <div className="text-white text-base opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AddNewCard 
                onClick={handleAddGalleryImage} 
                type="Image" 
                className="h-64"
              />
              {galleryImages.map((photo, index) => (
                <img
                  key={photo.id}
                  src={photo.image}
                  alt="gallery"
                  className="w-full h-64 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => handleGalleryImageClick(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-0 overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gradient-to-r from-purple-500 to-pink-500">
              <h2 className="text-xl font-bold text-white">Create New Post</h2>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-gray-800">Sabarinath_Rajendran29</span>
            </div>
            
            {/* Post Content */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Title Input */}
              <div>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full p-3 border-0 text-xl font-medium placeholder-gray-400 focus:ring-0"
                  placeholder="What's on your mind?"
                  required
                />
              </div>
              
              {/* Description Input */}
              <div>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                  className="w-full p-3 border-0 text-gray-700 placeholder-gray-400 focus:ring-0 resize-none"
                  rows="3"
                  placeholder="Tell your story..."
                />
              </div>
              
              {/* Image Preview */}
              {newPost.images.length > 0 && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <div className="grid grid-cols-2 gap-1">
                    {newPost.images.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={img}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add Image Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {newPost.images.length > 0 ? 'Add More Photos' : 'Add Photos'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept="image/*"
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button className="p-2 text-green-500 hover:bg-green-50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={handleAddPost}
                  className={`px-6 py-2 rounded-full font-medium ${
                    newPost.images.length === 0 || !newPost.title.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md'
                  }`}
                  disabled={newPost.images.length === 0 || !newPost.title.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal with Image Navigation */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl flex flex-col md:flex-row max-h-[90vh]">
            <div className="md:w-2/3 bg-gray-100 flex items-center justify-center p-4 relative">
              <div className="w-full h-full max-h-[70vh] overflow-hidden rounded-lg relative">
                <img
                  src={selectedPost.images[currentImageIndex]}
                  alt="post"
                  className="w-full h-full object-contain"
                />
                
                {/* Navigation Arrows - Only show if more than 1 image */}
                {selectedPost.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {selectedPost.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedPost.images.length}
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-1/3 p-6 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedPost.title}</h2>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold">{selectedPost.author}</span>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedPost.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-gray-600">
                  <span>❤️ {selectedPost.likes} likes</span>
                  <span>💬 {selectedPost.comments} comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Image Modal with Navigation */}
      {selectedGalleryImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-20"
            >
              ×
            </button>
            
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <img
                src={selectedGalleryImage.image}
                alt="gallery"
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Navigation Arrows - Only show if more than 1 image */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevGalleryImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextGalleryImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  {currentGalleryIndex + 1} / {galleryImages.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyProfile;