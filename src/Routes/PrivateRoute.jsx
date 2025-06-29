import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const decoded = jwtDecode(token);
  console.log('Decoded token:', decoded);
  console.log(token);
  
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
