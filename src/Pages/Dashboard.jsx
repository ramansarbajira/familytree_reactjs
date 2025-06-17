import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ProfileInfo from './ProfileInfo';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('feed'); // Default to 'feed'
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle navigation from Sidebar
  const handleNavigate = (route, tabId) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
    console.log(`Navigating to ${route} with tab ${tabId}`);
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render content based on active tab
  const renderContent = () => {
    // On mobile, always show ProfileInfo regardless of active tab
    if (isMobile) {
      return <ProfileInfo />;
    }

    // Desktop behavior - show content based on active tab
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
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border md:hidden"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarOpen ? (
              // Close icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger menu icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      )}

      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed left-0 top-0 h-full z-40 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'relative'
        }
      `}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userInfo={userInfo}
          counts={counts}
          onNavigate={handleNavigate}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;