import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNavBar from './BottomNavBar';
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiX,
  FiChevronDown,
  FiCheck,
  FiClock,
  FiUser,
  FiCalendar,
  FiGift,
  FiHeart
} from 'react-icons/fi';
import { RiUser3Line } from 'react-icons/ri';
import { UserProvider, useUser } from '../Contexts/UserContext';
import ProfileFormModal from './ProfileFormModal'; // Adjust path if necessary

const NotificationPanel = ({ open, onClose, notifications, markAsRead }) => {

  const notificationTypes = {
    request: { icon: <FiUser className="text-blue-500" />, bg: 'bg-blue-50' },
    birthday: { icon: <FiGift className="text-pink-500" />, bg: 'bg-pink-50' },
    event: { icon: <FiCalendar className="text-purple-500" />, bg: 'bg-purple-50' },
    anniversary: { icon: <FiHeart className="text-red-500" />, bg: 'bg-red-50' }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end pt-16">
      <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />

      <div className="relative z-50 w-full max-w-sm bg-white shadow-xl rounded-t-lg overflow-hidden notification-panel">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
              className="bg-unset text-sm text-primary-600 hover:text-primary-800 px-2 py-1 rounded"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="bg-unset text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FiBell size={24} className="mx-auto mb-2 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`${!notification.read ? 'bg-blue-50/30' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <div className="px-4 py-3 flex items-start">
                    <div className={`flex-shrink-0 p-2 rounded-full ${notificationTypes[notification.type].bg} mr-3`}>
                      {notificationTypes[notification.type].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="bg-unset text-gray-400 hover:text-gray-600 ml-2"
                            title="Mark as read"
                          >
                            <FiCheck size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <FiClock className="mr-1" size={12} />
                        <span>{notification.time}</span>
                      </div>

                      {notification.actions && (
                        <div className="mt-3 flex space-x-2">
                          {notification.actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={action.onClick}
                              className={`text-xs px-3 py-1 rounded-md ${
                                action.primary
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 text-center">
          <button className="bg-unset text-sm text-primary-600 hover:text-primary-800 font-medium">
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children, activeTab = 'home', setActiveTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const navigate = useNavigate();

  //user info
  const { userInfo, userLoading } = useUser();
  //console.log(userInfo); // This will log the user info to the console

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'request',
      title: 'New Connection Request',
      message: 'Alex Johnson wants to connect with you',
      time: 'Just now',
      read: false,
      actions: [
        { label: 'Accept', primary: true, onClick: () => handleRequest(1, 'accept') },
        { label: 'Decline', primary: false, onClick: () => handleRequest(1, 'decline') }
      ]
    },
    {
      id: 2,
      type: 'birthday',
      title: 'Birthday Reminder',
      message: "Today is Sarah Miller's birthday. Don't forget to wish them!",
      time: 'Today, 9:00 AM',
      read: false,
      actions: [
        { label: 'Send Wish', primary: true, onClick: () => sendBirthdayWish(2) }
      ]
    },
    {
      id: 3,
      type: 'event',
      title: 'Upcoming Event',
      message: 'Team meeting starts in 15 minutes',
      time: 'Today, 2:45 PM',
      read: true
    },
    {
      id: 4,
      type: 'anniversary',
      title: 'Work Anniversary',
      message: 'Congratulations! You completed 2 years at Company',
      time: 'Yesterday',
      read: false,
      actions: [
        { label: 'Share', primary: false, onClick: () => shareAnniversary(4) }
      ]
    }
  ]);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
        setSearchOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close all overlays when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen || searchOpen || profileOpen || notificationOpen) {
        const sidebar = document.querySelector('.sidebar-container');
        const searchBar = document.querySelector('.search-container');
        const profileMenu = document.querySelector('.profile-menu');
        const notificationPanel = document.querySelector('.notification-panel');

        if (!sidebar?.contains(e.target) &&
            !searchBar?.contains(e.target) &&
            !profileMenu?.contains(e.target) &&
            !notificationPanel?.contains(e.target)) {
          setSidebarOpen(false);
          setSearchOpen(false);
          setProfileOpen(false);
          setNotificationOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, searchOpen, profileOpen, notificationOpen]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleRequest = (id, action) => {
    markAsRead(id);
    console.log(`Request ${id} ${action}ed`);
    // Add your actual request handling logic here
  };

  const sendBirthdayWish = (id) => {
    markAsRead(id);
    console.log(`Birthday wish sent for ${id}`);
    // Add your actual birthday wish logic here
  };

  const shareAnniversary = (id) => {
    markAsRead(id);
    console.log(`Anniversary ${id} shared`);
    // Add your actual share logic here
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
    // Note: onCloseMobile is not defined here. If this function is passed from a parent,
    // ensure it's available. Otherwise, remove the conditional call.
    // if (isMobile && onCloseMobile) onCloseMobile();
  };

  const openAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
    setProfileOpen(false); // Close the profile dropdown when modal opens
  };

  const closeAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-74 flex-shrink-0 sidebar-container">
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
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 sticky top-0 z-30 shadow-md">
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
              {/* Search Button (Mobile) */}
              {isMobile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchOpen(!searchOpen);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <FiSearch size={20} />
                </button>
              )}

              {/* Search Bar (Desktop) */}
              {!isMobile && (
                <div className="relative search-container">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              )}

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
              <div className="relative profile-menu">
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
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

          {/* Mobile Search Bar */}
          {isMobile && searchOpen && (
            <div className="mt-3 search-container">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
          )}
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
        notifications={notifications}
        markAsRead={markAsRead}
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