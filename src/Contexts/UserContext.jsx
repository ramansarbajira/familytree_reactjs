import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('Authentication token not found.');
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
      // if (response.status >= 400) {
      //   localStorage.removeItem('access_token'); // Clear token
      //   window.location.href = '/login'; // Redirect to login page
      //   return;
      // }

      if (!response.ok) throw new Error('Failed to fetch user details');

      const jsonData = await response.json();
      const { userProfile, email, countryCode, mobile, status, role } = jsonData.data || {}; // Destructure additional fields here
      //console.log(userProfile);
      
      if (!userProfile) throw new Error('No user profile returned');

      let childrenArray = [];

      if (userProfile.childrenNames) {
        try {
          // If it's valid JSON (e.g. '["Son", "Daugther"]')
          childrenArray = JSON.parse(userProfile.childrenNames);
          if (!Array.isArray(childrenArray)) {
            childrenArray = userProfile.childrenNames.split(',').map(c => c.trim());
          }
        } catch (err) {
          // Fallback: treat as comma-separated string
          childrenArray = userProfile.childrenNames.split(',').map(c => c.trim());
        }
}

      const childFields = {};
      childrenArray.forEach((name, index) => {
        childFields[`childName${index}`] = name;
      });
      

      setUserInfo({
        userId: userProfile.userId,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        dob: userProfile.dob?.split('T')[0] || '',
        age: calculateAge(userProfile.dob),
        gender: userProfile.gender || '',
        email: email || userProfile.email || '',
        maritalStatus: userProfile.maritalStatus || '',
        marriageDate: userProfile.marriageDate?.split('T')[0] || '',
        spouseName: userProfile.spouseName || '',
        region: userProfile.region || '',
        childrenCount: childrenArray.length || 0,
        ...childFields, // Safe generated fields like childName0, childName1, etc.

        fatherName: userProfile.fatherName || '',
        motherName: userProfile.motherName || '',
        motherTongue: parseInt(userProfile.languageId) || 0,
        religionId: parseInt(userProfile.religionId) || 0,
        caste: userProfile.caste || '',
        gothram: parseInt(userProfile.gothramId) || 0,
        kuladevata: userProfile.kuladevata || '',
        hobbies: userProfile.hobbies || '',
        likes: userProfile.likes || '',
        dislikes: userProfile.dislikes || '',
        favoriteFoods: userProfile.favoriteFoods || '',
        address: userProfile.address || '',
        contactNumber: userProfile.contactNumber || '',
        bio: userProfile.bio || '',
        profileUrl: userProfile.profile || '',
        familyCode: userProfile.familyMember?.familyCode || '',
        approveStatus: userProfile.familyMember?.approveStatus || 'pending',
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        
        countryCode: countryCode || '',
        mobile: mobile || '',
        status: status || 0,
        role: role || 0,

        raw: userProfile,
      });
      
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const contextValue = useMemo(() => ({
    userInfo,
    userLoading,
    refetchUser: fetchUserDetails,
  }), [userInfo, userLoading, fetchUserDetails]);

  return (
    <UserContext.Provider value={contextValue}>
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