import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiShare2,
  FiImage,
  FiGift,
  FiUsers,
  FiClock,
  FiChevronDown,
  FiCalendar,
  FiPackage
} from 'react-icons/fi';
import { RiGitMergeLine } from 'react-icons/ri';
import { FaTimes } from 'react-icons/fa';

let userInfo = null;
try {
  userInfo = JSON.parse(localStorage.getItem('userInfo'));
} catch {}

const hasFamilyCode = userInfo && userInfo.familyCode;

const menuItems = [
  { id: 'home', label: 'Home', route: '/dashboard', icon: <FiHome size={19} /> },
  { id: 'events', label: 'Events', route: '/events', icon: <FiCalendar size={19} /> },
  { id: 'familyTree', label: 'Family Tree', route: '/family-tree', icon: <RiGitMergeLine size={19} /> },
  {
    id: 'familyManagement',
    label: 'Family Management',
    icon: <FiUsers size={19} />,
    children: [
      { id: 'myFamily', label: 'My Family', route: '/my-family', icon: <FiUsers size={17} /> },
      { id: 'myFamilyMembers', label: 'All Members', route: '/my-family-member', icon: <FiUsers size={17} /> },
      { id: 'pendingRequests', label: 'Pending Requests', route: '/pending-request', icon: <FiClock size={17} /> },
    ]
  },
  { id: 'posts', label: 'Posts & Stories', route: '/posts-and-feeds', icon: <FiShare2 size={19} /> },
  { id: 'gallery', label: 'Family Gallery', route: '/family-gallery', icon: <FiImage size={19} /> },
  { id: 'gifts', label: 'Gifts & Memories', route: '/gifts-memories', icon: <FiGift size={19} /> },
  { id: 'orders', label: 'Order Management', route: '/orders', icon: <FiPackage size={19} /> },
];

const Sidebar = ({ isMobile, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedParents, setExpandedParents] = useState({});
  // Get user info from localStorage
  const isAdmin = userInfo && userInfo.role === 3;

  const filteredMenuItems = isAdmin
    ? menuItems
    : menuItems.filter(item => item.id !== 'orders');

  useEffect(() => {
    const newExpandedParents = {};
    filteredMenuItems.forEach(item => {
      if (item.children) {
        // Expand parent if any child route starts with the current path
        newExpandedParents[item.id] = item.children.some(
          child => location.pathname.startsWith(child.route)
        );
      }
    });
    setExpandedParents(newExpandedParents);
  }, [location.pathname]);

  const isLinkActive = (item) => {
    if (item.route) {
      return location.pathname === item.route; //  Use exact match
    }
    if (item.children) {
      return item.children.some(child => location.pathname === child.route); //  Exact match for children
    }
    return false;
  };

  const handleItemClick = (item) => {
    if (item.id === 'logout') {
      // handleLogout logic should be in Layout or passed as a prop
      // For now, it will just log
      console.log("Logout clicked from sidebar");
      if (isMobile && onCloseMobile) onCloseMobile(); // Close sidebar on logout click
      return;
    }

    if (item.children) {
      setExpandedParents(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
      return;
    }

    if (item.route) {
      navigate(item.route);
    }

    if (isMobile && onCloseMobile) onCloseMobile();
  };

  return (
    <div className="flex flex-col h-full bg-white  border-gray-100 shadow-xl"> {/* Adjusted shadow and border-radius */}
      <div className="flex items-center justify-between px-6 py-3  flex-shrink-0 shadow-md">
        {isMobile && (
          <button onClick={onCloseMobile} className="text-gray-500 hover:text-gray-700 transition-colors mr-4">
            <FaTimes size={24} />
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <div className="w-10 h-10 flex-shrink-0"> {/* Adjusted to w-10 h-10 for consistency */}
            <img src="/assets/logo-green-light.png" alt="Aalam Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Aalam</h2> {/* Removed hidden sm:block, assuming desktop sidebar is always wide enough */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-4 custom-scrollbar">
        <nav className="space-y-1.5">
          {filteredMenuItems.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <div>
                  <button
                    className={`bg-unset flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2
                      ${isLinkActive(item)
                        ? 'text-primary-700 bg-primary-50 font-semibold'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className={`mr-4 text-xl ${isLinkActive(item) ? 'text-primary-500' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-base">{item.label}</span>
                    <span className={`transform transition-transform duration-200 text-gray-500 ${
                      expandedParents[item.id] ? 'rotate-180' : ''
                    }`}>
                      <FiChevronDown size={16} />
                    </span>
                  </button>
                  {expandedParents[item.id] && (
                    <div className="ml-12 mt-1 space-y-1 border-l border-gray-200 pl-2">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          className={`bg-unset flex items-center w-full px-4 py-2.5 rounded-lg text-left text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200
                            ${location.pathname.startsWith(child.route)
                              ? 'text-primary-600 bg-primary-50 font-medium'
                              : 'text-gray-600 hover:text-primary-500 hover:bg-gray-100'
                            }`}
                          onClick={() => handleItemClick(child)}
                        >
                          <span className={`mr-3 ${location.pathname.startsWith(child.route) ? 'text-primary-400' : 'text-gray-400'}`}>
                            {child.icon}
                          </span>
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className={`bg-unset flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300
                    ${isLinkActive(item)
                      ? 'text-primary-700 bg-primary-50 font-semibold'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  onClick={() => handleItemClick(item)}
                >
                  <span className={`mr-4 text-xl ${isLinkActive(item) ? 'text-primary-500' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className="text-base">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;