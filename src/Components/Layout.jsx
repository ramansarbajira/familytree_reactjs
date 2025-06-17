import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-[20%] min-w-[240px] max-w-[280px] border-r border-gray-200">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {/* Mobile Sidebar */}
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
      <main className="flex-1 overflow-y-auto w-full relative">
        {/* Mobile Top Bar */}
        {isMobile && (
         <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-50">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 bg-primary-500 text-white rounded-md"
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Logo aligned to right */}
            <div className="flex-1 flex justify-end">
              <img
                src="/assets/logo-green-light.png"
                alt="Aalam Logo"
                className="h-[3.4rem]"
              />
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
