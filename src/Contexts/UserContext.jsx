import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { 
  getToken, 
  getUserInfo, 
  setAuthData, 
  clearAuthData, 
  isAuthenticated, 
  initializeAuth,
  authenticatedFetch,
  isValidTokenFormat
} from '../utils/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    // Initialize with user info from localStorage if available
    return getUserInfo();
  });
  
  const [userLoading, setUserLoading] = useState(() => {
    // Initialize as true if there's a token (indicating we need to fetch user data)
    return isAuthenticated();
  });

  // Initialize auth state when context mounts
  useEffect(() => {
    initializeAuth();
  }, []);

  const clearUserData = useCallback(() => {
    setUserInfo(null);
    setUserLoading(false);
    clearAuthData();
  }, []);

  const fetchUserDetails = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.warn('Authentication token not found or expired.');
      clearUserData();
      return;
    }

    // Validate token format before making API call
    if (!isValidTokenFormat(token)) {
      console.warn('Invalid token format detected, clearing auth data');
      clearUserData();
      window.location.replace('/login');
      return;
    }

    try {
      setUserLoading(true);

      const response = await authenticatedFetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/myProfile`,
        { method: 'GET' },
        2 // Retry up to 2 times for network errors
      );

      const jsonData = await response.json();
      const { userProfile, email, countryCode, mobile, status, role } = jsonData.data || {};
      
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
      
      // Handle specific error types
      if (err.message.includes('Authentication')) {
        // Authentication errors - redirect to login
        console.warn('Authentication error, redirecting to login');
        clearUserData();
        window.location.replace('/login');
      } else if (err.message.includes('Server Error') || err.message.includes('Bad Request')) {
        // Server errors - show user-friendly message but don't redirect
        console.error('Server error occurred:', err.message);
        // You could show a toast notification here
        // For now, we'll just log it and continue
      } else if (err.message.includes('fetch')) {
        // Network errors - could retry or show network error message
        console.warn('Network error occurred:', err.message);
      }
    } finally {
      setUserLoading(false);
    }
  }, [clearUserData]);

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
      const currentToken = getToken();
      if (currentToken && !userInfo && !userLoading) {
        // Token exists but no user info, fetch it
        fetchUserDetails();
      }
    }, 30000); // Check every 30 seconds (reduced from 1 second to prevent aggressive checking)

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkTokenInterval);
    };
  }, [fetchUserDetails, clearUserData, userInfo, userLoading]);

  // FIXED: Simplified session management - only handle actual browser close
  useEffect(() => {
    // Set up session management on page load
    const handlePageLoad = () => {
      const stayLoggedIn = localStorage.getItem('stayLoggedIn');
      
      // Only check if this is actually a fresh browser session
      // Use sessionStorage to detect if this is a new browser session vs page refresh
      if (!sessionStorage.getItem('browserSessionActive')) {
        // This is a new browser session
        sessionStorage.setItem('browserSessionActive', 'true');
        
        // If user previously chose not to stay logged in, clear the session
        if (stayLoggedIn === 'false') {
          clearAuthData();
          clearUserData();
          
          // Redirect to login if on a protected page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
      }
    };

    // Run page load check immediately
    handlePageLoad();

    // REMOVED: beforeunload and visibility change handlers as they were causing issues
    // The session will only be cleared when a new browser session starts (not during page refreshes or form submissions)

  }, [clearUserData]);

  const contextValue = useMemo(() => ({
    userInfo,
    userLoading,
    refetchUser: fetchUserDetails,
    logout: clearUserData,
    isPersistentLogin: localStorage.getItem('stayLoggedIn') === 'true',
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