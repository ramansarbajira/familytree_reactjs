import React, { useState } from 'react';
import AddGallery from './AddGallery'; // Make sure AddGallery.jsx exists

const Gallery = ({
  galleryImages = [],
  onAddGalleryImage = () => {},
  onGalleryImageClick = () => {},
}) => {
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);

  const handleAddImage = (newImages) => {
    newImages.forEach((img) => {
      onAddGalleryImage(img);
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setShowAddGalleryModal(true)}
          className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-64 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          <div className="text-center">
            <div className="text-4xl text-gray-400">+</div>
            <span className="text-gray-500 font-medium">Add New Image</span>
          </div>
        </div>

        {galleryImages.map((photo, index) => (
          <img
            key={photo.id}
            src={photo.image}
            alt="gallery"
            className="w-full h-64 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => onGalleryImageClick(index)}
          />
        ))}
      </div>

      {showAddGalleryModal && (
        <AddGallery onClose={() => setShowAddGalleryModal(false)} onAddImages={handleAddImage} />
      )}
    </>
  );
};

export default Gallery;
