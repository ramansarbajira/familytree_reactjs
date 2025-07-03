import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { FaUserPlus, FaCheckCircle, FaTimesCircle, FaSearch } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import InviteFamilyMemberModal from '../Components/InviteFamilyMemberModal';

const PendingRequestCard = ({ request, onAccept, onReject }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-5 mb-4">
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-100 shadow-xs">
            <img
              src={request.profilePic || "https://placehold.co/80x80/f5f5f5/e0e0e0?text=👤"}
              alt={request.name}
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = "https://placehold.co/80x80/f5f5f5/e0e0e0?text=👤"}
            />
          </div>
        </div>

        {/* Requestor Info */}
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">{request.name}</h3>
              <p className="text-gray-600 text-sm">{request.email}</p>
              {request.contact && (
                <p className="text-gray-500 text-xs mt-1">
                  <span className="font-medium">Contact:</span> {request.contact}
                </p>
              )}
            </div>
          </div>

          <div className="text-gray-500 text-xs">
            <span>Requested on: {request.requestedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 md:ml-auto">
          <button
            onClick={() => onAccept(request.memberId, request.familyCode)}
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
          >
            <FaCheckCircle className="mr-2 text-lg" /> Accept
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
          >
            <FaTimesCircle className="mr-2 text-lg" /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const PendingFamilyRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${baseUrl}/family/member/requests/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending family requests');
      }

      const result = await response.json();
      const data = result.data || [];

      const formatted = data.map((item) => ({
        id: item.id,
        memberId: item.memberId,
        familyCode: item.familyCode,
        name: item.user?.fullName || 'Unknown',
        email: item.user?.email || '',
        contact: item.user?.mobile || '',
        requestedDate: new Date(item.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        profilePic: item.user?.profileImage,
        status: item.approveStatus,
      }));

      setPendingRequests(formatted);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };
  
  const handleAccept = async (memberId, familyCode) => {
      try {
      const token = localStorage.getItem('access_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${baseUrl}/family/member/approve/${memberId}/${familyCode}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Approval Failed',
          text: errorData.message || 'Failed to approve request',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Request Approved',
        text: 'The family member request has been approved successfully.',
      });

      await fetchRequests(); // Refresh the list
    } catch (err) {
      console.error('Approval error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while approving the request.',
      });
    }
  };

  const handleReject = async (memberId, familyCode) => {
    try {
      const token = localStorage.getItem('access_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${baseUrl}/family/member/reject/${memberId}/${familyCode}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Rejection Failed',
          text: errorData.message || 'Failed to reject request',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Request Rejected',
        text: 'The family member request has been rejected.',
      });

      await fetchRequests(); // Refresh the list
    } catch (err) {
      console.error('Rejection error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while rejecting the request.',
      });
    }
  };

  const filteredRequests = pendingRequests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || request.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Layout>
      {/* UI headers, filters, modal toggle etc. remain unchanged */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <FaUserPlus className="mr-3 text-blue-600" />
            Pending Family Requests
          </h1>
          <p className="text-gray-600">Review and manage pending requests.</p>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex-grow relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setShowInviteModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow">
            <FiPlus className="inline mr-2" />
            Invite New Member
          </button>
        </div>

        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <PendingRequestCard
              key={request.id}
              request={request}
              onAccept={handleAccept}
              onReject={() => handleReject(request.memberId, request.familyCode)}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No pending requests found.
          </div>
        )}
      </div>

      {showInviteModal && <InviteFamilyMemberModal onClose={() => setShowInviteModal(false)} />}
    </Layout>
  );
};

export default PendingFamilyRequests;
