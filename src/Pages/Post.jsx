import React, { useState } from 'react';
import AddPost from './AddPost'; // Make sure AddPost.jsx exists

const Post = ({ posts = [], onPostClick = () => {}, onAddPost = () => {} }) => {
  const [showPostModal, setShowPostModal] = useState(false);

  const renderImageCollage = (images) => {
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
      return <img src={images[0]} alt="post" className="w-full h-full object-cover rounded-lg" />;
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          {images.map((img, i) => (
            <img key={i} src={img} alt="post" className="w-full h-full object-cover" />
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          <img src={images[0]} alt="post" className="row-span-2 w-full h-full object-cover" />
          <img src={images[1]} alt="post" className="w-full h-full object-cover" />
          <img src={images[2]} alt="post" className="w-full h-full object-cover" />
        </div>
      );
    }

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
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        onClick={() => setShowPostModal(true)}
        className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-40 w-48 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        <div className="text-center">
          <div className="text-4xl text-gray-400">+</div>
          <span className="text-gray-500 font-medium">Add New Post</span>
        </div>
      </div>

      {posts.map((post) => (
        <div
          key={post.id}
          className="relative group cursor-pointer h-64"
          onClick={() => onPostClick(post)}
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

      {showPostModal && (
        <AddPost onClose={() => setShowPostModal(false)} onAddPost={onAddPost} />
      )}
    </div>
  );
};

export default Post;
