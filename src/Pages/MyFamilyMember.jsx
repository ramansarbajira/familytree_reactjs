import React, { useState } from 'react';
import Layout from '../Components/Layout'; // Assuming you have a Layout component
import { useNavigate } from 'react-router-dom';

import ProfileFormModal from '../Components/ProfileFormModal'; // Assuming you have this modal component

// Icons
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import { FaUserFriends, FaBirthdayCake, FaPhone, FaHome, FaMale, FaFemale } from 'react-icons/fa';

// ---

// FamilyMemberCard Component
// This component displays individual family member details in a card format.
const FamilyMemberCard = ({ member, onViewDetails, onEditMember, onDeleteMember }) => {
  // Define colors for different relations for visual distinction
  const relationColors = {
    'Self': 'bg-blue-100 text-blue-800',
    'Spouse': 'bg-purple-100 text-purple-800',
    'Son': 'bg-green-100 text-green-800',
    'Daughter': 'bg-pink-100 text-pink-800',
    'Father': 'bg-amber-100 text-amber-800',
    'Mother': 'bg-rose-100 text-rose-800',
    'Brother': 'bg-indigo-100 text-indigo-800',
    'Sister': 'bg-teal-100 text-teal-800',
    'Grandfather': 'bg-lime-100 text-lime-800',
    'Grandmother': 'bg-orange-100 text-orange-800',
  };

  return (
    <div
      key={member.id}
      onClick={() => onViewDetails(member.id)}
      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-in-out group cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex items-start p-5 pb-0">
        {/* Profile Picture Section */}
        <div className="relative flex-shrink-0 w-24 h-24 rounded-full overflow-hidden border-3 border-primary-200 shadow-lg">
          <img
            src={member.profilePic || "https://placehold.co/96x96/e2e8f0/64748b?text=👤"}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={(e) => e.target.src = "https://placehold.co/96x96/e2e8f0/64748b?text=👤"}
          />
          {member.isAdmin && (
            <span className="absolute bottom-0 right-0 -mr-1 -mb-1 px-2 py-0.5 bg-primary-DEFAULT text-white text-xs font-bold rounded-full border-2 border-white shadow">
              Admin
            </span>
          )}
        </div>

        {/* Member Details */}
        <div className="ml-4 flex-1 min-w-0">
          <h3 className="text-xl font-extrabold text-gray-900 truncate pr-2">
            {member.name}
          </h3>
          <span className={`mt-1 inline-block text-sm font-semibold px-3 py-1 rounded-full ${relationColors[member.relation] || 'bg-gray-100 text-gray-800'}`}>
            {member.relation}
          </span>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <FaBirthdayCake className="mr-2 text-primary-500" size={16} />
            <span className="font-medium">{member.age} years old</span>
          </div>
          <div className="mt-1 flex items-center text-sm text-gray-600">
            {member.gender === 'Male' ? <FaMale className="mr-2 text-blue-500" size={16} /> : <FaFemale className="mr-2 text-pink-500" size={16} />}
            <span className="font-medium">{member.gender}</span>
          </div>
        </div>
      </div>
      
      {/* Contact and Address Section */}
      <div className="px-5 py-4 mt-4 bg-gray-50 border-t border-b border-gray-100 mx-5 rounded-lg">
        {member.contact && (
          <div className="flex items-center text-sm text-gray-700 mb-2">
            <FaPhone className="mr-3 text-primary-500" size={16} />
            <span className="font-medium">{member.contact}</span>
          </div>
        )}
        {member.address && (
          <div className="flex items-start text-sm text-gray-700">
            <FaHome className="mr-3 text-primary-500 mt-1" size={16} />
            <span className="line-clamp-2">{member.address}</span>
          </div>
        )}
      </div>
      
      {/* Actions Section */}
      <div className="flex justify-between items-center px-5 py-4">
        <span className="text-xs text-gray-500">
          Last updated: {member.lastUpdated}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEditMember(member.id, e); }}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-colors tooltip"
            title="Edit Member"
          >
            <FiEdit2 size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteMember(member.id, e); }}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors tooltip"
            title="Delete Member"
          >
            <FiTrash2 size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(member.id); }}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-colors tooltip"
            title="View Member"
          >
            <FiEye size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---

// FamilyMemberListing Component
// This is the main component for displaying and managing family members.
const FamilyMemberListing = () => {
  const navigate = useNavigate(); // For programmatic navigation (if you uncomment routes)
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('myFamilyMember'); // For layout active tab management
  const [isModalOpen, setIsModalOpen] = useState(false); // State for the Add/Edit Member modal
  
  // State for filtering members
  const [filters, setFilters] = useState({
    relation: [],
    gender: '',
    ageRange: [0, 100],
    isAdmin: false,
  });
  const [sortBy, setSortBy] = useState('name-asc'); // State for sorting members

  // Sample Family Members Data
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: 'Stephan Curry', relation: 'Self', age: 36, gender: 'Male', maritalStatus: 'Married', contact: '8122345789', address: '204, North Anna Salai, Chennai, Tamil Nadu 600002', dob: '1988-03-14', profilePic: 'https://randomuser.me/api/portraits/men/32.jpg', lastUpdated: '2 days ago', isAdmin: true },
    { id: 2, name: 'Ayesha Curry', relation: 'Spouse', age: 34, gender: 'Female', maritalStatus: 'Married', contact: '9876543210', address: '204, North Anna Salai, Chennai', dob: '1989-07-23', profilePic: 'https://randomuser.me/api/portraits/women/44.jpg', lastUpdated: '1 week ago', isAdmin: false },
    { id: 3, name: 'Canon Curry', relation: 'Son', age: 8, gender: 'Male', maritalStatus: 'Single', contact: 'N/A', address: '204, North Anna Salai, Chennai', dob: '2015-05-02', profilePic: 'https://randomuser.me/api/portraits/lego/5.jpg', lastUpdated: '3 days ago', isAdmin: false },
    { id: 4, name: 'Dell Curry', relation: 'Father', age: 60, gender: 'Male', maritalStatus: 'Married', contact: '8765432109', address: '105, Old Village Road, Madurai, Tamil Nadu 625001', dob: '1958-12-12', profilePic: 'https://randomuser.me/api/portraits/men/75.jpg', lastUpdated: '1 month ago', isAdmin: true },
    { id: 5, name: 'Sonya Curry', relation: 'Mother', age: 60, gender: 'Female', maritalStatus: 'Married', contact: '7654321098', address: '105, Old Village Road, Madurai', dob: '1963-08-05', profilePic: 'https://randomuser.me/api/portraits/women/75.jpg', lastUpdated: '2 weeks ago', isAdmin: false },
    { id: 6, name: 'Seth Curry', relation: 'Brother', age: 33, gender: 'Male', contact: '9988776655', address: '301, Sports Avenue, Bangalore, Karnataka', dob: '1990-08-10', profilePic: 'https://randomuser.me/api/portraits/men/45.jpg', isAdmin: false, lastUpdated: '1 day ago' },
    { id: 7, name: 'Sydel Curry', relation: 'Sister', age: 29, gender: 'Female', contact: '4433221100', address: '12B, Artist Colony, Mumbai, Maharashtra', dob: '1995-03-20', profilePic: 'https://randomuser.me/api/portraits/women/65.jpg', isAdmin: false, lastUpdated: '5 days ago' },
  ]);

  // Helper function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter and sort members based on current state
  const filteredAndSortedMembers = familyMembers
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.relation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (member.contact && member.contact.includes(searchTerm));

      const matchesRelation = filters.relation.length === 0 || filters.relation.includes(member.relation);
      const matchesGender = !filters.gender || member.gender === filters.gender;
      const matchesAge = member.age >= filters.ageRange[0] && member.age <= filters.ageRange[1];
      const matchesAdmin = !filters.isAdmin || member.isAdmin;

      return matchesSearch && matchesRelation && matchesGender && matchesAge && matchesAdmin;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'age-asc') return a.age - b.age;
      if (sortBy === 'age-desc') return b.age - a.age;
      return 0; // Default or no-sort case
    });

  // Modal handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Add new member logic
  const handleAddNewMember = (newMemberData) => {
    const newId = familyMembers.length > 0 ? Math.max(...familyMembers.map(m => m.id)) + 1 : 1;
    const now = new Date();
    // For `lastUpdated`, using a simpler string for demo purposes, but ideally a Date object or ISO string.
    const lastUpdatedString = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`; 
    
    // Ensure dob is in YYYY-MM-DD format for age calculation
    let formattedDob = newMemberData.dob;
    if (newMemberData.dob && !newMemberData.dob.includes('-')) {
        const parts = newMemberData.dob.split('/');
        if (parts.length === 3) {
            formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert DD/MM/YYYY to YYYY-MM-DD
        }
    }

    setFamilyMembers((prevMembers) => [
      ...prevMembers,
      { 
        id: newId, 
        ...newMemberData, 
        dob: formattedDob, 
        age: calculateAge(formattedDob), 
        lastUpdated: `just now`, 
        profilePic: newMemberData.profilePic || `https://placehold.co/96x96/e2e8f0/64748b?text=${newMemberData.name ? newMemberData.name[0] : '?'}` 
      },
    ]);
    console.log('Member added successfully:', newMemberData);
    alert('New member added successfully!');
    handleCloseModal();
  };

  // Handlers for card actions
  const handleViewMember = (id) => {
    console.log(`Navigating to view member details for ID: ${id}`);
    alert(`View details for member ID: ${id}`);
    // Example of using navigate: navigate(`/family-member/${id}`);
  };

  const handleEditMember = (id, e) => {
    e.stopPropagation(); // Prevent card onClick from firing
    console.log(`Navigating to edit member with ID: ${id}`);
    alert(`Edit member with ID: ${id}`);
    // Example of using navigate: navigate(`/family-member/edit/${id}`);
  };

  const handleDeleteMember = (id, e) => {
    e.stopPropagation(); // Prevent card onClick from firing
    if (window.confirm('Are you sure you want to delete this family member?')) {
      setFamilyMembers(prev => prev.filter(member => member.id !== id));
      alert(`Member with ID: ${id} deleted.`);
    }
  };

  // Calculate dashboard metrics
  const totalMembers = familyMembers.length;
  const males = familyMembers.filter(m => m.gender === 'Male').length;
  const females = familyMembers.filter(m => m.gender === 'Female').length;
  const averageAge = totalMembers > 0 ? (familyMembers.reduce((sum, m) => sum + m.age, 0) / totalMembers).toFixed(1) : 0;
  
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="min-h-screen"> {/* Changed background gradient */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          {/* Header Section */}
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <FaUserFriends className="mr-4 text-primary-DEFAULT" size={32} />
                My Family Tree
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Explore and manage {totalMembers} cherished family members.
              </p>
            </div>
            
            {/* Search and Add Member Button */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, relation, or contact..."
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleOpenModal}
                className="flex items-center justify-center bg-primary-DEFAULT hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-colors text-base font-semibold transform hover:scale-105"
              >
                <FiPlus className="mr-2" size={20} />
                Add New Member
              </button>
            </div>
          </div>

          {/* Dashboard Overview - Displays only if there are members */}
          {totalMembers > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Members</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalMembers}</p>
                  </div>
                  <FaUserFriends className="text-primary-400 opacity-50" size={40} />
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Males</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{males}</p>
                  </div>
                  <FaMale className="text-blue-400 opacity-50" size={40} />
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Females</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{females}</p>
                  </div>
                  <FaFemale className="text-pink-400 opacity-50" size={40} />
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Average Age</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{averageAge}</p>
                  </div>
                  <FaBirthdayCake className="text-purple-400 opacity-50" size={40} />
                </div>
              </div>

              <hr className="my-10 border-gray-200" />
            </>
          )}

          {/* Filter and Sort Controls - Displays only if there are members */}
          {totalMembers > 0 && (
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <label htmlFor="sortBy" className="text-gray-700 font-medium text-sm">Sort by:</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-48 pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="age-asc">Age (Lowest First)</option>
                  <option value="age-desc">Age (Highest First)</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <label htmlFor="genderFilter" className="text-gray-700 font-medium text-sm">Gender:</label>
                <select
                  id="genderFilter"
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  className="block w-36 pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          )}

          {/* Family Members Grid or Empty State */}
          {filteredAndSortedMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredAndSortedMembers.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  onViewDetails={handleViewMember}
                  onEditMember={handleEditMember}
                  onDeleteMember={handleDeleteMember}
                />
              ))}
            </div>
          ) : (
            // Empty State Display
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-md">
              <div className="mx-auto w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 border border-primary-100">
                <FaUserFriends className="text-primary-400 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm || (Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f))) ? 'No matching family members found.' : 'Your family tree is waiting to grow!'}
              </h3>
              <p className="text-gray-600 mb-6 text-base max-w-md mx-auto">
                {searchTerm || (Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f)))
                  ? 'Adjust your search terms or clear the filters to see all members.' 
                  : 'Start by adding your first family member to build your family history.'}
              </p>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center bg-primary-DEFAULT hover:bg-primary-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors font-semibold transform hover:scale-105"
              >
                <FiPlus className="mr-2" size={20} />
                Add Your First Family Member
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      <ProfileFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddMember={handleAddNewMember}
        mode="add"
      />
    </Layout>
  );
};

export default FamilyMemberListing;