import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNavBar from './BottomNavBar';
import {
  FiMenu,
  FiBell,
  FiChevronDown,
  FiCheck,
  FiClock,
  FiUser,
  FiCalendar,
  FiGift,
  FiHeart
} from 'react-icons/fi';
import { RiUser3Line } from 'react-icons/ri';
import { useUser } from '../Contexts/UserContext';
import ProfileFormModal from './ProfileFormModal';
import NotificationPanel from './NotificationPanel';
import { getNotificationType, getNotificationActions } from '../utils/notifications';

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('profile'); // Default to 'profile' tab
  const location = useLocation();

  // Sync activeTab with current route
  useEffect(() => {
    const pathToTabId = {
      '/dashboard': 'home',
      '/myprofile': 'profile',
      '/events': 'upcomingEvent',
      '/upcoming-events': 'upcomingEvent',
      '/posts-and-feeds': 'postsStories',
      '/gifts': 'gifts',
      '/gifts-memories': 'gifts',
    };
    const tabId = pathToTabId[location.pathname];
    if (tabId) setActiveTab(tabId);
  }, [location.pathname]);
  const [token, setToken] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
          setToken(storedToken);
      }
  }, []);

  //user info
  const { userInfo, userLoading, logout } = useUser();
  //console.log(userInfo); // This will log the user info to the console

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
  const handleClickOutside = (e) => {
    const clickedOutsideSidebar = sidebarRef.current && !sidebarRef.current.contains(e.target);
    const clickedOutsideProfile = profileRef.current && !profileRef.current.contains(e.target);
    const clickedOutsideNotification = '';

    if (
      sidebarOpen && clickedOutsideSidebar ||
      profileOpen && clickedOutsideProfile ||
      notificationOpen && clickedOutsideNotification
    ) {
      setSidebarOpen(false);
      setProfileOpen(false);
      setNotificationOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [sidebarOpen, profileOpen, notificationOpen]);

  const handleLogout = () => {
    logout(); // Clear user state from context
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const openAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
    setProfileOpen(false); // Close the profile dropdown when modal opens
  };

  const closeAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/unread/count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setUnreadCount(data.unreadCount); // Adjust based on API response shape
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const decrementUnreadCount = () => {
    setUnreadCount(prev => Math.max(0, prev - 1));
    // Also fetch the actual count to ensure accuracy
    setTimeout(fetchUnreadCount, 100);
  };

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchUnreadCount();
    }
  }, [userInfo]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div ref={sidebarRef} className="w-74 flex-shrink-0 sidebar-container">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-30" />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl rounded-r-2xl transform transition-transform duration-200 sidebar-container ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobile={true} // Pass isMobile prop
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 sticky top-0 z-50 shadow-md" style={{ position: 'relative' }}>
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(true);
                  }}
                  className="mr-2 p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <FiMenu size={20} />
                </button>
              )}
              
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationOpen(!notificationOpen);
                  }}
                  className="p-1 bg-unset text-primary-600 relative rounded-3xl hover:bg-gray-100 text-gray-600"
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile Dropdown */}
              <div ref={profileRef} className="relative profile-menu z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileOpen(!profileOpen);
                  }}
                  className="bg-unset flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
                >
                  {/* Conditional Rendering for Profile Image or Icon */}
                  {userInfo && userInfo.profileUrl ? (
                    <img
                      src={userInfo.profileUrl}
                      alt="User Profile"
                      className="w-8 h-8 rounded-full object-cover" // object-cover to maintain aspect ratio
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white">
                      <RiUser3Line size={16} />
                    </div>
                  )}
                  {!isMobile && (
                    <FiChevronDown size={16} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {profileOpen && (
                  <div className="fixed md:absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200" style={{ top: '4rem' }}>
                    {userLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-700">Loading user info...</div>
                    ) : userInfo ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-800 border-b border-gray-100">
                          <p className="font-semibold">{userInfo.firstName} {userInfo.lastName}</p>
                          {userInfo.familyCode && (
                            <p className="text-gray-500 text-xs">Family Code: {userInfo.familyCode}</p>
                          )}
                        </div>
                        <a
                          href="/myprofile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Profile
                        </a>
                        <button
                        onClick={openAddMemberModal}
                        className="bg-unset block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </button>
                        <div className="border-t border-gray-200"></div>
                        <button
                          onClick={handleLogout}
                          className="bg-unset block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          id="logout"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-700">User not logged in.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>


        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-1 md:p-1 bg-gray-50">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Notification Panel */}
      <NotificationPanel 
        open={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
        onNotificationCountUpdate={decrementUnreadCount}
      />

      {/* Add Member Form Modal */}
      <ProfileFormModal
        isOpen={isAddMemberModalOpen}
        onClose={closeAddMemberModal}
        mode="edit-profile"
      />

    </div>
  );
};

export default Layout;