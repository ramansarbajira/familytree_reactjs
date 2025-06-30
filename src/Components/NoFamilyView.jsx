import React from 'react';
import { FiUsers, FiPlus, FiLink, FiHeart } from 'react-icons/fi';

const NoFamilyView = ({ onCreateFamily, onJoinFamily }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-6 text-center text-white">
        <h1 className="text-3xl font-bold mb-2">Your Family Awaits</h1>
        <p className="opacity-90">Connect, share, and grow together</p>
      </div>
      
      <div className="p-8 sm:p-10 text-center">
        <div className="mx-auto w-40 h-40 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-lg">
          <FiUsers className="text-primary-500 text-6xl" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Your Family Hub
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
          Create your family's digital home where you can share memories, organize events, and stay connected with those who matter most.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={onCreateFamily}
            className="relative group flex-1 max-w-xs mx-auto sm:mx-0 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <FiPlus className="mr-3" size={24} />
              Create New Family
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          
          <button
            onClick={onJoinFamily}
            className="relative group flex-1 max-w-xs mx-auto sm:mx-0 flex items-center justify-center px-8 py-4 bg-white text-gray-800 border-2 border-purple-200 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <FiHeart className="mr-3 text-purple-600" size={24} />
              Join Family
            </span>
            <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Why create a family?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '👨‍👩‍👧‍👦',
                title: "Stay Connected",
                desc: "Keep in touch with family members near and far"
              },
              {
                icon: '📅',
                title: "Shared Calendar",
                desc: "Never miss important family events again"
              },
              {
                icon: '📸',
                title: "Shared Memories",
                desc: "Create a family photo album everyone can contribute to"
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoFamilyView;