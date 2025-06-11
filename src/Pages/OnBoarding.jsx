import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OnBoarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Not logged in, redirect to login page
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div style={{ color: 'black', fontSize: '24px' }}>
      <h1>On Boarding Page</h1>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#ef4444', // red-500
          color: 'white',
          border: 'none',
          borderRadius: '6px',
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default OnBoarding;
