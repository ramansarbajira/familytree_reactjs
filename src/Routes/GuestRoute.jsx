import React from 'react';
import { Navigate } from 'react-router-dom';

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return !token ? children : <Navigate to="/myprofile" replace />;
};

export default GuestRoute;