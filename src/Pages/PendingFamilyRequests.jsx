import React, { useState } from 'react';
import Layout from '../Components/Layout';
import { FaUserPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Icons for pending requests
import { FiSearch, FiPlus } from 'react-icons/fi'; // Import FiPlus for the invite button
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

// Component for a single pending request card
const PendingRequestCard = ({ request, onAccept, onReject }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg p-5 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-4 border-blue-400 shadow-md">
          <img
            src={request.profilePic || "https://placehold.co/80x80/E0F2F7/2196F3?text=👤"}
            alt={request.name}
            className="w-full h-full object-cover"
            onError={(e) => e.target.src = "https://placehold.co/80x80/E0F2F7/2196F3?text=👤"}
          />
        </div>
        {/* Requestor Info */}
        <div>
          <h3 className="text-xl font-bold text-gray-800">{request.name}</h3>
          <p className="text-gray-600 text-sm">{request.email} {request.contact && ` | ${request.contact}`}</p>
          <p className="text-gray-500 text-sm">Requested to join as <span className="font-semibold text-primary-600">{request.requestedRelation}</span></p>
          <p className="text-gray-500 text-xs mt-1">Requested on: {request.requestedDate}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
        <button
          onClick={() => onAccept(request.id)}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
        >
          <FaCheckCircle className="mr-2" /> Accept
        </button>
        <button
          onClick={() => onReject(request.id)}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200"
        >
          <FaTimesCircle className="mr-2" /> Reject
        </button>
      </div>
    </div>
  );
};

const PendingFamilyRequests = ({ onAcceptRequest, onRejectRequest }) => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'req1',
      name: 'Michael Jordan',
      email: 'michael.j@example.com',
      contact: '1122334455',
      requestedRelation: 'Uncle',
      requestedDate: 'June 18, 2025',
      profilePic: 'https://placehold.co/80x80/DBEAFE/3B82F6?text=MJ'
    },
    {
      id: 'req2',
      name: 'LeBron James',
      email: 'lebron.j@example.com',
      contact: '',
      requestedRelation: 'Brother-in-law',
      requestedDate: 'June 17, 2025',
      profilePic: 'https://placehold.co/80x80/FEE2E2/EF4444?text=LJ'
    },
    // Add more sample pending requests here
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAccept = (id) => {
    const acceptedRequest = pendingRequests.find(req => req.id === id);
    if (acceptedRequest) {
      alert(`Accepted request from ${acceptedRequest.name}.`);
      onAcceptRequest(acceptedRequest);
      setPendingRequests(pending => pending.filter(req => req.id !== id));
    }
  };

  const handleReject = (id) => {
    const rejectedRequest = pendingRequests.find(req => req.id === id);
    if (rejectedRequest) {
      alert(`Rejected request from ${rejectedRequest.name}.`);
      setPendingRequests(pending => pending.filter(req => req.id !== id));
    }
  };

  const handleInviteNewMember = () => {
    navigate('/invite-member'); // Navigate to the invite-member page
  };

  const filteredRequests = pendingRequests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requestedRelation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaUserPlus className="mr-3 text-blue-700" />
                Pending Family Requests
              </h1>
              <p className="text-gray-500 mt-2">
                Review and manage incoming requests to join your family group.
              </p>
            </div>
            {/* Invite New Member Button */}
            <button
              onClick={handleInviteNewMember}
              className="flex items-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FiPlus className="mr-2 text-lg" />
              <span className="font-medium">Invite New Member</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8 border border-gray-100 flex items-center space-x-3">
          <FiSearch className="text-gray-500 text-xl flex-shrink-0" />
          <input
            type="text"
            placeholder="Search pending requests by name, email, or relation..."
            className="flex-grow pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pending Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {filteredRequests.map(request => (
              <PendingRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <FaUserPlus className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No pending family requests</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No results for your search.' : 'All clear! No new requests at the moment.'}
            </p>
            <button
              onClick={handleInviteNewMember}
              className="mx-auto flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors"
            >
              <FiPlus className="mr-2" />
              Invite New Member
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PendingFamilyRequests;