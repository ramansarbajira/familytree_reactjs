import React, { useState } from 'react';
import { FiX, FiHash, FiUsers } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useUser } from '../Contexts/UserContext';
import { jwtDecode } from 'jwt-decode';

// Helper to fetch user's first name from profile
async function fetchUserFirstName(userId, accessToken) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile/${userId}`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  return data?.data?.userProfile?.firstName || '';
}

const JoinFamilyModal = ({ isOpen, onClose, token, onFamilyJoined }) => {
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { userInfo } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!familyCode.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Family Code Required',
        text: 'Please enter a valid family code to join.',
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      let userId = null;
      let firstName = '';
      
      if (accessToken) {
        const decoded = jwtDecode(accessToken);
        userId = decoded?.id || decoded?.userId || decoded?.sub;
        // Fetch the user's first name from their profile
        firstName = await fetchUserFirstName(userId, accessToken);
      }
      
      if (!userId) throw new Error('User ID not found');
      
      // 1. Get admin user IDs for the family
      const adminRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/${familyCode.trim()}/admins`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const adminData = await adminRes.json();
      const adminIds = adminData.data || [];
      
      // 2. Send notification to admins
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: 'FAMILY_JOIN_REQUEST',
          title: 'New Family Join Request',
          message: `${firstName} has requested to join your family using the code ${familyCode.trim()}.`,
          familyCode: familyCode.trim(),
          referenceId: userId,
          userIds: adminIds,
        }),
      });
      
      await Swal.fire({
        icon: 'success',
        title: 'Your Request Sent',
        text: 'Your request was sent to the family admins.',
        confirmButtonColor: '#3f982c'
      });
      
      onClose();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Failed to send join request', 
        text: 'Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-inter">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="bg-unset absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="text-2xl text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Family</h2>
          <p className="text-gray-600">Enter the family code to join an existing family</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Family Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter family code (e.g., FAM123456)"
                maxLength={10}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ask the family administrator for the family code
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !familyCode.trim()}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Joining...' : 'Join Family'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <h4 className="font-semibold text-primary-800 mb-2">What happens next?</h4>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>• Your request will be sent to the family administrator</li>
            <li>• You'll receive a notification once approved</li>
            <li>• You can join a different family while waiting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinFamilyModal; 