import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUsers } from '@fortawesome/free-solid-svg-icons';
import {
  faUser,
  faUsers,
  faCalendarAlt,
  faSitemap,
  faUserPlus,
  faHourglassHalf,
  faGift,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { FaTimes } from 'react-icons/fa';
import { useUser } from '../Contexts/UserContext';

const iconMap = {
  profile: faUser,
  familyTree: faSitemap,
  myFamilyMember: faUsers,
  pendingApprovals: faHourglassHalf,
  gifts: faGift,
  logout: faSignOutAlt
};

const Sidebar = ({ activeTab, setActiveTab, isMobile, onCloseMobile }) => {
  const navigate = useNavigate();
  const { userInfo } = useUser() || {};
  
  //console.log(userInfo);
  
  const menuItems = [
    { id: 'profile', label: 'Profile', route: '/myprofile' },
    { id: 'familyTree', label: 'Family Tree' },
    { id: 'myFamilyMember', label: 'My Family Member', route: '/myfamilymember'  },
    { id: 'pendingApprovals', label: 'Pending Approvals' },
    { id: 'gifts', label: 'Gifts' },
    { id: 'logout', label: 'Logout' }
  ];

  const handleItemClick = (item) => {
    if (item.id === 'logout') {
      handleLogout();
      return;
    }
    if (setActiveTab) setActiveTab(item.id);
    if (item.route) navigate(item.route);
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="sidebarbg h-full flex flex-col w-full max-w-[280px] bg-white shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 sm:justify-start">
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
          <h4 className="text-xl font-bold text-gray-800 hidden sm:block">Aalam</h4>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 pl-8 py-6 overflow-y-auto">
        <nav className="flex flex-col gap-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center text-gray-800 text-base cursor-pointer hover:text-primary transition-colors ${
                activeTab === item.id ? 'font-semibold text-primary' : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              <FontAwesomeIcon icon={iconMap[item.id]} className="mr-3 text-lg" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* User Info Section */}
      <div className="border-t border-gray-200 px-3 py-3">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full overflow-hidden shadow-md">
            {userInfo?.profileUrl ? (
              <img
                src={userInfo.profileUrl || '/assets/default-user.png'}
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
              {userInfo?.name || 'User Name'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {userInfo?.familyCode || 'Family Name'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
