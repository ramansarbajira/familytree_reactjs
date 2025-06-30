import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { FaBirthdayCake, FaPhone, FaHome, FaMale, FaFemale } from 'react-icons/fa';

const roleMapping = {
  1: 'Member',
  2: 'Admin',
  3: 'Superadmin',
};

const relationColors = {
  Member: 'bg-blue-100 text-blue-800',
  Admin: 'bg-purple-100 text-purple-800',
  Superadmin: 'bg-green-100 text-green-800',
};

const FamilyMemberCard = ({ familyCode, token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/family/member/${familyCode}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch members');
        const json = await res.json();
        const members = json.data.map((item) => ({
          id: item.id,
          userId: item.user.id,
          name: item.user.fullName,
          gender: item.user.userProfile?.gender || 'N/A',
          role: roleMapping[item.user.role] || 'Member',
          contact: item.user.mobile,
          address: item.user.address || '',
          dob: item.user.dob || '',
          profilePic: item.user.profileImage,
          isAdmin: item.user.role > 1,
          lastUpdated: new Date(item.updatedAt).toLocaleDateString('en-IN'),
        }));
        setFamilyMembers(members);
      } catch (err) {
        console.error('Error loading family members:', err);
      } finally {
        setLoading(false);
      }
    };

    if (familyCode && token) fetchMembers();
  }, [familyCode, token]);

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleViewMember = (id) => alert(`View details for member ID: ${id}`);
  const handleEditMember = (id, e) => {
    e.stopPropagation();
    alert(`Edit member with ID: ${id}`);
  };
  const handleDeleteMember = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this family member?')) {
      setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
    }
  };

  const filteredMembers = familyMembers.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SingleMemberCard = ({ member }) => (
    <div
      onClick={() => handleViewMember(member.id)}
      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-in-out group cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex items-start p-5 pb-0">
        <div className="relative flex-shrink-0 w-24 h-24 rounded-full overflow-hidden border-3 border-primary-200 shadow-lg">
          <img
            src={member.profilePic || 'https://placehold.co/96x96/e2e8f0/64748b?text=👤'}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/96x96/e2e8f0/64748b?text=👤';
            }}
          />
          {member.isAdmin && (
            <span className="absolute bottom-0 right-0 -mr-1 -mb-1 px-2 py-0.5 bg-primary-DEFAULT text-white text-xs font-bold rounded-full border-2 border-white shadow">
              Admin
            </span>
          )}
        </div>

        <div className="ml-4 flex-1 min-w-0">
          <h3 className="text-xl font-extrabold text-gray-900 truncate pr-2">{member.name}</h3>
          <span
            className={`mt-1 inline-block text-sm font-semibold px-3 py-1 rounded-full ${
              relationColors[member.role] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {member.role}
          </span>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <FaBirthdayCake className="mr-2 text-primary-500" size={16} />
            <span className="font-medium">{calculateAge(member.dob)} years old</span>
          </div>
          <div className="mt-1 flex items-center text-sm text-gray-600">
            {member.gender === 'Male' ? (
              <FaMale className="mr-2 text-blue-500" size={16} />
            ) : (
              <FaFemale className="mr-2 text-pink-500" size={16} />
            )}
            <span className="font-medium">{member.gender}</span>
          </div>
        </div>
      </div>

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

      <div className="flex justify-between items-center px-5 py-4">
        <span className="text-xs text-gray-500">Last updated: {member.lastUpdated}</span>
        <div className="flex space-x-2">
          <button
            onClick={(e) => handleEditMember(member.id, e)}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-colors tooltip"
            title="Edit Member"
          >
            <FiEdit2 size={18} />
          </button>
          <button
            onClick={(e) => handleDeleteMember(member.id, e)}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors tooltip"
            title="Delete Member"
          >
            <FiTrash2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewMember(member.id);
            }}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-colors tooltip"
            title="View Member"
          >
            <FiEye size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Search family members..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {loading ? (
        <div className="text-center text-gray-500">Loading members...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMembers.length ? (
            filteredMembers.map((member) => <SingleMemberCard key={member.id} member={member} />)
          ) : (
            <p className="text-center text-gray-500 col-span-full">No family members found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FamilyMemberCard;
