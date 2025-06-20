import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faHouseUser, // Keep for Family Tree
  faUsers,
  faUserPlus,
  faHourglassHalf,
  faNewspaper,
  faImages,
  faGift,
  faRightFromBracket,
  faChevronDown,
  faChevronRight,
  faHome, // Added faHome icon
} from '@fortawesome/free-solid-svg-icons';
import { FaTimes } from 'react-icons/fa';
import { useUser } from '../Contexts/UserContext';

const iconMap = {
  home: faHome, // Mapped 'home' to faHome
  myProfile: faUserCircle,
  familyTree: faHouseUser,
  familyManagement: faUsers,
  myFamilyMembers: faUsers,
  inviteMember: faUserPlus,
  pendingRequests: faHourglassHalf,
  posts: faNewspaper,
  gallery: faImages,
  gifts: faGift,
  logout: faRightFromBracket
};

const Sidebar = ({ isMobile, onCloseMobile }) => {
  const navigate = useNavigate();
  const { userInfo } = useUser() || {};
  const location = useLocation();

  const [expandedParents, setExpandedParents] = useState({});

  const menuItems = [
    // Changed 'myProfile' to 'home', updated label and route
    { id: 'home', label: 'Home', route: '/dashboard', icon: 'home' },
    { id: 'myProfile', label: 'My Profile', route: '/myprofile', icon: 'myProfile' }, // Kept My Profile for direct access
    { id: 'familyTree', label: 'My Family Tree', route: '/familytree', icon: 'familyTree' }, // Changed route from /dashboard to /familytree for clarity
    {
      id: 'familyManagement', label: 'Family Management', icon: 'familyManagement',
      children: [
        { id: 'myFamilyMembers', label: 'All Members', route: '/myfamilymember', icon: 'myFamilyMembers' },
        { id: 'inviteMember', label: 'Invite New Member', route: '/invite-member', icon: 'inviteMember' },
        { id: 'pendingRequests', label: 'Pending Access', route: '/pending-request', icon: 'pendingRequests' },
      ]
    },
    { id: 'posts', label: 'Posts & Stories', route: '/posts', icon: 'posts' },
    { id: 'gallery', label: 'Family Gallery', route: '/gallery', icon: 'gallery' },
    { id: 'gifts', label: 'Gifts & Memories', route: '/gifts', icon: 'gifts' },
    { id: 'logout', label: 'Logout', route: '/logout', icon: 'logout' }
  ];

  useEffect(() => {
    const newExpandedParents = {};
    menuItems.forEach(item => {
      if (item.children) {
        if (item.children.some(child => location.pathname.startsWith(child.route))) {
          newExpandedParents[item.id] = true;
        }
      }
    });
    setExpandedParents(newExpandedParents);
  }, [location.pathname, menuItems]); // Added menuItems to dependency array for robustness

  const isLinkActive = (item) => {
    if (item.route && location.pathname.startsWith(item.route)) {
      return true;
    }
    if (item.children) {
      return item.children.some(child => location.pathname.startsWith(child.route));
    }
    return false;
  };

  const toggleParentExpansion = (parentId) => {
    setExpandedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  const handleItemClick = (item) => {
    if (item.id === 'logout') {
      handleLogout();
      return;
    }

    if (item.route) {
      navigate(item.route);
    } else if (item.children) {
      toggleParentExpansion(item.id);
    }

    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="sidebarbg flex flex-col w-full max-w-[280px] bg-white shadow-lg border-r border-gray-100 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sm:justify-start flex-shrink-0">
        {isMobile && (
          <button onClick={onCloseMobile} className="text-gray-500 mr-4 sm:hidden hover:text-gray-700 transition-colors">
            <FaTimes size={20} />
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <div className="w-[44px] h-[44px] flex-shrink-0">
            <img
              src="/assets/logo-green-light.png"
              alt="Aalam Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h4 className="text-2xl font-extrabold text-gray-900 hidden sm:block">Aalam</h4>
        </div>
      </div>

      {/* Menu Items Container - This is where the scrollable content goes */}
      <div className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              {item.children ? (
                <div className="relative">
                  <div
                    className={`flex items-center py-2.5 px-4 rounded-lg cursor-pointer transition-all duration-200
                      ${isLinkActive(item) ? 'font-semibold text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-800'}`
                    }
                    onClick={() => handleItemClick(item)}
                  >
                    <FontAwesomeIcon icon={iconMap[item.icon]} className="mr-4 text-lg w-5" />
                    <span>{item.label}</span>
                    <FontAwesomeIcon
                      icon={expandedParents[item.id] ? faChevronDown : faChevronRight}
                      className={`ml-auto text-xs transition-transform duration-200`}
                    />
                  </div>
                  {expandedParents[item.id] && (
                    <div className="ml-8 mt-1 space-y-1 border-l-2 border-primary-100 pl-2">
                      {item.children.map((childItem) => (
                        <div
                          key={childItem.id}
                          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 text-sm
                            ${isLinkActive(childItem) ? 'font-semibold text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-800'}`
                          }
                          onClick={() => handleItemClick(childItem)}
                        >
                          <FontAwesomeIcon icon={iconMap[childItem.icon]} className="mr-3 text-base w-4" />
                          <span>{childItem.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`flex items-center py-2.5 px-4 rounded-lg cursor-pointer transition-all duration-200
                    ${isLinkActive(item) ? 'font-semibold text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-800'}`
                  }
                  onClick={() => handleItemClick(item)}
                >
                  <FontAwesomeIcon icon={iconMap[item.icon]} className="mr-4 text-lg w-5" />
                  <span>{item.label}</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* User Info Section */}
      <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full overflow-hidden shadow-md flex-shrink-0">
            {userInfo?.profileUrl ? (
              <img
                src={userInfo.profileUrl || '/assets/default-user.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-600 text-xl">👤</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {userInfo?.name || 'Your Name'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {userInfo?.familyCode || 'Your Family'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;