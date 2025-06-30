import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import OnBoarding from './Pages/OnBoarding';
import VerifyOtp from './Pages/VerifyOtp';

import Dashboard from './Pages/Dashboard';
import MyProfile from './Pages/MyProfile';
import MyFamilyMember from './Pages/MyFamilyMember';
import MyFamily from './Pages/MyFamily';
import PendingFamilyRequests from './Pages/PendingFamilyRequests';
import PostsAndFeedsPage from './Pages/PostsAndFeedsPage'; 
import FamilyGalleryPage from './Pages/FamilyGalleryPage'; 
import GiftListingPage from './Pages/GiftListingPage'; 
import EventsPage from './Pages/EventsPage'; 

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
        <Route path="/on-boarding" element={ <OnBoarding />  } />
        <Route path="/on-boarding" element={<PrivateRoute> <OnBoarding /> </PrivateRoute>  } />
        <Route path="/dashboard" element={<PrivateRoute><UserProvider><Dashboard /></UserProvider></PrivateRoute>} />
        <Route path="/myprofile" element={<PrivateRoute><UserProvider><MyProfile /></UserProvider></PrivateRoute>} />
        <Route path="/my-family-member" element={<PrivateRoute><UserProvider><MyFamilyMember /></UserProvider></PrivateRoute>  } />
        <Route path="/my-family" element={<PrivateRoute><UserProvider><MyFamily /></UserProvider></PrivateRoute>  } />

        <Route path ="/pending-request" element={<PrivateRoute><UserProvider><PendingFamilyRequests /> </UserProvider> </PrivateRoute>} />
        <Route path="/posts-and-feeds" element={<PrivateRoute><UserProvider><PostsAndFeedsPage /></UserProvider></PrivateRoute>} />
        <Route path="/family-gallery" element={<PrivateRoute><UserProvider><FamilyGalleryPage /></UserProvider></PrivateRoute>} />
        <Route path="/gifts-memories" element={<PrivateRoute><UserProvider><GiftListingPage /></UserProvider></PrivateRoute>} />
         <Route path="/events" element={<PrivateRoute><UserProvider><EventsPage /></UserProvider></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
