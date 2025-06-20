import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({});
  const [userLoading, setUserLoading] = useState(false);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('Authentication token not found. Please login again.');
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error('Invalid JWT token');
      return;
    }
    
    const userId = decoded?.id;
    if (!userId) {
      console.error('User ID not found in token');
      return;
    }

    try {
      setUserLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user details');

      const jsonData = await response.json();
      const { userProfile } = jsonData.data;

      console.log(userProfile);
      

      const childrenArray = userProfile.childrenNames
        ? JSON.parse(userProfile.childrenNames)
        : [];

      const childFields = {};
      childrenArray.forEach((name, index) => {
        childFields[`childName${index}`] = name;
      });

      setUserInfo({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        dob: userProfile.dob ? userProfile.dob.split('T')[0] : '',
        age: calculateAge(userProfile.dob) || 0,
        gender: userProfile.gender || '',
        maritalStatus: userProfile.maritalStatus || '',
        marriageDate: userProfile.marriageDate ? userProfile.marriageDate.split('T')[0] : '',
        spouseName: userProfile.spouseName || '',
        childrenCount: childrenArray.length || 0,
        ...childFields,
        fatherName: userProfile.fatherName || '',
        motherName: userProfile.motherName || '',
        motherTongue: userProfile.languageId ? parseInt(userProfile.languageId) : 0,
        religionId: userProfile.religionId ? parseInt(userProfile.religionId) : 0,
        caste: userProfile.caste || '',
        gothram: userProfile.gothramId ? parseInt(userProfile.gothramId) : 0,
        kuladevata: userProfile.kuladevata || '',
        hobbies: userProfile.hobbies || '',
        likes: userProfile.likes || '',
        dislikes: userProfile.dislikes || '',
        favoriteFoods: userProfile.favoriteFoods || '',
        address: userProfile.address || '',
        contactNumber: userProfile.contactNumber || '',
        bio: userProfile.bio || '',
        profileUrl: userProfile.profile || '',
        familyCode: userProfile.familyMember && userProfile.familyMember.familyCode || '',
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        raw: userProfile,
      });
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, userLoading, refetchUser: fetchUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

// Utility to calculate age from DOB
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
