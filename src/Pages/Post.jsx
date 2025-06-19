import React, { useState } from 'react';

const Post = ({ posts, onAddPost }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');

  const handleAddPost = () => {
    if (newPostImage.trim()) {
      onAddPost({
        image: newPostImage,
        caption: newPostCaption
      });
      setNewPostImage('');
      setNewPostCaption('');
      setShowAddForm(false);
    }
  };

  return (
    <div>
      {/* Add New Post Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <div className="w-8 h-8 text-gray-400 mb-2 flex items-center justify-center text-2xl font-light">+</div>
            <span className="text-gray-500 font-medium">Add New Post</span>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Add New Post</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <textarea
                value={newPostCaption}
                onChange={(e) => setNewPostCaption(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Write a caption..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddPost}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium"
              >
                Add Post
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-sm">Sabarinath_Rajendran29</span>
              </div>
              <button className="text-gray-500 cursor-pointer hover:text-gray-700">⋯</button>
            </div>

            {/* Post Image */}
            <div className="aspect-square">
              <img 
                src={post.image} 
                alt="Post" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <button className="text-xl cursor-pointer hover:text-red-500">♡</button>
                  <button className="text-xl cursor-pointer hover:text-gray-600">💬</button>
                  <button className="text-xl cursor-pointer hover:text-gray-600">↗</button>
                </div>
                <button className="text-xl cursor-pointer hover:text-gray-600">🔖</button>
              </div>
              
              <p className="font-semibold text-sm mb-1">1,234 likes</p>
              
              {post.caption && (
                <p className="text-sm">
                  <span className="font-semibold">Sabarinath_Rajendran29</span> {post.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">+</span>
          </div>
          <p>No posts yet. Create your first post!</p>
        </div>
      )}
    </div>
  );
};

export default Post;