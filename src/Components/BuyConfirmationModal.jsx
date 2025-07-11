import React, { useState, useEffect } from 'react';
import { FiX, FiShoppingCart, FiCheckCircle, FiLoader } from 'react-icons/fi';

const BuyConfirmationModal = ({
  isOpen,
  onClose,
  gift,
  onConfirmBuy,
  userId,
  familyCode,
  from = "Chennai",
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [receiverId, setReceiverId] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);

  // === Fetch family members when modal opens ===
  useEffect(() => {
    if (isOpen && familyCode) {
      const fetchFamilyMembers = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem('access_token');
          
          console.log('🔍 Fetching family members for familyCode:', familyCode);
          console.log('🔑 Token exists:', !!token);
          
          const response = await fetch(`${apiBaseUrl}/family/member/${familyCode}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('📡 Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response error:', errorText);
            throw new Error(`Failed to fetch family members: ${response.status}`);
          }
          
          const responseData = await response.json();
          console.log('✅ Raw API response:', responseData);
          
          // FIX: Extract the actual array from the response and map to correct structure
          const membersArray = responseData.data || responseData || [];
          console.log('📊 Family members array:', membersArray);
          console.log('👥 Family members count:', membersArray.length);
          
          // Map the nested user data to the expected structure
          const mappedMembers = membersArray.map(member => ({
            userId: member.user.id,
            firstName: member.user.userProfile?.firstName || '',
            lastName: member.user.userProfile?.lastName || '',
            address: member.user.userProfile?.address || '',
            fullName: member.user.fullName || ''
          }));
          
          console.log('👥 Mapped family members structure:', mappedMembers);
          
          setFamilyMembers(mappedMembers);
          setError('');
        } catch (err) {
          console.error('💥 Error fetching family members:', err);
          setError(`Unable to load family members: ${err.message}`);
          setFamilyMembers([]); // Reset to empty array on error
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchFamilyMembers();
    }
  }, [isOpen, familyCode, apiBaseUrl]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('🔄 Family members state updated:', familyMembers);
  }, [familyMembers]);

  if (!isOpen || !gift) return null;

  // Filter out the current user from family members
  const filteredFamilyMembers = familyMembers.filter(member => member.userId !== userId);

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(Math.min(value, gift.stock));
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

    if (!receiverId) {
      setError('Please select a receiver.');
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
        // orderNumber: "",
        userId: userId,
        receiverId: receiverId,
        receiverName: receiverName,
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
          receiverName,
          deliveryAddress,
          deliveryInstructions,
          giftMessage,
          familyCode,
          orderData: result,
          orderNumber: orderNumber
        });
      }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          aria-label="Close"
          disabled={isLoading}
        >
          <FiX size={24} />
        </button>

        {showSuccess ? (
          <div className="text-center py-10">
            <FiCheckCircle className="text-green-500 text-6xl mb-4" />
            <h2 className="text-2xl font-bold">Order Confirmed!</h2>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">Place Your Order</h2>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            {/* Debug Information - Remove this in production */}
            {/* <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs">
              <strong>Debug Info:</strong><br/>
              Family Code: {familyCode || 'Not set'}<br/>
              Current User ID: {userId || 'Not set'}<br/>
              Total Family Members: {familyMembers.length}<br/>
              Filtered Family Members: {filteredFamilyMembers.length}<br/>
              Loading: {isLoading ? 'Yes' : 'No'}<br/>
              {filteredFamilyMembers.length > 0 && (
                <>Filtered Members: {filteredFamilyMembers.map(m => `${m.firstName} ${m.lastName}`).join(', ')}</>
              )}
            </div> */}

            <div className="flex items-center mb-6 border-b pb-4">
              <div className="w-24 h-24 rounded-lg mr-4 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Product</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{gift.title}</h3>
                <p className="text-lg font-bold">₹{gift.price.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-500">Stock: {gift.stock}</p>
              </div>
              <div className="ml-4">
                <label className="block text-sm mb-1">Qty:</label>
                <input
                  type="number"
                  min="1"
                  max={gift.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={isLoading}
                  className="w-20 border rounded px-2 py-1 text-center"
                />
              </div>
            </div>

            <form onSubmit={handleConfirm}>
              <div className="mb-6">
                <label className="block mb-2 font-semibold">Select Receiver:</label>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <FiLoader className="animate-spin mr-2" />
                    Loading family members...
                  </div>
                ) : filteredFamilyMembers.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
                    {familyMembers.length === 0 
                      ? "No family members found. Please check your family code or add family members first."
                      : "No other family members available to send gifts to. You cannot send a gift to yourself."
                    }
                  </div>
                ) : (
                  <select
                    value={receiverId || ''}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      console.log('🎯 Selected receiver ID:', selectedId);
                      
                      const selectedMember = filteredFamilyMembers.find(m => m.userId === selectedId);
                      console.log('👤 Selected member:', selectedMember);
                      
                      if (selectedMember) {
                        setReceiverId(selectedId);
                        setReceiverName(selectedMember.fullName || `${selectedMember.firstName || ''} ${selectedMember.lastName || ''}`.trim());
                        if (selectedMember.address) {
                          setDeliveryAddress(selectedMember.address);
                        }
                      }
                    }}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Select Family Member --</option>
                    {filteredFamilyMembers.map((member) => {
                      const memberName = member.fullName || `${member.firstName || 'No Name'} ${member.lastName || ''}`.trim();
                      const cityInfo = member.address ? ` (${extractCityFromAddress(member.address)})` : '';
                      
                      return (
                        <option 
                          key={member.userId} 
                          value={member.userId}
                        >
                          {memberName}{cityInfo}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-semibold">Delivery Address:</label>
                <textarea
                  rows="3"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full delivery address..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-semibold">Delivery Instructions (Optional):</label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Leave at front door, Call before delivery..."
                  disabled={isLoading}
                />
              </div>

              <div className="mb-8">
                <label className="block mb-2 font-semibold">Gift Message (Optional):</label>
                <textarea
                  rows="2"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write a personal message for the recipient..."
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-between items-center text-2xl font-bold mb-8 p-4 bg-gray-50 rounded-lg">
                <span>Total:</span>
                <span className="text-blue-600">₹{totalPrice}</span>
              </div>

              <button
                type="submit"
                disabled={!receiverId || !deliveryAddress.trim() || isLoading || filteredFamilyMembers.length === 0}
                className="w-full bg-primary-600 text-white rounded-lg px-6 py-4 font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >                         
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="mr-2" />
                    Confirm Order
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BuyConfirmationModal;