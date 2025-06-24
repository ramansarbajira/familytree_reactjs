import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create the context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null); // Added state for error

  // Function to fetch user details, memoized with useCallback
  const fetchUserDetails = useCallback(async () => {
    setUserLoading(true);
    setUserError(null); // Clear any previous errors

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('Authentication token not found. User is likely not logged in.');
      setUserInfo(null); // Ensure userInfo is null if no token
      setUserLoading(false);
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error('Invalid JWT token:', err);
      setUserInfo(null);
      setUserError(new Error('Invalid authentication session. Please log in again.'));
      setUserLoading(false);
      return;
    }

    const userId = decoded?.id;
    if (!userId) {
      console.error('User ID not found in token.');
      setUserInfo(null);
      setUserError(new Error('User information incomplete.'));
      setUserLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user details.');
      }

      const jsonData = await response.json();
      const { userProfile } = jsonData.data || {};

      if (!userProfile) {
        throw new Error('No user profile data returned from API.');
      }

      // Parse childrenNames if it's a JSON string
      const childrenArray = userProfile.childrenNames
        ? JSON.parse(userProfile.childrenNames)
        : [];

      // Create childFields for dynamic child names
      const childFields = {};
      childrenArray.forEach((name, index) => {
        childFields[`childName${index}`] = name;
      });

      // Populate userInfo with data from API and sensible defaults/derivations
      setUserInfo({
        // Basic Info
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        name: userProfile.userName || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(), // Use userName if available, otherwise derive
        fullName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(), // Full name for display
        profileImage: userProfile.profile || 'https://placehold.co/400x400/CCCCCC/FFFFFF?text=User', // User's profile image or a placeholder
        // Note: 'basicInfo' is not a standard backend field; using a default or combine other fields if available in userProfile.
        basicInfo: userProfile.basicInfo || (userProfile.designation ? `${userProfile.designation} at ${userProfile.company || 'Unknown'}` : 'Family Member'),
        bio: userProfile.bio || 'Sharing moments and connecting with family!',

        // Profile Stats (placeholders if not from API - adjust if your API provides these)
        postsCount: userProfile.postsCount || 0,
        galleryCount: userProfile.galleryCount || 0,
        followers: userProfile.followers || 0,
        following: userProfile.following || 0,

        // Personal Details
        dob: userProfile.dob?.split('T')[0] || '',
        age: calculateAge(userProfile.dob),
        gender: userProfile.gender || '',
        maritalStatus: userProfile.maritalStatus || '',
        marriageDate: userProfile.marriageDate?.split('T')[0] || '',
        spouseName: userProfile.spouseName || '',
        childrenCount: childrenArray.length || 0,
        ...childFields, // Dynamic child name fields

        // Family & Ancestry
        fatherName: userProfile.fatherName || '',
        motherName: userProfile.motherName || '',
        motherTongue: parseInt(userProfile.languageId) || 0,
        religionId: parseInt(userProfile.religionId) || 0,
        caste: userProfile.caste || '',
        gothram: parseInt(userProfile.gothramId) || 0,
        kuladevata: userProfile.kuladevata || '',
        familyCode: userProfile.familyMember?.familyCode || '',

        // Interests & Lifestyle
        hobbies: userProfile.hobbies || '',
        likes: userProfile.likes || '',
        dislikes: userProfile.dislikes || '',
        favoriteFoods: userProfile.favoriteFoods || '',

        // Contact & Address
        address: userProfile.address || '',
        contactNumber: userProfile.contactNumber || '',
        
        raw: userProfile, // Keep the raw profile data for debugging or specific needs
      });
      setUserError(null); // Clear error on successful fetch
    } catch (err) {
      console.error('Error fetching user:', err);
      setUserInfo(null); // Clear user info on error
      setUserError(err); // Set the error
    } finally {
      setUserLoading(false);
    }
  }, []);

  // Effect to fetch user details on component mount
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]); // Dependency array ensures it runs when fetchUserDetails changes (which is rare due to useCallback)

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    user: userInfo, // Renamed to 'user' for clearer consumption
    isLoading: userLoading,
    error: userError,
    refetchUser: fetchUserDetails, // Allows components to manually re-fetch user data
  }), [userInfo, userLoading, userError, fetchUserDetails]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to consume the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

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
