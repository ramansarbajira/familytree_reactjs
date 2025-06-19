import React, { useState } from 'react';
import Layout from '../Components/Layout'; // Assuming Layout is in Components folder
import { useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa'; // Icon for "Add New Member" button
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // For section icons
import { faUsers } from '@fortawesome/free-solid-svg-icons'; // Main icon for the page header

// Import additional icons needed for the card details
import { FiPlus , FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'; // Removed FiChevronRight, FiEye as entire card is clickable
import { FaUserFriends , FaBirthdayCake, FaPhone, FaHome, FaVenusMars } from 'react-icons/fa';
import { IoMdMale, IoMdFemale } from 'react-icons/io';


// Component for a single family member card
const FamilyMemberCard = ({ member, onViewDetails, onEditMember, onDeleteMember }) => {
  // Relation color mapping - kept as is, good use of dynamic styling
  const relationColors = {
    'Self': 'bg-primary-100 text-primary-800', // Changed to primary
    'Spouse': 'bg-purple-100 text-purple-800',
    'Son': 'bg-green-100 text-green-800',
    'Daughter': 'bg-pink-100 text-pink-800',
    'Father': 'bg-amber-100 text-amber-800',
    'Mother': 'bg-rose-100 text-rose-800',
    'Brother': 'bg-indigo-100 text-indigo-800',
    'Sister': 'bg-teal-100 text-teal-800'
  };



  return (
    <div
      key={member.id}
      onClick={() => onViewDetails(member.id)}
      className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out group cursor-pointer"
    >
      {/* Edit/Delete Actions (top right) - Always visible on mobile, hover on desktop */}
      <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 sm:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEditMember(member.id, e); }}
          className="p-2 rounded-full bg-white text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors duration-200 shadow-md"
          title="Edit Member"
        >
          <FiEdit2 size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteMember(member.id, e); }}
          className="p-2 rounded-full bg-white text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200 shadow-md"
          title="Delete Member"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      <div className="p-5 flex flex-col items-center text-center">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0 w-28 h-28 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-primary-400 shadow-lg mb-4">
          <img
            // Updated placeholder to reflect primary theme colors
            src={member.profilePic || "https://placehold.co/112x112/primary-200/primary-600?text=👤"}
            alt={member.name}
            className="w-full h-full object-cover"
            // Fallback also updated to primary theme colors
            onError={(e) => e.target.src = "https://placehold.co/112x112/primary-200/primary-600?text=👤"}
          />
        </div>

        {/* Member Name with Relation and Admin Badge */}
        <div className="mb-4">
          <h3 className="text-2xl font-extrabold text-gray-800 flex items-center justify-center gap-2 mb-1">
            {member.name}
            {member.isAdmin && (
              // Ensure text is white for contrast on primary background
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-primary-600 to-primary text-green text-xs font-bold rounded-full shadow-md">
                Admin
              </span>
            )}
          </h3>
          <span className={`text-base font-semibold px-4 py-1.5 rounded-full ${relationColors[member.relation] || 'bg-gray-100 text-gray-800'} shadow-sm`}>
            {member.relation}
          </span>
        </div>

        {/* Contact and Basic Info - Improved mobile layout */}
        <div className="flex flex-col items-start gap-y-3 text-base w-full sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3">
          <div className="flex items-center text-gray-700 w-full sm:justify-start">
            <FaBirthdayCake className="mr-3 text-primary-500 text-xl" />
            <span>{member.age} years</span>
          </div>
          <div className="flex items-center text-gray-700 w-full sm:justify-start">
            <FaVenusMars className="mr-3 text-primary-500 text-xl" />
            <span>{member.gender}</span>
          </div>
          {member.contact && (
            <div className="flex items-center text-gray-700 w-full sm:col-span-2 sm:justify-start">
              <FaPhone className="mr-3 text-primary-500 text-xl" />
              <span>{member.contact}</span>
            </div>
          )}
          {member.address && (
            <div className="flex items-center text-gray-700 w-full sm:col-span-2 sm:justify-start">
              <FaHome className="mr-3 text-primary-500 text-xl" />
              <span className="truncate">{member.address.split(',')[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Last Updated and View Profile button */}
      <div className="px-5 py-3 bg-primary-50 border-t border-primary-100 flex justify-between items-center text-sm">
        <span className="text-xs text-primary-600 font-medium">
          Last Updated: {member.lastUpdated}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(member.id); }}
          className="bg-unset flex items-center text-primary hover:text-primary-800 font-semibold transition-colors duration-200"
        >
          View Full Profile
          <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );

};


const FamilyMemberListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('familyTree');

  // Sample family members data
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 1,
      name: 'Stephan Curry',
      relation: 'Self',
      age: 36,
      gender: 'Male',
      maritalStatus: 'Married',
      contact: '8122345789',
      address: '204, North Anna Salai, Chennai',
      dob: '14/03/1988',
      profilePic: 'https://placehold.co/96x96/FEE2E2/EF4444?text=SC', // Use dynamic placehold.co images
      lastUpdated: '2 days ago',
      isAdmin: true // Added isAdmin property
    },
    {
      id: 2,
      name: 'Ayesha Curry',
      relation: 'Spouse',
      age: 34,
      gender: 'Female',
      maritalStatus: 'Married',
      contact: '9876543210',
      address: '204, North Anna Salai, Chennai',
      dob: '23/07/1989',
      profilePic: 'https://placehold.co/96x96/DBEAFE/3B82F6?text=AC',
      lastUpdated: '1 week ago',
      isAdmin: false
    },
    {
      id: 3,
      name: 'Canon Curry',
      relation: 'Son',
      age: 8,
      gender: 'Male',
      maritalStatus: 'Single',
      contact: 'N/A',
      address: '204, North Anna Salai, Chennai',
      dob: '02/05/2015',
      profilePic: 'https://placehold.co/96x96/DCFCE7/22C55E?text=CC',
      lastUpdated: '3 days ago',
      isAdmin: false
    },
    {
      id: 4,
      name: 'Dell Curry',
      relation: 'Father',
      age: 60,
      gender: 'Male',
      maritalStatus: 'Married',
      contact: '8765432109',
      address: '105, Old Village Road, Madurai',
      dob: '12/12/1958',
      profilePic: 'https://placehold.co/96x96/FEF3C7/F59E0B?text=DC',
      lastUpdated: '1 month ago',
      isAdmin: true
    },
    {
      id: 5,
      name: 'Sonya Curry',
      relation: 'Mother',
      age: 60,
      gender: 'Female',
      maritalStatus: 'Married',
      contact: '7654321098',
      address: '105, Old Village Road, Madurai',
      dob: '05/08/1963',
      profilePic: 'https://placehold.co/96x96/FFE4E6/EC4899?text=SC',
      lastUpdated: '2 weeks ago',
      isAdmin: false
    },
    { id: '6', name: 'Seth Curry', relation: 'Brother', age: 33, contact: '9988776655', email: 'seth.c@example.com', profilePic: 'https://placehold.co/96x96/D1FAE5/10B981?text=SC', isAdmin: false, lastUpdated: '1 day ago' },
    { id: '7', name: 'Sydel Curry', relation: 'Sister', age: 29, contact: '4433221100', email: 'sydel.c@example.com', profilePic: 'https://placehold.co/96x96/E0F2F2/06B6D4?text=SC', isAdmin: false, lastUpdated: '5 days ago' },
  ]);

  const filteredMembers = familyMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.relation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.contact && member.contact.includes(searchTerm));
    return matchesSearch;
  });

  const handleAddMember = () => navigate('/family-member/add');
  const handleViewMember = (id) => {
    console.log(`Navigating to view member details for ID: ${id}`);
    alert(`View details for member ID: ${id}`);
    // navigate(`/family-member/${id}`);
  };
  const handleEditMember = (id, e) => {
    e.stopPropagation();
    console.log(`Navigating to edit member with ID: ${id}`);
    alert(`Edit member with ID: ${id}`);
    // navigate(`/family-member/edit/${id}`);
  };
  const handleDeleteMember = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this family member?')) {
      setFamilyMembers(prev => prev.filter(member => member.id !== id));
      alert(`Member with ID: ${id} deleted.`);
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaUserFriends className="mr-3 text-primary-800" />
                Family Members
              </h1>
              <p className="text-gray-500 mt-2">
                Manage your family tree and member details
              </p>
            </div>
            <button
              onClick={handleAddMember}
              className="flex items-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FiPlus className="mr-2 text-lg" />
              <span className="font-medium">Add Member</span>
            </button>
          </div>
        </div>

        {/* Search Section (Redesigned) */}
        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 p-4 rounded-xl shadow-sm mb-8 border border-gray-100 flex items-center space-x-3">
          {/* Search Icon outside the input */}
          <FiSearch className="text-gray-500 text-xl flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, relation, or contact..."
            className="flex-grow pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Members Grid/List */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filteredMembers.map((member) => (
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
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <FaUserFriends className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No family members found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No results for your search. Try a different term.' : 'Start by adding your first family member!'}
            </p>
            <button
              onClick={handleAddMember}
              className="mx-auto flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors"
            >
              <FiPlus className="mr-2" />
              Add Family Member
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FamilyMemberListing;
