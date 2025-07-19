import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../Contexts/UserContext';
import LoadingSpinner from '../Components/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const { userLoading } = useUser();

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If user context is still loading, show loading spinner
  if (userLoading) {
    return <LoadingSpinner fullScreen={true} text="Loading..." />;
  }

  // If user is authenticated and context is loaded, allow access
  return children;
};

// New component for role-based access control
const RoleBasedRoute = ({ children, allowedRoles = [], requireFamilyCode = false, requireApprovedStatus = false }) => {
  const token = localStorage.getItem('access_token');
  const { userInfo, userLoading } = useUser();

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If still loading user info, show loading spinner
  if (userLoading) {
    return <LoadingSpinner fullScreen={true} text="Loading user information..." />;
  }

  // If no user info, redirect to login
  if (!userInfo) {
    return <Navigate to="/" replace />;
  }

  // Check role requirements
  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/myprofile" replace />;
  }

  // Check familyCode requirement
  if (requireFamilyCode && (!userInfo.familyCode || userInfo.familyCode === '')) {
    return <Navigate to="/myprofile" replace />;
  }

  // Check approvedStatus requirement
  if (requireApprovedStatus && userInfo.approveStatus !== 'approved') {
    return <Navigate to="/myprofile" replace />;
  }

  return children;
};

export default PrivateRoute;
export { RoleBasedRoute };
