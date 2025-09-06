import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import jwtDecode  from 'jwt-decode';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userLoading, setUserLoading] = useState(() => {
    // Initialize as true if there's a token (indicating we need to fetch user data)
    return !!localStorage.getItem('access_token');
  });

  const clearUserData = useCallback(() => {
    setUserInfo(null);
    setUserLoading(false);
    localStorage.removeItem('access_token');
  }, []);

  const fetchUserDetails = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('Authentication token not found.');
      clearUserData();
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

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/myProfile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401) {
        // Treat 400 from myProfile as invalid session as well to avoid loops
        try {
          const errJson = await response.json();
          console.error('User session error:', errJson?.message || errJson);
        } catch (_) {
          // ignore json parse errors
        }
        localStorage.removeItem('access_token');
        setUserInfo(null);
        setUserLoading(false);
        window.location.href = '/login';
        return;
      }
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

  // Listen for localStorage changes (when user logs in)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' && e.newValue) {
        // New token added, fetch user details
        fetchUserDetails();
      } else if (e.key === 'access_token' && !e.newValue) {
        // Token removed, clear user data
        clearUserData();
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also check for token changes in the same tab
    const checkTokenInterval = setInterval(() => {
      const currentToken = localStorage.getItem('access_token');
      if (currentToken && !userInfo && !userLoading) {
        // Token exists but no user info, fetch it
        fetchUserDetails();
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkTokenInterval);
    };
  }, [fetchUserDetails, clearUserData, userInfo, userLoading]);

  const contextValue = useMemo(() => ({
    userInfo,
    userLoading,
    refetchUser: fetchUserDetails,
    logout: clearUserData,
  }), [userInfo, userLoading, fetchUserDetails, clearUserData]);

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