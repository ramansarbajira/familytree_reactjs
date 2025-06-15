import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ProfileInfo from './ProfileInfo';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('feed'); // Default to 'feed'
  const [userInfo] = useState({
    name: 'Stephan Curry',
    familyName: 'Family name',
    appName: 'Aalam',
  });

  const [counts] = useState({
    feed: 0,
    friends: 0,
    stories: 0,
    feeds: 0
  });

  // Handle navigation from Sidebar
  const handleNavigate = (route, tabId) => {
    setActiveTab(tabId);
    // Here you could also handle actual routing if using React Router
    console.log(`Navigating to ${route} with tab ${tabId}`);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'feeds':
        return <ProfileInfo />;
      case 'feed':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Feed Content</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">This is your main feed content. Click on "Feeds" in the sidebar to view the profile information.</p>
            </div>
          </div>
        );
      case 'stories':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Stories Content</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Your stories will appear here.</p>
            </div>
          </div>
        );
      case 'friends':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Friends</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Your friends list will appear here.</p>
            </div>
          </div>
        );
      case 'create':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Create New</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Create new content here.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Application settings will appear here.</p>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Help and support information will appear here.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to Dashboard</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Select an option from the sidebar to get started.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        userInfo={userInfo}
        counts={counts}
        onNavigate={handleNavigate}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;