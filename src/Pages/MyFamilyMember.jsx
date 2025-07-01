import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { useUser } from '../Contexts/UserContext';
import FamilyOverView from '../Components/FamilyOverView';
import ProfileFormModal from '../Components/ProfileFormModal';
import FamilyMemberCard from '../Components/FamilyMemberCard'; // just import & use
import { FiPlus } from 'react-icons/fi';

const FamilyMemberListing = () => {
  const { userInfo } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

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

        <FamilyMemberCard familyCode={userInfo?.familyCode} token={token} />

        <ProfileFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddMember={(newMember) => {
            handleCloseModal();
          }}
          mode="add"
        />
      </div>
    </Layout>
  );
};

export default FamilyMemberListing;
