// layout.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BottomNavBar from './BottomNavBar';
import { FaBars, FaBell } from 'react-icons/fa';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

   useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile(); // Initial check
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);


  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-[20%] min-w-[240px] max-w-[280px] border-r border-gray-200">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {/* Mobile Sidebar (remains the same) */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-40 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } flex`}
        >
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Panel */}
          <div className="relative w-[250px] bg-white shadow-lg z-50">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isMobile={true}
              onCloseMobile={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full relative pb-[60px] md:pb-0">
        {/* Mobile Top Bar - ADJUSTED DESIGN */}
        {isMobile && (
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-50">
            {/* Hamburger Button (Left) - WHITE COLOR */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              // Changed text-gray-700 to bg-primary-500 text-white for white lines
              className="p-1.5 bg-primary-500 text-white rounded-md transition-colors duration-200"
            >
              <FaBars size={20} />
            </button>

            {/* Logo (Centered) - BIGGER */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img
                src="/assets/logo-green-light.png"
                alt="Aalam Logo"
                className="h-[3rem]" // Increased height from 2.4rem to 3rem
              />
            </div>

            {/* Notification Bell Icon (Right) - WHITE COLOR */}
            <button
              // Changed text-primary-500 to bg-primary-500 text-white for white bell
              className="p-1.5 bg-primary-500 text-white rounded-md transition-colors duration-200 ml-auto"
            >
              <FaBell size={22} />
            </button>
          </div>
        )}

        {/* Page Content */}
        <div className="">{children}</div>

        {/* Mobile Bottom Navigation Bar */}
        {isMobile && (
          <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </main>
    </div>
  );
};

export default Layout;