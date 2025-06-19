import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCalendarAlt,
  faSitemap,
  faUserPlus,
  faHourglassHalf,
  faGift,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { FaTimes } from 'react-icons/fa';

const iconMap = {
  profile: faUser,
  upcomingEvent: faCalendarAlt,
  familyTree: faSitemap,
  addFamilyMember: faUserPlus,
  pendingApprovals: faHourglassHalf,
  gifts: faGift,
  logout: faSignOutAlt
};

const Sidebar = ({
  activeTab,
  setActiveTab,
  userInfo = {},
  isMobile,
  onCloseMobile
}) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'profile', label: 'Profile', route: '/myprofile' },
    { id: 'upcomingEvent', label: 'Upcoming Event' },
    { id: 'familyTree', label: 'Family Tree' },
    { id: 'addFamilyMember', label: 'Add Family Member' },
    { id: 'pendingApprovals', label: 'Pending Approvals' },
    { id: 'gifts', label: 'Gifts' },
    { id: 'logout', label: 'Logout' }
  ];

  const handleItemClick = (item) => {
     if (item.id === 'logout') {
      handleLogout();
      return;
    }
    setActiveTab(item.id);
    if (item.route) {
      navigate(item.route);
    }
    if (isMobile && onCloseMobile) {
      onCloseMobile(); // Close sidebar on mobile after selecting
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="sidebarbg h-full flex flex-col w-full max-w-[280px]">
      {/* Header: Logo right, close icon left */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 sm:justify-start">
        {/* Close icon (only mobile) */}
        {isMobile && (
          <button onClick={onCloseMobile} className="text-gray-600 mr-4 sm:hidden">
            <FaTimes size={20} />
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <div className="w-[40px] h-[40px] flex-shrink-0">
            <img
              src="/assets/logo-green-light.png"
              alt="Aalam Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h4 className="text-xl font-bold text-gray-800 leading-tight hidden sm:block">Aalam</h4>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 pl-8 py-6 overflow-y-auto">
        <nav className="flex flex-col gap-8">
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center text-gray-800 text-base cursor-pointer ${activeTab === item.id ? 'font-semibold' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <FontAwesomeIcon icon={iconMap[item.id]} className="mr-3 text-lg" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* User Section */}
      <div className="border-t border-gray-200 px-3 py-2 space-y-2">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full overflow-hidden shadow-md">
            {userInfo.profilePic ? (
              <img
                src={userInfo.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-lg">👤</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {userInfo.name || 'User Name'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {userInfo.familyName || 'Family name'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
