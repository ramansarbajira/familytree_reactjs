import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNavBar from "./BottomNavBar";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import { FiMenu, FiBell, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { RiUser3Line } from "react-icons/ri";
import { useUser } from "../Contexts/UserContext";
import ProfileFormModal from "./ProfileFormModal";
import NotificationPanel from "./NotificationPanel";

const Layout = ({ children, noScroll = false }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const location = useLocation();
  const navigate = useNavigate();

  // Update active tab based on current route
  useEffect(() => {
    const pathToTabId = {
      "/dashboard": "home",
      "/myprofile": "profile",
      "/events": "upcomingEvent",
      "/upcoming-events": "upcomingEvent",
      "/posts-and-feeds": "postsStories",
      "/gifts": "gifts",
      "/gifts-memories": "gifts",
    };
    const tabId = pathToTabId[location.pathname];
    if (tabId) setActiveTab(tabId);
  }, [location.pathname]);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const sidebarRef = useRef(null);
  const profileRef = useRef(null);

  const { userInfo, userLoading, logout } = useUser();
  const { isConnected, unreadCount, refetchUnreadCount } =
    useNotificationSocket(userInfo);

  // Responsive layout handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
        // NotificationPanel handles its own overlay click-to-close, so don't close it here
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSidebarCollapseToggle = () => {
    setSidebarCollapsed((collapsed) => !collapsed);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const openAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
    setProfileOpen(false);
  };

  const closeAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const decrementUnreadCount = () => {
    refetchUnreadCount();
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          ref={sidebarRef}
          onMouseLeave={() => setSidebarCollapsed(true)}
          onMouseEnter={() => setSidebarCollapsed(false)}
          className={`flex flex-col bg-white shadow-md border-r border-gray-100 transition-all duration-300 ${
            sidebarCollapsed ? "w-20" : "w-72"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-center px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {!sidebarCollapsed ? (
                <>
                  <div className="w-12 h-12">
                    <img
                      src="/assets/logo-green-light.png"
                      alt="Familyss Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Familyss</h2>
                </>
              ) : (
                <div className="w-10 h-10">
                  <img
                    src="/assets/logo-green-light.png"
                    alt="Familyss Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Content */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
          />
        </div>
      )}

      {/* Mobile Sidebar + Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {isMobile && (
        <div
          ref={sidebarRef}
          onMouseLeave={() => setSidebarOpen(false)}
          className={`fixed top-0 left-0 z-[60] w-64 h-full bg-white shadow-2xl rounded-r-2xl transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Compact logo header for mobile */}
          <div className="flex items-center gap-2 p-4 border-b border-gray-200">
            <div className="w-10 h-10">
              <img
                src="/assets/logo-green-light.png"
                alt="Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Familyss</h2>
          </div>

          {/* Sidebar content */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobile
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 sticky top-0 z-50 shadow-md">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-2">
              {isMobile ? (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <FiMenu size={22} />
                </button>
              ) : (
                sidebarCollapsed && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8">
                      <img
                        src="/assets/logo-green-light.png"
                        alt="Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <h2
                      className={`font-semibold text-gray-800 ${
                        isMobile ? "text-sm" : "text-lg"
                      }`}
                    >
                      Familyss
                    </h2>
                  </div>
                )
              )}
            </div>

            {/* Right section */}
            {/* Right: Notifications + Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationOpen(!notificationOpen);
                  }}
                  className="p-1 bg-unset text-primary-600 relative rounded-3xl hover:bg-gray-100"
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {isConnected && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                  )}
                </button>
              </div>

              {/* Profile Dropdown */}
              <div ref={profileRef} className="relative z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileOpen(!profileOpen);
                  }}
                  className="bg-unset flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
                >
                  {userInfo?.profileUrl ? (
                    <img
                      src={userInfo.profileUrl}
                      alt="User Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white">
                      <RiUser3Line size={16} />
                    </div>
                  )}
                  {!isMobile && (
                    <FiChevronDown
                      size={16}
                      className={`transition-transform ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {profileOpen && (
                  <div
                    className="fixed md:absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                    style={{ top: "4rem" }}
                  >
                    <div className="px-4 py-2 text-sm text-gray-800 border-b border-gray-100">
                      <p className="font-semibold">
                        {userInfo?.firstName} {userInfo?.lastName}
                      </p>
                      {userInfo?.familyCode && (
                        <p className="text-gray-500 text-xs">
                          Family Code: {userInfo.familyCode}
                        </p>
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
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={`flex-1 ${noScroll ? 'overflow-hidden' : 'overflow-y-auto'} p-1 md:p-2 bg-gray-50`}>
          {children}
        </div>

        {/* Bottom Navbar (only on mobile) */}
        {isMobile && (
          <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Notifications */}
      <NotificationPanel
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        onNotificationCountUpdate={decrementUnreadCount}
      />

      {/* Settings/Profile Modal */}
      <ProfileFormModal
        isOpen={isAddMemberModalOpen}
        onClose={closeAddMemberModal}
        mode="edit-profile"
      />
    </div>
  );
};

export default Layout;
