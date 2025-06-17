// src/Pages/Profile.jsx
import React, { useState } from 'react';
import Layout from '../Components/Layout';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('profile'); // Set default tab
  
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Your profile content here */}
        <div className="bg-white p-6 rounded-lg shadow">
          Dashboard details go here...
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;