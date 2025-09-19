import React, { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import Layout from '../Components/Layout';

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
      <button className="absolute top-2 right-2 text-gray-400 text-2xl z-10" onClick={onClose}>&times;</button>
      {children}
    </div>
  </div>
);

const SuggestionApproving = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [familyCode, setFamilyCode] = useState(null);
  const [userInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo')));
  const accessToken = localStorage.getItem('access_token');
  const [viewProfile, setViewProfile] = useState(null); // user profile object
  const [replaceModal, setReplaceModal] = useState({ open: false, request: null });
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMember, setViewMember] = useState(null); // for member details in replace modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [addNewMemberLoading, setAddNewMemberLoading] = useState(false);

  const markNotificationAsRead = async (notificationId, status = null) => {
    try {
      const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/notifications/${notificationId}/read`);
      if (status) {
        url.searchParams.append('status', status);
      }
      
      await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    if (!userInfo?.id) return;
    const fetchFamilyCodeAndRequests = async () => {
      setLoading(true);
      // 1. Fetch user profile to get familyCode
      const userRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/profile/${userInfo.id}`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const userData = await userRes.json();
      const code = userData.data?.userProfile?.familyCode;
      setFamilyCode(code);

      if (!code) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // 2. Fetch join requests for this familyCode
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/${code}/join-requests`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await res.json();
      // Filter to only show pending requests
      const pendingRequests = (data.data || []).filter(req => req.status === 'pending');
      // 3. For each pending request, fetch the user profile
      const requestsWithUser = await Promise.all(
        pendingRequests.map(async (req) => {
          let user = null;
          if (req.triggeredBy) {
            const userRes = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/user/profile/${req.triggeredBy}`,
              {
                headers: {
                  accept: 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            const userData = await userRes.json();
            user = userData.data?.userProfile || null;
          }
          return { ...req, user };
        })
      );
      setRequests(requestsWithUser);
      setLoading(false);
    };

    fetchFamilyCodeAndRequests();
  }, [userInfo?.id]);

  const handleApproveReplace = async () => {
    if (!familyCode || !replaceModal.request || !selectedMemberId) return;
    setReplaceLoading(true);
    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/family/${familyCode}/approve-replace`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          joinUserId: replaceModal.request.triggeredBy,
          replaceMemberId: selectedMemberId,
        }),
      }
    );
    setReplaceLoading(false);
    setReplaceModal({ open: false, request: null });
    setSelectedMemberId(null);
    // Refresh requests
    window.location.reload();
  };

  const handleAddAsNewMember = async () => {
    if (!familyCode || !replaceModal.request) return;
    setAddNewMemberLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/family/member/add-user-to-family`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            userId: replaceModal.request.triggeredBy,
            familyCode: familyCode,
          }),
        }
      );
      
      if (response.ok) {
        // Mark the notification as read with accepted status
        await markNotificationAsRead(replaceModal.request.id, 'accepted');
        setAddNewMemberLoading(false);
        setReplaceModal({ open: false, request: null });
        setSelectedMemberId(null);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          window.location.reload();
        }, 2000);
      } else {
        console.error('Failed to add user to family');
        setAddNewMemberLoading(false);
      }
    } catch (error) {
      console.error('Error adding user to family:', error);
      setAddNewMemberLoading(false);
    }
  };

  const openReplaceModal = async (request) => {
    if (!familyCode) return;
    setReplaceModal({ open: true, request });
    setSelectedMemberId(null);
    // Fetch family members (approved only)
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/family/member/${familyCode}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await res.json();
    setFamilyMembers(data.data || []);
  };

  const filteredMembers = familyMembers.filter(member => {
    const user = member.user || {};
    const profile = user.userProfile || {};
    return (
      (profile.firstName + ' ' + (profile.lastName || '')).toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Layout activeTab="suggestionApproving">
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <FiClock className="text-primary-600 text-3xl mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Pending Join Requests</h1>
        </div>
        <p className="text-gray-500 mb-6">Review and manage pending join requests for your family.</p>
        {loading ? (
          <div>Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-gray-400 text-lg mt-12 text-center">No pending join requests found.</div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center bg-white rounded-lg shadow p-4">
                <img
                  src={req.user?.profile || '/public/assets/user.png'}
                  alt={req.user?.firstName || 'User'}
                  className="w-12 h-12 rounded-full object-cover border mr-4"
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {req.user?.firstName} {req.user?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{req.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  className="ml-auto bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  onClick={async () => {
                    // Fetch full profile and show modal
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile/${req.triggeredBy}`,
                      { headers: { Authorization: `Bearer ${accessToken}` } });
                    const data = await res.json();
                    setViewProfile(data.data.userProfile);
                  }}
                >
                  View Profile
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => {
                    setRequestToReject(req);
                    setShowRejectConfirm(true);
                  }}
                >
                  Reject
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => openReplaceModal(req)}
                >
                  Accept & Replace
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* View Profile Modal */}
      {viewProfile && (
        <Modal onClose={() => setViewProfile(null)}>
          <div className="overflow-y-auto max-h-full">
            <h2 className="text-xl font-bold mb-2">{viewProfile.firstName} {viewProfile.lastName}</h2>
            <img
              src={viewProfile.profile || '/public/assets/user.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border mx-auto mb-4"
            />
            <div className="text-sm text-gray-700 mb-1"><b>DOB:</b> {viewProfile.dob}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Gender:</b> {viewProfile.gender}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Address:</b> {viewProfile.address}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Bio:</b> {viewProfile.bio}</div>
            <div className="text-sm text-gray-700 mb-1"><b>FatherName:</b> {viewProfile.fatherName}</div>
            <div className="text-sm text-gray-700 mb-1"><b>MotherName:</b> {viewProfile.motherName}</div>
            <div className="text-sm text-gray-700 mb-1"><b>SpouseName:</b> {viewProfile.spouseName}</div>
            <button className="mt-4 bg-primary-500 text-white px-6 py-2 rounded" onClick={() => setViewProfile(null)}>Close</button>
          </div>
        </Modal>
      )}
      {/* Approve & Replace Modal */}
      {replaceModal.open && (
        <Modal onClose={() => { setReplaceModal({ open: false, request: null }); setViewMember(null); }}>
          <div className="flex flex-col h-full">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 mb-4">
              <h2 className="text-xl font-bold mb-4">Select a member to replace</h2>
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full px-3 py-2 border rounded"
                value={search}
                onChange={e => { setSearch(e.target.value); setViewMember(null); }}
              />
              <p className="text-sm text-gray-500 mt-2">
                Click on a member to select for replacement, or click "Add as New Member" to add without replacing anyone.
                {selectedMemberId && " Click on the selected member again to deselect."}
              </p>
            </div>

            {/* Scrollable Members Grid */}
            <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: '300px' }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
                {filteredMembers.map(member => {
                  const user = member.user || {};
                  const profile = user.userProfile || {};
                  return (
                    <div
                      key={member.id}
                      className={`p-2 border rounded flex flex-col items-center cursor-pointer ${selectedMemberId === user.id ? 'border-primary-500 bg-primary-50' : ''}`}
                      onClick={() => {
                        // Toggle selection - if already selected, deselect it
                        if (selectedMemberId === user.id) {
                          setSelectedMemberId(null);
                          setViewMember(null);
                        } else {
                          setSelectedMemberId(user.id);
                          setViewMember({ user, profile });
                        }
                      }}
                    >
                      <img
                        src={user.profileImage || '/public/assets/user.png'}
                        alt={profile.firstName}
                        className="w-20 h-20 rounded-full object-cover border mb-2"
                      />
                      <div className="font-semibold text-center text-sm">{profile.firstName} {profile.lastName}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Member Details - Fixed */}
            {viewMember && selectedMemberId === viewMember.user.id && (
              <div className="flex-shrink-0 p-4 border rounded bg-gray-50 mb-4">
                <div className="font-bold mb-1">Selected Member Details</div>
                <div><b>Name:</b> {viewMember.profile.firstName} {viewMember.profile.lastName}</div>
                <div><b>Email:</b> {viewMember.user.email}</div>
                <div><b>DOB:</b> {viewMember.profile.dob}</div>
                <div><b>Gender:</b> {viewMember.profile.gender}</div>
                <div><b>Address:</b> {viewMember.profile.address}</div>
                <button className="mt-2 text-primary-600 underline" onClick={() => setViewMember(null)}>Close</button>
              </div>
            )}

            {/* Footer Buttons - Fixed */}
            <div className="flex-shrink-0 flex gap-3">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
                disabled={selectedMemberId || addNewMemberLoading}
                onClick={handleAddAsNewMember}
              >
                {addNewMemberLoading ? 'Adding...' : 'Add as New Member'}
              </button>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
                disabled={!selectedMemberId || replaceLoading}
                onClick={() => setShowConfirm(true)}
              >
                {replaceLoading ? 'Approving...' : 'Approve & Replace'}
              </button>
            </div>
          </div>

          {showConfirm && (
            <Modal onClose={() => setShowConfirm(false)}>
              <div className="overflow-y-auto max-h-full">
                <div className="text-lg font-semibold mb-4">
                  Are you sure you want to <span className="text-primary-600">approve</span> this request and replace <span className="text-primary-600">{viewMember?.profile.firstName} {viewMember?.profile.lastName}</span> with <span className="text-primary-600">{replaceModal.request?.user?.firstName} {replaceModal.request?.user?.lastName}</span>?<br/>
                  <span className="text-sm text-gray-500">This action cannot be undone.</span>
                </div>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded mr-2"
                  onClick={async () => {
                    setReplaceLoading(true);
                    await fetch(
                      `${import.meta.env.VITE_API_BASE_URL}/user/merge`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                          existingId: selectedMemberId,
                          currentId: replaceModal.request.triggeredBy,
                          notificationId: replaceModal.request.id,
                        }),
                      }
                    );
                    // Mark the notification as read with accepted status after successful merge
                    await markNotificationAsRead(replaceModal.request.id, 'accepted');
                    setReplaceLoading(false);
                    setShowConfirm(false);
                    setReplaceModal({ open: false, request: null });
                    setSelectedMemberId(null);
                    setShowSuccess(true);
                    setTimeout(() => {
                      setShowSuccess(false);
                      window.location.reload();
                    }, 2000);
                  }}
                >
                  Yes, Replace
                </button>
                <button className="bg-gray-300 px-6 py-2 rounded" onClick={() => setShowConfirm(false)}>Cancel</button>
              </div>
            </Modal>
          )}
        </Modal>
      )}
      {showSuccess && (
        <Modal onClose={() => setShowSuccess(false)}>
          <div className="text-center py-8">
            <div className="text-3xl mb-4 text-green-600">✔️</div>
            <div className="text-xl font-bold mb-2">Member replaced successfully!</div>
            <div className="text-gray-500">The selected member has been replaced with the new joiner.</div>
          </div>
        </Modal>
      )}
      {/* Reject Confirmation Modal */}
      {showRejectConfirm && requestToReject && (
        <Modal onClose={() => setShowRejectConfirm(false)}>
          <div className="text-center py-6">
            <div className="text-2xl mb-4 text-red-600">⚠️</div>
            <div className="text-xl font-bold mb-4">Confirm Rejection</div>
            <div className="text-gray-600 mb-6">
              Are you sure you want to reject the join request from <span className="font-semibold">{requestToReject.user?.firstName} {requestToReject.user?.lastName}</span>?
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded"
                onClick={() => {
                  setShowRejectConfirm(false);
                  setRequestToReject(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-6 py-2 rounded"
                onClick={async () => {
                  // Mark notification as rejected
                  await markNotificationAsRead(requestToReject.id, 'rejected');
                  // Remove the request from the list
                  setRequests(prev => prev.filter(r => r.id !== requestToReject.id));
                  setShowRejectConfirm(false);
                  setRequestToReject(null);
                }}
              >
                Yes, Reject
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default SuggestionApproving;