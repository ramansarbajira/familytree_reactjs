import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../Contexts/UserContext';
import LoadingSpinner from '../Components/LoadingSpinner';

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const { userLoading } = useUser();

  // If no token, allow access to guest routes
  if (!token) {
    return children;
  }

  // If user context is still loading, show loading spinner
  if (userLoading) {
    return <LoadingSpinner fullScreen={true} text="Loading..." />;
  }

  // If user is authenticated and context is loaded, redirect to profile
  return <Navigate to="/myprofile" replace />;
};

export default GuestRoute;