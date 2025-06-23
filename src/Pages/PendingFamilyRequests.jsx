import React, { useState } from 'react';
import Layout from '../Components/Layout';
import { FaUserPlus, FaCheckCircle, FaTimesCircle, FaSearch } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
// Import the new InviteFamilyMemberModal component
import InviteFamilyMemberModal from '../Components/InviteFamilyMemberModal';

// Component for a single pending request card
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

            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium self-start md:self-center">
              {request.requestedRelation}
            </div>
          </div>

          <div className="text-gray-500 text-xs">
            <span>Requested on: {request.requestedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 md:ml-auto">
          <button
            onClick={() => onAccept(request.id)}
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
          >
            <FaCheckCircle className="mr-2 text-lg" /> Accept
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
          >
            <FaTimesCircle className="mr-2 text-lg" /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component for managing pending family requests
const PendingFamilyRequests = ({ onAcceptRequest, onRejectRequest }) => {
  // State for search term in the request list
  const [searchTerm, setSearchTerm] = useState('');
  // State for active filter (e.g., 'all', 'pending')
  const [activeFilter, setActiveFilter] = useState('all');
  // New state to control the visibility of the "Invite New Member" modal
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Sample pending requests data
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'req1',
      name: 'Michael Jordan',
      email: 'michael.j@example.com',
      contact: '1122334455',
      requestedRelation: 'Uncle',
      requestedDate: 'June 18, 2025',
      profilePic: 'https://placehold.co/80x80/EDE7F6/5E35B1?text=MJ',
      status: 'pending'
    },
    {
      id: 'req2',
      name: 'LeBron James',
      email: 'lebron.j@example.com',
      contact: '',
      requestedRelation: 'Brother-in-law',
      requestedDate: 'June 17, 2025',
      profilePic: 'https://placehold.co/80x80/E8F5E9/43A047?text=LJ',
      status: 'pending'
    },
    {
      id: 'req3',
      name: 'Serena Williams',
      email: 'serena.w@example.com',
      contact: '5566778899',
      requestedRelation: 'Cousin',
      requestedDate: 'June 15, 2025',
      profilePic: 'https://placehold.co/80x80/E0F7FA/00ACC1?text=SW',
      status: 'pending'
    },
  ]);

  /**
   * Handles accepting a pending family request.
   * @param {string} id - The ID of the request to accept.
   */
  const handleAccept = (id) => {
    const acceptedRequest = pendingRequests.find(req => req.id === id);
    if (acceptedRequest) {
      console.log(`Accepted request from ${acceptedRequest.name}.`);
      onAcceptRequest && onAcceptRequest(acceptedRequest); // Call external handler if provided
      setPendingRequests(pending => pending.filter(req => req.id !== id)); // Remove from pending list
    }
  };

  /**
   * Handles rejecting a pending family request.
   * @param {string} id - The ID of the request to reject.
   */
  const handleReject = (id) => {
    const rejectedRequest = pendingRequests.find(req => req.id === id);
    if (rejectedRequest) {
      console.log(`Rejected request from ${rejectedRequest.name}.`);
      onRejectRequest && onRejectRequest(rejectedRequest); // Call external handler if provided
      setPendingRequests(pending => pending.filter(req => req.id !== id)); // Remove from pending list
    }
  };

  /**
   * Opens the "Invite New Member" modal.
   */
  const handleOpenInviteModal = () => {
    setShowInviteModal(true);
  };

  /**
   * Closes the "Invite New Member" modal.
   */
  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
  };

  /**
   * Filters the pending requests based on search term and active filter.
   * @returns {Array} The filtered list of requests.
   */
  const filteredRequests = pendingRequests.filter(request => {
    // Check if request matches the search term in name, email, or relation
    const matchesSearch =
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedRelation.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if request matches the active filter (e.g., 'all' or 'pending')
    const matchesFilter = activeFilter === 'all' || request.status === activeFilter;

    return matchesSearch && matchesFilter; // Return true if both search and filter criteria are met
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <FaUserPlus className="mr-3 text-blue-600" />
                Pending Family Requests
              </h1>
              <p className="text-gray-600 mt-2 text-base">
                Review and manage incoming requests to join your family group.
              </p>
            </div>

            {/* Invite New Member Button - opens the modal */}
            <button
              onClick={handleOpenInviteModal}
              className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              <FiPlus className="mr-2 text-lg" />
              <span className="font-medium">Invite New Member</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or relation..."
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-200 ${activeFilter === 'all' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-200 ${activeFilter === 'pending' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Pending Requests List */}
        <div className="rounded-lg overflow-hidden">
          {filteredRequests.length > 0 ? (
            <div className="divide-y divide-gray-200">
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
            <div className="p-10 text-center bg-gray-50">
              <div className="mx-auto w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <FaUserPlus className="text-gray-500 text-5xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {searchTerm ? 'No matching requests found' : 'No pending requests'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm
                  ? 'Try adjusting your search terms or filter settings to find what you\'re looking for.'
                  : 'All caught up! You currently have no pending family requests awaiting your review.'}
              </p>
              <button
                onClick={handleOpenInviteModal} // Opens modal from here as well
                className="mx-auto flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
              >
                <FiPlus className="mr-2 text-lg" />
                Invite New Member
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render the InviteFamilyMemberModal only when showInviteModal is true */}
      {showInviteModal && <InviteFamilyMemberModal onClose={handleCloseInviteModal} />}
    </Layout>
  );
};

export default PendingFamilyRequests;