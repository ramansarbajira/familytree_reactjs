import React, { useState, useRef } from 'react';

const AddGallery = ({ onClose, onAddImages }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...imageUrls]);
  };

  const removeImage = (index) => {
    const updated = [...selectedImages];
    URL.revokeObjectURL(updated[index]);
    updated.splice(index, 1);
    setSelectedImages(updated);
  };

  const handleAddImages = () => {
    if (selectedImages.length > 0) {
      onAddImages(selectedImages);
      selectedImages.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-gradient-to-r from-green-500 to-blue-500 text-white border-b">
          <h2 className="text-xl font-bold">Add to Gallery</h2>
          <button onClick={onClose} className="text-2xl">×</button>
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

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-center text-gray-600">Select photos to add to your gallery</p>

          {/* Preview */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-1 border rounded">
              {selectedImages.map((img, index) => (
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

          {/* Upload */}
          <div className="text-center">
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full"
            >
              {selectedImages.length > 0 ? 'Add More Photos' : 'Select Photos'}
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

          {selectedImages.length > 0 && (
            <p className="text-sm text-gray-500 text-center">
              {selectedImages.length} photo{selectedImages.length > 1 && 's'} selected
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleAddImages}
            disabled={selectedImages.length === 0}
            className={`px-6 py-2 rounded-full font-medium ${
              selectedImages.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow'
            }`}
          >
            Add to Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGallery;
