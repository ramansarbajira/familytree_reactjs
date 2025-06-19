// BottomNavBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCalendarAlt,
  faSitemap,
  faHourglassHalf,
  faGift,
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
  profile: faUser,
  upcomingEvent: faCalendarAlt,
  familyTree: faSitemap,
  pendingApprovals: faHourglassHalf,
  gifts: faGift,
};

const BottomNavBar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const bottomMenuItems = [
    { id: 'profile', label: 'Profile', route: '/myprofile' },
    { id: 'upcomingEvent', label: 'Events', route: '/upcoming-events' },
    { id: 'familyTree', label: 'Tree', route: '/family-tree' },
    { id: 'pendingApprovals', label: 'Approvals', route: '/pending-approvals' },
    { id: 'gifts', label: 'Gifts', route: '/gifts' },
  ];

  const handleItemClick = (item) => {
    setActiveTab(item.id);
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary z-50 px-2 py-1 shadow-inner">
      <div className="flex justify-around items-center">
        {bottomMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="flex flex-col items-center justify-center text-white cursor-pointer"
            >
              <div
                className={`flex items-center justify-center p-[6px] text-sm transition-all duration-150 ease-in-out ${
                  isActive
                    ? 'bg-white text-blue-600 rounded-md'
                    : 'text-white'
                }`}
              >
                <FontAwesomeIcon icon={iconMap[item.id]} className="text-base" />
              </div>
              <span
                className={`mt-0.5 text-[10px] font-medium ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
