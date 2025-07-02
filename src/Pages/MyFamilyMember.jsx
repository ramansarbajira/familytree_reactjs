import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { useUser } from '../Contexts/UserContext';
import FamilyOverView from '../Components/FamilyOverView';
import ProfileFormModal from '../Components/ProfileFormModal';
import FamilyMemberCard from '../Components/FamilyMemberCard';
import ViewFamilyMemberModal from '../Components/ViewMemberModal';
import { FiPlus } from 'react-icons/fi';

const FamilyMemberListing = () => {
  const { userInfo } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMemberData, setEditMemberData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleEditMember = async (memberUserId) => {
    if (!memberUserId) return;

    const fullDetails = await fetchMemberDetails(memberUserId);
    if (fullDetails) {
      setEditMemberData(fullDetails);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setEditMemberData(null);
    setIsEditModalOpen(false);
  };

   const handleViewMember = async (memberId) => {
    if (!memberId) return;
    const fullDetails = await fetchMemberDetails(memberId);
    if (fullDetails) {
      console.log(fullDetails);
      
      setViewMember(fullDetails);
    }
  };

  const fetchMemberDetails = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch member details');
       const resJson = await response.json();
       //console.log(resJson.data);
       
      return resJson.data; 
    } catch (error) {
      console.error('Error fetching member details:', error);
      return null;
    }
  };


  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold mb-4">My Family Tree</h1>

        <FamilyOverView familyCode={userInfo?.familyCode} token={token} />

        <div className="flex justify-end mb-4">
          <button
            onClick={handleOpenModal}
            className="flex items-center bg-primary-DEFAULT text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            <FiPlus className="mr-2" /> Add New Member
          </button>
        </div>

        <FamilyMemberCard 
          familyCode={userInfo?.familyCode} 
          token={token} 
          onEditMember={handleEditMember}
          onViewMember={handleViewMember}
        />

        <ProfileFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddMember={(newMember) => {
            handleCloseModal();
          }}
          mode="add"
        />
         {/* Edit Member Modal */}
          <ProfileFormModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            mode="edit-member"
            memberData={editMemberData}
          />

          {viewMember && (
          <ViewFamilyMemberModal
            isOpen={!!viewMember}
            onClose={() => setViewMember(null)}
            member={viewMember}
          />
        )}
      </div>
    </Layout>
  );
};

export default FamilyMemberListing;
