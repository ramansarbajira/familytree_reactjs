import React, { useState, useRef } from 'react';

const AddPost = ({ onClose, onAddPost }) => {
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    images: [],
    author: 'You'
  });

  const fileInputRef = useRef(null);

  const handleAddPost = () => {
    if (newPost.images.length > 0 && newPost.title.trim()) {
      onAddPost(newPost);
      newPost.images.forEach((url) => URL.revokeObjectURL(url)); // Clean up URLs
      setNewPost({
        title: '',
        description: '',
        images: [],
        author: 'You'
      });
      onClose();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewPost(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
  };

  const removeImage = (index) => {
    const updatedImages = [...newPost.images];
    URL.revokeObjectURL(updatedImages[index]);
    updatedImages.splice(index, 1);
    setNewPost(prev => ({ ...prev, images: updatedImages }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex justify-between items-center">
          <h2 className="text-white text-xl font-bold">Create New Post</h2>
          <button onClick={onClose} className="text-white text-2xl">×</button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-4 border-b">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50"
            className="w-10 h-10 rounded-full object-cover border-2 shadow"
            alt="User"
          />
          <span className="font-semibold">Sabarinath_Rajendran29</span>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <input
            type="text"
            placeholder="What's on your mind?"
            value={newPost.title}
            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full text-xl font-medium focus:ring-0 border-none"
          />

          <textarea
            placeholder="Tell your story..."
            rows={3}
            value={newPost.description}
            onChange={e => setNewPost({ ...newPost, description: e.target.value })}
            className="w-full focus:ring-0 border-none resize-none"
          />

          {/* Image Preview */}
          {newPost.images.length > 0 && (
            <div className="grid grid-cols-2 gap-1 border rounded overflow-hidden">
              {newPost.images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="text-center">
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full"
            >
              {newPost.images.length > 0 ? 'Add More Photos' : 'Add Photos'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleAddPost}
            disabled={!newPost.title.trim() || newPost.images.length === 0}
            className={`px-6 py-2 rounded-full font-medium ${
              !newPost.title.trim() || newPost.images.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow'
            }`}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
