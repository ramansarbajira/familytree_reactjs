// Components/ViewProductModal.js
import React, { useState } from 'react';
import { FiX, FiShoppingCart, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';

const ViewProductModal = ({ isOpen, onClose, gift, onBuyNow }) => {
    // State to keep track of the currently displayed image index
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // If the modal isn't open or no gift data is provided, don't render anything
    if (!isOpen || !gift) return null;

    // Determine which images to display. Prioritize 'images' array if it exists and has items.
    // Otherwise, use the single 'image' property (if available) as a single-element array.
    // This ensures the component can gracefully handle both scenarios.
    const imagesToDisplay = gift.images && gift.images.length > 0
        ? gift.images
        : (gift.image ? [gift.image] : []); // Fallback to an empty array if no image at all

    // Handlers for navigating the image slider
    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? imagesToDisplay.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === imagesToDisplay.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col lg:flex-row relative transform scale-95 animate-zoom-in">
                {/* Close Button - positioned absolutely for easy access */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors z-10"
                    aria-label="Close"
                >
                    <FiX size={24} />
                </button>

                {/* Product Image Section with Slider */}
                <div className="lg:w-1/2 p-6 flex items-center justify-center bg-gray-50 rounded-l-xl relative">
                    {imagesToDisplay.length > 0 ? (
                        <img
                            src={imagesToDisplay[currentImageIndex]}
                            alt={`${gift.title} image ${currentImageIndex + 1}`}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                        />
                    ) : (
                        <div className="text-gray-400 text-center text-lg">No image available</div>
                    )}

                    {/* Navigation controls (arrows) - only show if there's more than one image */}
                    {imagesToDisplay.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
                                aria-label="Previous image"
                            >
                                <FiChevronLeft size={24} />
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
                                aria-label="Next image"
                            >
                                <FiChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Image dots indicator - only show if there's more than one image */}
                    {imagesToDisplay.length > 1 && (
                        <div className="absolute bottom-4 flex gap-2">
                            {imagesToDisplay.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-primary-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                    aria-label={`View image ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details Section */}
                <div className="lg:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                        {/* Rating Display */}
                        <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                                <FiStar
                                    key={i}
                                    className={`${i < Math.floor(gift.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    size={18}
                                />
                            ))}
                            <span className="text-sm text-gray-600 ml-2 font-medium">({gift.rating})</span>
                        </div>

                        {/* Product Title */}
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                            {gift.title}
                        </h2>

                        {/* Product Description */}
                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                            {gift.description}
                        </p>

                        {/* Price and Stock Status */}
                        <div className="flex items-baseline mb-6">
                            <span className="text-4xl font-extrabold text-primary-700 mr-3">
                                ₹{gift.price.toLocaleString('en-IN')}
                            </span>
                            {gift.stock <= 0 && (
                                <span className="text-red-500 font-semibold text-lg">Out of Stock</span>
                            )}
                        </div>
                    </div>

                    {/* Actions (Buy Now Button) */}
                    <div className="flex mt-6">
                        <button
                            onClick={() => { onBuyNow(gift.id); onClose(); }} // Trigger buy action and close modal
                            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300
                                ${gift.stock > 0
                                    ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                            disabled={gift.stock <= 0} // Disable if out of stock
                        >
                            <FiShoppingCart className="mr-2" size={20} />
                            {gift.stock > 0 ? 'Buy Now' : 'Sold Out'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProductModal;