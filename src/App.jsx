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
import FamilyTreePage from './Pages/FamilyTreePage'; 
import PendingFamilyRequests from './Pages/PendingFamilyRequests';
import PostsAndFeedsPage from './Pages/PostsAndFeedsPage'; 
import FamilyGalleryPage from './Pages/FamilyGalleryPage'; 
import GiftListingPage from './Pages/GiftListingPage'; 
import EventsPage from './Pages/EventsPage'; 
import OrderManagementPage from './Pages/OrderManagementPage'; 
import SuggestionApproving from './Pages/SuggestionApproving';
import AssociatedFamilyTreePage from './Pages/AssociatedFamilyTreePage';


import { UserProvider } from './Contexts/UserContext';
import { LanguageProvider } from './Contexts/LanguageContext';
import PrivateRoute, { RoleBasedRoute } from './Routes/PrivateRoute';
import GuestRoute from './Routes/GuestRoute';
import { FamilyTreeProvider } from './Contexts/FamilyTreeContext';

// Add a wrapper for admin-only route
const AdminRoute = ({ children }) => {
  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem('userInfo'));
  } catch {}
  if (!userInfo || userInfo.role !== 3) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <UserProvider>
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
          <Route path="/dashboard" element={<PrivateRoute><LanguageProvider><Dashboard /></LanguageProvider></PrivateRoute>} />
          <Route path="/myprofile" element={<PrivateRoute><LanguageProvider><MyProfile /></LanguageProvider></PrivateRoute>} />
          <Route path="/my-family-member" element={<PrivateRoute><LanguageProvider><MyFamilyMember /></LanguageProvider></PrivateRoute>  } />
          <Route path="/my-family" element={<PrivateRoute><LanguageProvider><MyFamily /></LanguageProvider></PrivateRoute>  } />
          <Route path="/family-tree" element={<PrivateRoute><LanguageProvider><FamilyTreePage /></LanguageProvider></PrivateRoute>  } />
          <Route path="/family-tree/:code" element={<PrivateRoute><LanguageProvider><FamilyTreePage /></LanguageProvider></PrivateRoute>  } />
          <Route path="/associated-family-tree/:code" element={<PrivateRoute><LanguageProvider><FamilyTreeProvider><AssociatedFamilyTreePage /></FamilyTreeProvider></LanguageProvider></PrivateRoute>} />
          <Route path="/associated-family-tree-user/:userId" element={<PrivateRoute><LanguageProvider><FamilyTreeProvider><AssociatedFamilyTreePage /></FamilyTreeProvider></LanguageProvider></PrivateRoute>} />

          <Route path ="/pending-request" element={<PrivateRoute><LanguageProvider><PendingFamilyRequests /></LanguageProvider></PrivateRoute>} />
          <Route path="/posts-and-feeds" element={<PrivateRoute><LanguageProvider><PostsAndFeedsPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/family-gallery" element={<PrivateRoute><LanguageProvider><FamilyGalleryPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/gifts-memories" element={<PrivateRoute><LanguageProvider><GiftListingPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><LanguageProvider><EventsPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><AdminRoute><LanguageProvider><OrderManagementPage /></LanguageProvider></AdminRoute></PrivateRoute>} />
          <Route path="/suggestion-approving" element={<PrivateRoute><LanguageProvider><SuggestionApproving /></LanguageProvider></PrivateRoute>} />

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
