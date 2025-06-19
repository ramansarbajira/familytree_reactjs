import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import Profile from './Pages/Profile';
import OnBoarding from './Pages/OnBoarding';
import VerifyOtp from './Pages/VerifyOtp';

import Dashboard from './Pages/Dashboard';
import MyProfile from './Pages/MyProfile';
import MyFamilyMember from './Pages/MyFamilyMember';

import { UserProvider } from './Contexts/UserContext';
import PrivateRoute from './Routes/PrivateRoute';
import GuestRoute from './Routes/GuestRoute';

function App() {
  return (
    <Router>
      <Routes>
      
        {/* Guest-only routes */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/" element={ <GuestRoute> <Login /> </GuestRoute> } />
        <Route path="/register" element={ <GuestRoute> <Register /> </GuestRoute> } />
        <Route path="/forgot-password" element={ <GuestRoute> <ForgotPassword /> </GuestRoute> } />
        <Route path="/reset-password" element={ <GuestRoute> <ResetPassword /> </GuestRoute> } />
        <Route path="/verify-otp" element={ <GuestRoute> <VerifyOtp /> </GuestRoute> } />

        {/* Authenticated-only route */}
        <Route path="/on-boarding" element={<PrivateRoute> <OnBoarding /> </PrivateRoute>  } />
        <Route path="/dashboard" element={<PrivateRoute><UserProvider><Dashboard /></UserProvider></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserProvider><Profile /></UserProvider></PrivateRoute>} />
        <Route path="/myprofile" element={<PrivateRoute><UserProvider><MyProfile /></UserProvider></PrivateRoute>} />

        <Route path="/myfamilymember" element={<MyFamilyMember />  } />
        

      </Routes>
    </Router>
  );
}

export default App;
