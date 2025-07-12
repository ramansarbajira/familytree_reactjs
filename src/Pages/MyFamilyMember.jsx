import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { useUser } from '../Contexts/UserContext';
import FamilyOverView from '../Components/FamilyOverView';
import ProfileFormModal from '../Components/ProfileFormModal';
import FamilyMemberCard from '../Components/FamilyMemberCard';
import ViewFamilyMemberModal from '../Components/ViewMemberModal';
import { FiPlus } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

const FamilyMemberListing = () => {
  const { userInfo } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMemberData, setEditMemberData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    // Get userId from token
    const token = localStorage.getItem('access_token');
    if (!token) return;
    let userId;
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id || decoded.userId || decoded.sub;
    } catch {
      return;
    }
    fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const user = data.data;
        setCurrentUser({
          ...user,
          userId: user.id // Ensures userId is always present
        });
      });
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
      const user = resJson.data;
      const profile = user.userProfile;

      if (!profile) throw new Error('No user profile returned');

      // Parse children names
      let childrenArray = [];
      if (profile.childrenNames) {
        try {
          childrenArray = JSON.parse(profile.childrenNames);
          if (!Array.isArray(childrenArray)) {
            childrenArray = profile.childrenNames.split(',').map(c => c.trim());
          }
        } catch (err) {
          childrenArray = profile.childrenNames.split(',').map(c => c.trim());
        }
      }

      const childFields = {};
      childrenArray.forEach((name, index) => {
        childFields[`childName${index}`] = name;
      });

      const userInfo = {
        userId: profile.userId || user.id,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dob: profile.dob?.split('T')[0] || '',
        age: calculateAge(profile.dob),
        gender: profile.gender || '',
        email: user.email || '',
        maritalStatus: profile.maritalStatus || '',
        marriageDate: profile.marriageDate?.split('T')[0] || '',
        spouseName: profile.spouseName || '',
        region: profile.region || '',
        childrenCount: childrenArray.length || 0,
        ...childFields,

        fatherName: profile.fatherName || '',
        motherName: profile.motherName || '',
        motherTongue: parseInt(profile.languageId) || 0,
        religionId: parseInt(profile.religionId) || 0,
        caste: profile.caste || '',
        gothram: parseInt(profile.gothramId) || 0,
        kuladevata: profile.kuladevata || '',
        hobbies: profile.hobbies || '',
        likes: profile.likes || '',
        dislikes: profile.dislikes || '',
        favoriteFoods: profile.favoriteFoods || '',
        address: profile.address || '',
        contactNumber: profile.contactNumber || '',
        bio: profile.bio || '',
        profileUrl: profile.profile || '',
        familyCode: profile.familyMember?.familyCode || '',
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),

        // From main user
        countryCode: user.countryCode || '',
        mobile: user.mobile || '',
        status: user.status || 0,
        role: user.role || 0,

        raw: user, // full object including both user + userProfile
      };

      return userInfo;

    } catch (error) {
      console.error('Error fetching member details:', error);
      return null;
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
          currentUser={currentUser}
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
