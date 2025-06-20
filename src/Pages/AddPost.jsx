// AddPost.js
import React, { useRef } from 'react';

const AddPost = ({ newPost, setNewPost, handleAddPost, setShowPostModal, fileInputRef, handleFileChange, removeImage }) => {
  return (
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
          <input
            type="text"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full p-3 border-0 text-xl font-medium placeholder-gray-400 focus:ring-0"
            placeholder="What's on your mind?"
            required
          />

          <textarea
            value={newPost.description}
            onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
            className="w-full p-3 border-0 text-gray-700 placeholder-gray-400 focus:ring-0 resize-none"
            rows="3"
            placeholder="Tell your story..."
          />

          {newPost.images.length > 0 && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="grid grid-cols-2 gap-1">
                {newPost.images.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
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

     <div className="p-4 border-t border-gray-200 bg-gray-50">
  <div className="flex justify-end space-x-4">
    <button
      onClick={() => setShowPostModal(false)}
      className="px-6 py-2 rounded-full font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
    >
      Cancel
    </button>
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
  );
};

export default AddPost;
