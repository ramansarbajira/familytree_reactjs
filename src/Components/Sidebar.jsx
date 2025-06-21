import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faHouseUser,
  faUsers,
  faUserPlus,
  faHourglassHalf,
  faNewspaper,
  faImages,
  faRightFromBracket,
  faChevronDown,
  faChevronRight,
  faHome,
  faBars, // Keeping this if you need a mobile menu toggle icon on desktop, though not in the image.
  faShareNodes, // For 'Posts & Stories' - more generic for sharing content
  faCameraRetro, // For 'Family Gallery' - more visual for photos
  faGift, // Already good for Gifts & Memories
  faSignInAlt, // For 'Logout' - can imply signing out
  faCircleUser, // Alternative for 'My Profile' if you prefer a solid user circle
  faNetworkWired, // Alternative for family tree - implies connections
  faUserGroup, // Alternative for family management - explicit group of users
  faUserGear, // For family management - implies settings/management of users
  faUserClock, // For pending requests - implies timed user actions
} from '@fortawesome/free-solid-svg-icons';
import { FaTimes } from 'react-icons/fa'; // Assuming FaTimes is for mobile close
import { useUser } from '../Contexts/UserContext';

// --- Improved Icon Mapping for FontAwesome ---
const iconMap = {
  home: faHome,
  myProfile: faCircleUser, // Changed to faCircleUser for a more modern profile icon
  familyTree: faNetworkWired, // Changed for a more symbolic look
  familyManagement: faUserGear, // Changed to imply management/settings
  myFamilyMembers: faUserGroup, // Changed to a clear group icon
  inviteMember: faUserPlus,
  pendingRequests: faUserClock, // Changed to imply pending time/requests
  posts: faShareNodes, // Changed to suggest sharing content
  gallery: faCameraRetro, // Changed to a camera for gallery
  gifts: faGift,
  logout: faSignInAlt, // Changed to imply signing out
};

// --- Your Original Menu Items Definition ---
const menuItems = [
  { id: 'home', label: 'Home', route: '/dashboard', icon: 'home' },
  { id: 'myProfile', label: 'My Profile', route: '/myprofile', icon: 'myProfile' }, // This will now be a regular menu item
  { id: 'familyTree', label: 'My Family Tree', route: '/familytree', icon: 'familyTree' },
  {
    id: 'familyManagement', label: 'Family Management', icon: 'familyManagement',
    children: [
      { id: 'myFamilyMembers', label: 'All Members', route: '/myfamilymember', icon: 'myFamilyMembers' },
      { id: 'inviteMember', label: 'Invite New Member', route: '/invite-member', icon: 'inviteMember' },
      { id: 'pendingRequests', label: 'Pending Access', route: '/pending-request', icon: 'pendingRequests' },
    ]
  },
  { id: 'posts', label: 'Posts & Stories', route: '/posts-and-feeds', icon: 'posts' },
  { id: 'gallery', label: 'Family Gallery', route: '/family-gallery', icon: 'gallery' },
  { id: 'gifts', label: 'Gifts & Memories', route: '/gifts-memories', icon: 'gifts' },
  { id: 'logout', label: 'Logout', route: '/logout', icon: 'logout' }
];
// --- End of menuItems definition ---

const Sidebar = ({ isMobile, onCloseMobile }) => {
  const navigate = useNavigate();
  const { userInfo } = useUser() || {}; // This is for the bottom user info section
  const location = useLocation();

  const [expandedParents, setExpandedParents] = useState({});

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
  }, [location.pathname, menuItems]); // menuItems is stable, but good to include if it were dynamic

  const isLinkActive = (item) => {
    if (item.route && location.pathname.startsWith(item.route)) {
      return true;
    }
    if (item.children) {
      // Check if any child route is active
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
    if (item.children) {
      toggleParentExpansion(item.id);
      return;
    }

    if (item.id === 'logout') {
      handleLogout();
      return;
    }

    if (item.route) {
      navigate(item.route);
    }

    // Close mobile sidebar on item click for better UX
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    // Consider adding a proper logout API call if needed
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-full max-w-[280px] bg-white shadow-lg border-r border-gray-100 h-screen">
      {/* Header - Aalam Logo and Name */}
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
      <div className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar"> {/* Reduced py from 6 to 4 */}
        <nav className="flex flex-col gap-1"> {/* Reduced gap from 1 to 0 for tighter fit, or kept 1 for subtle spacing */}
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              {item.children ? (
                <div className="relative">
                  <div
                    className={`flex items-center py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-700
                      ${isLinkActive(item) ? 'font-semibold text-blue-700 bg-primary-50' : 'hover:bg-gray-100 hover:text-gray-900'}` // Subtle hover and active
                    }
                    onClick={() => handleItemClick(item)}
                  >
                    <FontAwesomeIcon icon={iconMap[item.icon]} className={`mr-3 text-xl w-6 ${isLinkActive(item) ? 'text-white-600' : 'text-gray-500'}`} />
                    <span className="text-base">{item.label}</span>
                    <FontAwesomeIcon
                      icon={expandedParents[item.id] ? faChevronDown : faChevronRight}
                      className={`ml-auto text-xs transition-transform duration-200 text-gray-500`}
                    />
                  </div>
                  {expandedParents[item.id] && (
                    <div className="ml-9 mt-0.5 space-y-0.5"> {/* Tighter spacing, reduced ml */}
                      {item.children.map((childItem) => (
                        <div
                          key={childItem.id}
                          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 text-sm text-gray-600
                            ${isLinkActive(childItem) ? 'font-medium text-blue-600 bg-primary-50' : 'hover:bg-gray-100 hover:text-white-800'}` // Subtle hover and active
                          }
                          onClick={() => handleItemClick(childItem)}
                        >
                          <FontAwesomeIcon icon={iconMap[childItem.icon]} className={`mr-3 text-lg w-5 ${isLinkActive(childItem) ? 'text-white-500' : 'text-gray-400'}`} />
                          <span>{childItem.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`flex items-center py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-700
                    ${isLinkActive(item) ? 'font-semibold text-blue-700 bg-blue-50' : 'hover:bg-gray-100 hover:text-gray-900'}` // Subtle hover and active
                  }
                  onClick={() => handleItemClick(item)}
                >
                  <FontAwesomeIcon icon={iconMap[item.icon]} className={`mr-3 text-xl w-6 ${isLinkActive(item) ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-base">{item.label}</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* User Info Section - Back at the bottom */}
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