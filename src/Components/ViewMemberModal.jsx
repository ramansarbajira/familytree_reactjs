import React, { useMemo } from 'react';
import { FiX } from 'react-icons/fi';

const ViewFamilyMemberModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  const normalized = useMemo(() => {
    const profile = member.userProfile || {};
    const roleMap = { 1: 'Member', 2: 'Admin', 3: 'Superadmin' };

    return {
      fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'N/A',
      email: member.email || 'N/A',
      countryCode: member.countryCode || '',
      mobile: member.mobile || 'N/A',
      profileImage: profile.profile || 'https://placehold.co/96x96/e2e8f0/64748b?text=👤',
      gender: profile.gender || 'N/A',
      dob: profile.dob || null,
      maritalStatus: profile.maritalStatus || 'N/A',
      marriageDate: profile.marriageDate || null,
      spouseName: profile.spouseName || 'N/A',
      childrenNames: profile.childrenNames || 'N/A',
      childrenCount: Array.isArray(profile.childrenNames)
        ? profile.childrenNames.length
        : profile.childrenNames
        ? 1
        : 0,
      fatherName: profile.fatherName || 'N/A',
      motherName: profile.motherName || 'N/A',
      religion: profile.religionId || 'N/A',
      language: profile.languageId || 'N/A',
      caste: profile.caste || 'N/A',
      gothram: profile.gothramId || 'N/A',
      kuladevata: profile.kuladevata || 'N/A',
      region: profile.region || 'N/A',
      hobbies: profile.hobbies || 'N/A',
      likes: profile.likes || 'N/A',
      dislikes: profile.dislikes || 'N/A',
      favoriteFoods: profile.favoriteFoods || 'N/A',
      address: profile.address || 'N/A',
      bio: profile.bio || 'N/A',
      updatedAt: profile.updatedAt || member.updatedAt || null,
      roleName: roleMap[member.role] || 'Member',
    };
  }, [member]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="bg-unset absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FiX size={22} />
        </button>

        <div className="flex items-center space-x-5 mb-6">
          <img
            src={normalized.profileImage}
            alt={normalized.fullName}
            className="w-24 h-24 rounded-full object-cover border-2 border-primary-500"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{normalized.fullName}</h2>
            <p className="text-sm text-gray-600">{normalized.roleName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Detail label="Email" value={normalized.email} />
          <Detail
            label="Contact Number"
            value={`${normalized.countryCode} ${normalized.mobile}`}
          />
          <Detail label="Gender" value={normalized.gender} />
          <Detail label="Date of Birth" value={formatDate(normalized.dob)} />
          <Detail label="Age" value={calculateAge(normalized.dob)} />
          <Detail label="Religion" value={normalized.religion} />
          <Detail label="Language" value={normalized.language} />
          <Detail label="Caste" value={normalized.caste} />
          <Detail label="Gothram" value={normalized.gothram} />
          <Detail label="Kuladevata" value={normalized.kuladevata} />
          <Detail label="Region" value={normalized.region} />
          <Detail label="Address" value={normalized.address} />
          <Detail label="Marital Status" value={normalized.maritalStatus} />

          {normalized.maritalStatus === 'Married' && (
            <>
              <Detail label="Marriage Date" value={formatDate(normalized.marriageDate)} />
              <Detail label="Spouse Name" value={normalized.spouseName} />
              <Detail label="Children Count" value={normalized.childrenCount} />
              <Detail
                label="Children Names"
                value={
                  Array.isArray(normalized.childrenNames)
                    ? normalized.childrenNames.join(', ')
                    : normalized.childrenNames || 'N/A'
                }
              />
            </>
          )}

          <Detail label="Father's Name" value={normalized.fatherName} />
          <Detail label="Mother's Name" value={normalized.motherName} />
          <Detail label="Hobbies" value={normalized.hobbies} />
          <Detail label="Likes" value={normalized.likes} />
          <Detail label="Dislikes" value={normalized.dislikes} />
          <Detail label="Favorite Foods" value={normalized.favoriteFoods} />
          <Detail label="Bio" value={normalized.bio} />
          <Detail label="Last Updated" value={formatDate(normalized.updatedAt)} />
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base font-medium text-gray-800">{value || 'N/A'}</p>
  </div>
);

const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
};

export default ViewFamilyMemberModal;
