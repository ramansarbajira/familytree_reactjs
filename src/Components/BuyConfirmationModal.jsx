import React, { useState, useEffect } from 'react';
import { FiX, FiShoppingCart, FiCheckCircle, FiLoader, FiUser, FiMapPin, FiMessageSquare, FiPackage, FiMinus, FiPlus, FiGift, FiCalendar, FiTruck, FiDownload } from 'react-icons/fi';

const BuyConfirmationModal = ({
  isOpen,
  onClose,
  gift,
  onConfirmBuy,
  userId,
  familyCode,
  from = "Chennai",
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL,
  initialQuantity = 1, // New prop for initial quantity from parent
  userInfo = null, // Add userInfo prop to check approval status
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [receiverId, setReceiverId] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [hasFamily, setHasFamily] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Update quantity when initialQuantity prop changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  // === Check user approval status and fetch family members when modal opens ===
  useEffect(() => {
    if (isOpen) {
      // Check if user has family code and is approved
      const checkUserStatus = () => {
        const hasFamilyCode = familyCode && familyCode.trim() !== '';
        const isUserApproved = userInfo?.approveStatus === 'approved';
        
        setHasFamily(hasFamilyCode && isUserApproved);
        setIsApproved(isUserApproved);
        
        return hasFamilyCode && isUserApproved;
      };
      
      const shouldFetchFamily = checkUserStatus();
      
      if (shouldFetchFamily) {
        const fetchFamilyMembers = async () => {
          try {
            setIsLoading(true);
            const token = localStorage.getItem('access_token');
            
            const response = await fetch(`${apiBaseUrl}/family/member/${familyCode}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ Response error:', errorText);
              throw new Error(`Failed to fetch family members: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            const membersArray = responseData.data || responseData || [];
            
            const mappedMembers = membersArray.map(member => ({
              userId: member.user.id,
              firstName: member.user.userProfile?.firstName || '',
              lastName: member.user.userProfile?.lastName || '',
              address: member.user.userProfile?.address || '',
              fullName: member.user.fullName || ''
            }));
            
            setFamilyMembers(mappedMembers);
            setError('');
          } catch (err) {
            console.error('💥 Error fetching family members:', err);
            setError(`Unable to load family members: ${err.message}`);
            setFamilyMembers([]);
            setHasFamily(false);
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchFamilyMembers();
      } else {
        setIsLoading(false);
        setFamilyMembers([]);
      }
    }
  }, [isOpen, familyCode, apiBaseUrl, userInfo]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      setReceiverId(null);
      setReceiverName('');
      setDeliveryAddress('');
      setDeliveryInstructions('');
      setGiftMessage('');
      setShowSuccess(false);
      setOrderDetails(null);
      setError('');
    }
  }, [isOpen, initialQuantity]);

  // Helper function to determine if user can select family members
  const canSelectFamilyMembers = () => {
    return hasFamily && isApproved && familyMembers.length > 0;
  };

  // Helper function to check if user has family code and is approved
  const hasFamilyCodeAndApproved = () => {
    const hasCode = familyCode && familyCode.trim() !== '';
    const isApproved = userInfo?.approveStatus === 'approved';
    return hasCode && isApproved;
  };

  if (!isOpen || !gift) return null;

  // Filter out the current user from family members
  const filteredFamilyMembers = familyMembers.filter(member => member.userId !== userId);

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(Math.min(value, gift.stock));
  };

  const incrementQuantity = () => {
    const newQuantity = Math.min(quantity + 1, gift.stock);
    setQuantity(newQuantity);
  };

  const decrementQuantity = () => {
    const newQuantity = Math.max(quantity - 1, 1);
    setQuantity(newQuantity);
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${randomNum}`;
  };

  const extractCityFromAddress = (address) => {
    if (!address) return "No Address";
    const parts = address.split(',');
    return parts.length > 2 ? parts[parts.length - 2].trim() : "Unknown City";
  };

  const calculateDeliveryDuration = (fromCity, toCity) => {
    return fromCity.toLowerCase() === toCity.toLowerCase() ? 1 : Math.floor(Math.random() * 5) + 2;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');

    // Validation based on user scenario
    if (hasFamilyCodeAndApproved() && !receiverId) {
      setError('Please select a receiver.');
      return;
    }

    if (!receiverName.trim() && !hasFamilyCodeAndApproved()) {
      setError('Please enter receiver name.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address.');
      return;
    }

    setIsLoading(true);

    try {
      const toCity = extractCityFromAddress(deliveryAddress);
      const deliveryDuration = calculateDeliveryDuration(from, toCity);
      const orderNumber = generateOrderNumber();

      const orderData = {
        userId: userId,
        receiverId: hasFamilyCodeAndApproved() ? receiverId : null, // null for users without family code or not approved
        receiverName: hasFamilyCodeAndApproved() ? receiverName : receiverName.trim(),
        from: from,
        to: deliveryAddress,
        duration: deliveryDuration,
        productId: gift.id,
        price: gift.price * quantity,
        deliveryStatus: "pending",
        paymentStatus: "unpaid",
        createdBy: userId,
        quantity: quantity,
        deliveryInstructions: deliveryInstructions,
        giftMessage: giftMessage,
      };

      // Store order details for confirmation popup
      const confirmationDetails = {
        orderNumber: orderNumber,
        gift: gift,
        quantity: quantity,
        totalPrice: gift.price * quantity,
        receiverName: hasFamilyCodeAndApproved() ? receiverName : receiverName.trim(),
        deliveryAddress: deliveryAddress,
        deliveryInstructions: deliveryInstructions,
        giftMessage: giftMessage,
        deliveryDuration: deliveryDuration,
        from: from,
        toCity: extractCityFromAddress(deliveryAddress),
        orderDate: new Date().toLocaleDateString('en-IN'),
        orderTime: new Date().toLocaleTimeString('en-IN'),
      };

      const response = await fetch(`${apiBaseUrl}/order/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (onConfirmBuy) {
        onConfirmBuy(gift.id, quantity, {
          receiverName: hasFamilyCodeAndApproved() ? receiverName : receiverName.trim(),
          deliveryAddress,
          deliveryInstructions,
          giftMessage,
          familyCode,
          orderData: result,
          orderNumber: orderNumber
        });
      }

      setOrderDetails(confirmationDetails);
      setShowSuccess(true);
     

    } catch (error) {
      console.error(error);
      setError(error.message || 'Order failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = (gift.price * quantity).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-0 relative max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiGift className="text-2xl" />
              <h2 className="text-2xl font-bold">Complete Your Order</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all"
              aria-label="Close"
              disabled={isLoading}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(95vh-80px)] overflow-y-auto">
          {showSuccess && orderDetails ? (
            <div className="p-6">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-green-600 text-4xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
                <p className="text-gray-600">Your gift order has been successfully placed</p>
              </div>

              {/* Order Details */}
              <div className="space-y-6">
                {/* Order Number */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Order Number</h3>
                    <span className="text-xl font-bold text-primary-600">{orderDetails.orderNumber}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Placed on {orderDetails.orderDate} at {orderDetails.orderTime}
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiPackage className="mr-3 text-primary-600" />
                    Product Details
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <img
                        src={orderDetails.gift.images && orderDetails.gift.images.length > 0 ? orderDetails.gift.images[0] : 'https://placehold.co/64x64?text=No+Image'}
                        alt={orderDetails.gift.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/64x64?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{orderDetails.gift.title}</h4>
                      <p className="text-sm text-gray-600">{orderDetails.gift.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Quantity: {orderDetails.quantity}</span>
                        <span className="font-semibold text-primary-600">₹{orderDetails.gift.price.toLocaleString('en-IN')} each</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Details */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiTruck className="mr-3 text-primary-600" />
                    Delivery Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Receiver</label>
                      <p className="text-gray-800 font-medium">{orderDetails.receiverName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Address</label>
                      <p className="text-gray-800">{orderDetails.deliveryAddress}</p>
                    </div>
                    {orderDetails.deliveryInstructions && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Instructions</label>
                        <p className="text-gray-800">{orderDetails.deliveryInstructions}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
                        <p className="text-gray-800">{orderDetails.from}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
                        <p className="text-gray-800">{orderDetails.toCity}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Estimated Delivery</label>
                      <p className="text-gray-800">{orderDetails.deliveryDuration} day{orderDetails.deliveryDuration > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Gift Message */}
                {orderDetails.giftMessage && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FiMessageSquare className="mr-3 text-primary-600" />
                      Gift Message
                    </h3>
                    <p className="text-gray-800 italic">"{orderDetails.giftMessage}"</p>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiShoppingCart className="mr-3 text-green-600" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Product Price:</span>
                      <span className="font-medium">₹{orderDetails.gift.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{orderDetails.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="border-t border-green-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-800">Total Paid:</span>
                        <span className="text-2xl font-bold text-green-600">₹{orderDetails.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      // You can add functionality to download invoice or share order details
                      console.log('Download invoice for order:', orderDetails.orderNumber);
                    }}
                    className="flex-1 px-6 py-3 border border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <FiDownload size={16} />
                    <span>Download Invoice</span>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="text-center text-sm text-gray-500">
                  <p>You'll receive a confirmation email shortly with tracking details.</p>
                  <p className="mt-1">For any queries, please contact our support team.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
                  <FiX className="mr-2" />
                  {error}
                </div>
              )}

              {/* Product Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <img
                      src={gift.images && gift.images.length > 0 ? gift.images[0] : 'https://placehold.co/80x80?text=No+Image'}
                      alt={gift.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/80x80?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{gift.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{gift.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-600">₹{gift.price.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-gray-500">Stock: {gift.stock}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quantity:</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1 || isLoading}
                      className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <FiMinus size={16} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={gift.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      disabled={isLoading}
                      className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 font-semibold focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= Math.min(gift.stock, 10) || isLoading}
                      className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <FiPlus size={16} />
                    </button>
                    <span className="text-sm text-gray-500">Max: {Math.min(gift.stock, 10)}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirm} className="space-y-6">
                {/* Receiver Selection - Show dropdown for approved family users, input for others */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <FiUser className="text-primary-600 mr-3" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {hasFamilyCodeAndApproved() ? 'Select Receiver' : 'Receiver Name'}
                    </h3>
                  </div>
                  
                  
                  {hasFamilyCodeAndApproved() ? (
                    // Show dropdown for approved family users
                    <>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <FiLoader className="animate-spin mr-3 text-primary-600" />
                          <span className="text-gray-600">Loading family members...</span>
                        </div>
                      ) : filteredFamilyMembers.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
                          <p className="text-sm">
                            {familyMembers.length === 0 
                              ? "No family members found. Please check your family code or add family members first."
                              : "No other family members available to send gifts to."
                            }
                          </p>
                        </div>
                      ) : (
                        <select
                          value={receiverId || ''}
                          onChange={(e) => {
                            const selectedId = parseInt(e.target.value);
                            const selectedMember = filteredFamilyMembers.find(m => m.userId === selectedId);
                            
                            if (selectedMember) {
                              setReceiverId(selectedId);
                              setReceiverName(selectedMember.fullName || `${selectedMember.firstName || ''} ${selectedMember.lastName || ''}`.trim());
                              if (selectedMember.address) {
                                setDeliveryAddress(selectedMember.address);
                              }
                            }
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                          required
                        >
                          <option value="">-- Select Family Member --</option>
                          {filteredFamilyMembers.map((member) => {
                            const memberName = member.fullName || `${member.firstName || 'No Name'} ${member.lastName || ''}`.trim();
                            const cityInfo = member.address ? ` (${extractCityFromAddress(member.address)})` : '';
                            
                            return (
                              <option key={member.userId} value={member.userId}>
                                {memberName}{cityInfo}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </>
                  ) : (
                    // Show input field for users without family code or not approved
                    <div>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter receiver's full name..."
                        required
                        disabled={isLoading}
                      />
                      {!familyCode || familyCode.trim() === '' ? (
                        <p className="text-sm text-gray-500 mt-2">
                          You can send gifts to anyone by entering their name manually.
                        </p>
                      ) : userInfo?.approveStatus !== 'approved' && (
                        <p className="text-sm text-yellow-600 mt-2">
                          Your family membership is pending approval. You can still send gifts by entering the receiver's name manually.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <FiMapPin className="text-primary-600 mr-3" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
                  </div>
                  <textarea
                    rows="3"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder="Enter complete delivery address..."
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Delivery Instructions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <FiTruck className="text-primary-600 mr-3" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Delivery Instructions</h3>
                    <span className="ml-2 text-sm text-gray-500">(Optional)</span>
                  </div>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Leave at front door, Call before delivery..."
                    disabled={isLoading}
                  />
                </div>

                {/* Gift Message */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <FiMessageSquare className="text-primary-600 mr-3" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Gift Message</h3>
                    <span className="ml-2 text-sm text-gray-500">(Optional)</span>
                  </div>
                  <textarea
                    rows="3"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder="Write a personal message for the recipient..."
                    disabled={isLoading}
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <FiPackage className="text-primary-600 mr-3" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Product Price:</span>
                      <span className="font-medium">₹{gift.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="border-t border-primary-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-800">Total:</span>
                        <span className="text-2xl font-bold text-primary-600">₹{totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    (hasFamilyCodeAndApproved() && !receiverId) || 
                    (!hasFamilyCodeAndApproved() && !receiverName.trim()) ||
                    !deliveryAddress.trim() || 
                    isLoading || 
                    (hasFamilyCodeAndApproved() && filteredFamilyMembers.length === 0)
                  }
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl px-6 py-4 font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                >                         
                  {isLoading ? (
                    <>
                      <FiLoader className="animate-spin" size={20} />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <FiShoppingCart size={20} />
                      <span>Confirm Order - ₹{totalPrice}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyConfirmationModal;