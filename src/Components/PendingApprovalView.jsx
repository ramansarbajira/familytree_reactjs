import React from 'react';
import { FiClock, FiUsers, FiAlertCircle } from 'react-icons/fi';

const PendingApprovalView = ({ familyCode, onJoinFamily }) => {
  const handleJoinWithNewCode = () => {
    onJoinFamily();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiClock className="text-3xl text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Family Request Pending
          </h2>
          <p className="text-gray-600 mb-4">
            Your request to join the family is currently under review by the family administrator.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <FiAlertCircle className="text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              Current Family Code: {familyCode}
            </span>
          </div>
          <p className="text-sm text-yellow-700">
            Please wait for the family administrator to approve your request.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleJoinWithNewCode}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <FiUsers className="mr-2" />
            Join with Different Family Code
          </button>


        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>You can join a different family while waiting for approval.</p>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalView; 