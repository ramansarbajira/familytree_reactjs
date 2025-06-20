import React, { useState } from 'react';

const Gallery = ({ photos, onAddPhoto }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      onAddPhoto({
        image: newPhotoUrl
      });
      setNewPhotoUrl('');
      setShowAddForm(false);
    }
  };

  return (
    <div>
      {/* Add New Photo */}
      <div className="mb-6">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-white"
          >
            <div className="w-8 h-8 text-gray-400 mb-2 flex items-center justify-center text-2xl font-light">+</div>
            <span className="text-gray-500 font-medium">Add New Photo</span>
          </button>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Add New Photo</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo URL
              </label>
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddPhoto}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium"
              >
                Add Photo
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

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-1">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="aspect-square bg-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img 
              src={photo.image} 
              alt="Gallery" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-300 flex items-center justify-center text-2xl">📷</div>
          <p>No photos yet. Add your first photo!</p>
        </div>
      )}
    </div>
  );
};

export default Gallery;