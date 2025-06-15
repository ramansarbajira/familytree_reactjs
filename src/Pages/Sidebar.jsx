import React from 'react';


const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  counts = {}, 
  userInfo = {},
  onNavigate
}) => {
  const menuItems = [
    { 
      id: 'feed', 
      icon: '🏠', 
      label: 'Feed', 
      count: counts.feed || 0,
      isNavigation: true,
      route: '/feed'
    },
    { 
      id: 'stories', 
      icon: '📖', 
      label: 'Stories', 
      count: counts.stories,
      isNavigation: true,
      route: '/stories'
    },
    { 
      id: 'friends', 
      icon: '👥', 
      label: 'Friends', 
      count: counts.friends || 0 
    },
    { 
      id: 'feeds', 
      icon: '📡', 
      label: 'Feeds', 
      count: counts.feeds,
      isNavigation: true,
      route: '/feeds'
    },
    { id: 'create', icon: '➕', label: 'Create New' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'help', icon: '❓', label: 'Help & Support' }
  ];

  const handleItemClick = (item) => {
    if (item.isNavigation && onNavigate) {
      onNavigate(item.route, item.id);
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {userInfo.appName || 'Aalam'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Dashboard</p>
          </div>
        </div>
      </div>

      

      {/* Menu Items */}
      <div className="flex-1 py-6 px-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`group flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`text-xl transition-transform group-hover:scale-110 ${
                  activeTab === item.id ? 'filter brightness-110' : ''
                }`}>
                  {item.icon}
                </span>
                <span className={`font-medium text-sm ${
                  activeTab === item.id ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  activeTab === item.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-6 space-y-4">
        {/* Pro Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">👑</span>
              <span className="text-sm font-semibold text-gray-800">Upgrade to Pro</span>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              PRO
            </span>
          </div>
          <p className="text-xs text-gray-600">Get unlimited access to all features</p>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
          <div className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Sidebar;