// Components/BuyConfirmationModal.js
import React, { useState } from 'react';
import { FiX, FiShoppingCart, FiCheckCircle } from 'react-icons/fi';

const BuyConfirmationModal = ({ isOpen, onClose, gift, onConfirmBuy }) => {
    const [quantity, setQuantity] = useState(1);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryInstructions, setDeliveryInstructions] = useState('');
    const [giftMessage, setGiftMessage] = useState(''); // New state for the gift message
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen || !gift) return null;

    const handleQuantityChange = (e) => {
        const value = Math.max(1, parseInt(e.target.value) || 1);
        setQuantity(Math.min(value, gift.stock));
    };

    const handleConfirm = (e) => {
        e.preventDefault();

        if (!deliveryAddress.trim()) {
            alert('Please enter a delivery address.');
            return;
        }

        // Pass gift ID, quantity, and all delivery details including gift message to parent
        onConfirmBuy(gift.id, quantity, { deliveryAddress, deliveryInstructions, giftMessage });

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            // Reset form fields after successful confirmation and closing
            setQuantity(1);
            setDeliveryAddress('');
            setDeliveryInstructions('');
            setGiftMessage('');
        }, 2000);
    };

    const totalPrice = (gift.price * quantity).toLocaleString('en-IN');
    const productImage = gift.images && gift.images.length > 0 ? gift.images[0] : gift.image;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative transform scale-95 animate-zoom-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    aria-label="Close"
                >
                    <FiX size={24} />
                </button>

                {showSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <FiCheckCircle className="text-green-500 text-6xl mb-4 animate-bounce-once" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
                        <p className="text-gray-600">"{gift.title}" has been added to your order for delivery.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Confirm Your Order</h2>

                        {/* Product Details Section */}
                        <div className="flex items-center mb-6 border-b pb-4">
                            <img
                                src={productImage}
                                alt={gift.title}
                                className="w-24 h-24 object-cover rounded-lg mr-4 shadow-sm"
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">{gift.title}</h3>
                                <p className="text-gray-600 text-lg font-bold">₹{gift.price.toLocaleString('en-IN')}</p>
                                <p className="text-sm text-gray-500">In Stock: {gift.stock}</p>
                            </div>
                            <div className="flex flex-col items-center ml-4">
                                <label htmlFor="quantity" className="block text-gray-700 text-sm font-medium mb-1">
                                    Qty:
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    min="1"
                                    max={gift.stock}
                                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {quantity > gift.stock && (
                                    <p className="text-red-500 text-xs mt-1">Only {gift.stock} left!</p>
                                )}
                            </div>
                        </div>

                        {/* Delivery Address Section */}
                        <form onSubmit={handleConfirm}>
                            <div className="mb-6">
                                <label htmlFor="deliveryAddress" className="block text-gray-700 font-medium mb-2">
                                    Recipient's Delivery Address: <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="deliveryAddress"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    rows="3"
                                    placeholder="Enter full delivery address (e.g., Name, House No, Street, Landmark, City, Pincode)"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                ></textarea>
                            </div>

                            {/* Delivery Instructions Section */}
                            <div className="mb-6">
                                <label htmlFor="deliveryInstructions" className="block text-gray-700 font-medium mb-2">
                                    Delivery Instructions (Optional):
                                </label>
                                <input
                                    type="text"
                                    id="deliveryInstructions"
                                    value={deliveryInstructions}
                                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                                    placeholder="E.g., Leave with security, Call upon arrival"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Special Gift Message Section */}
                            <div className="mb-8">
                                <label htmlFor="giftMessage" className="block text-gray-700 font-medium mb-2">
                                    Special Gift Message (Optional):
                                </label>
                                <textarea
                                    id="giftMessage"
                                    value={giftMessage}
                                    onChange={(e) => setGiftMessage(e.target.value)}
                                    rows="3"
                                    placeholder="Enter your personalized message for the recipient (e.g., 'Happy Birthday!', 'Thinking of you!')"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    maxLength="200" // Example: limit message length
                                ></textarea>
                                <p className="text-sm text-gray-500 mt-1">
                                    Max 200 characters. This message will be included with the gift.
                                </p>
                            </div>

                            {/* Total Price Display */}
                            <div className="flex justify-between items-center text-2xl font-bold text-gray-900 mb-8">
                                <span>Total Payable:</span>
                                <span>₹{totalPrice}</span>
                            </div>

                            {/* Confirm Purchase Button */}
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center bg-primary-600 text-white rounded-lg px-6 py-3 text-lg font-semibold shadow-md
                                           hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity > gift.stock || gift.stock === 0 || !deliveryAddress.trim()}
                            >
                                <FiShoppingCart className="mr-2" size={20} />
                                Confirm Order
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default BuyConfirmationModal;