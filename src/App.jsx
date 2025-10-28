import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';

// PHASE 4 OPTIMIZATION: Lazy load all pages for code splitting
const Login = lazy(() => import('./Pages/Login'));
const Register = lazy(() => import('./Pages/Register'));
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./Pages/ResetPassword'));
const OnBoarding = lazy(() => import('./Pages/OnBoarding'));
const VerifyOtp = lazy(() => import('./Pages/VerifyOtp'));
const Dashboard = lazy(() => import('./Pages/Dashboard'));
const MyProfile = lazy(() => import('./Pages/MyProfile'));
const MyFamilyMember = lazy(() => import('./Pages/MyFamilyMember'));
const MyFamily = lazy(() => import('./Pages/MyFamily'));
const FamilyTreePage = lazy(() => import('./Pages/FamilyTreePage'));
const PendingFamilyRequests = lazy(() => import('./Pages/PendingFamilyRequests'));
const PostsAndFeedsPage = lazy(() => import('./Pages/PostsAndFeedsPage'));
const FamilyGalleryPage = lazy(() => import('./Pages/FamilyGalleryPage'));
const GiftListingPage = lazy(() => import('./Pages/GiftListingPage'));
const EventsPage = lazy(() => import('./Pages/EventsPage'));
const OrderManagementPage = lazy(() => import('./Pages/OrderManagementPage'));
const SuggestionApproving = lazy(() => import('./Pages/SuggestionApproving'));
const AssociatedFamilyTreePage = lazy(() => import('./Pages/AssociatedFamilyTreePage'));
const ProfileModule = lazy(() => import('./Pages/ProfileFormPage'));

import { UserProvider } from './Contexts/UserContext';
import { LanguageProvider } from './Contexts/LanguageContext';
import PrivateRoute, { RoleBasedRoute } from './Routes/PrivateRoute';
import GuestRoute from './Routes/GuestRoute';
import { FamilyTreeProvider } from './Contexts/FamilyTreeContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/queryClient';

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
);

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
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
          
            {/* Guest-only routes */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/" element={ <GuestRoute> <Login /> </GuestRoute> } />
          <Route path="/register" element={ <GuestRoute> <Register /> </GuestRoute> } />
          <Route path="/forgot-password" element={ <GuestRoute> <ForgotPassword /> </GuestRoute> } />
          <Route path="/reset-password" element={ <GuestRoute> <ResetPassword /> </GuestRoute> } />
          <Route path="/verify-otp" element={ <GuestRoute> <VerifyOtp /> </GuestRoute> } />
          <Route path="/edit-profile" element={ <GuestRoute> <ProfileModule /> </GuestRoute> } />

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

          <Route path="/pending-request" element={<PrivateRoute><LanguageProvider><PendingFamilyRequests /></LanguageProvider></PrivateRoute>} />
          <Route path="/pending-approvals" element={<PrivateRoute><LanguageProvider><PendingFamilyRequests /></LanguageProvider></PrivateRoute>} />
          <Route path="/posts-and-feeds" element={<PrivateRoute><LanguageProvider><PostsAndFeedsPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/family-gallery" element={<PrivateRoute><LanguageProvider><FamilyGalleryPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/gifts-memories" element={<PrivateRoute><LanguageProvider><GiftListingPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/gifts" element={<PrivateRoute><LanguageProvider><GiftListingPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><LanguageProvider><EventsPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/upcoming-events" element={<PrivateRoute><LanguageProvider><EventsPage /></LanguageProvider></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><AdminRoute><LanguageProvider><OrderManagementPage /></LanguageProvider></AdminRoute></PrivateRoute>} />
          <Route path="/suggestion-approving" element={<PrivateRoute><LanguageProvider><SuggestionApproving /></LanguageProvider></PrivateRoute>} />

          </Routes>
        </Suspense>
      </Router>
    </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
