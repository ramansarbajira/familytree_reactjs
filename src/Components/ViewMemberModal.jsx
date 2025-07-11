import React, { useMemo } from 'react';
import { FiX, FiMail, FiPhone, FiUser, FiCalendar, FiGlobe, FiMapPin, FiHeart, FiBookOpen, FiSmile, FiThumbsUp, FiThumbsDown, FiHome, FiUsers, FiUserCheck, FiUserPlus } from 'react-icons/fi';

const ViewFamilyMemberModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  const normalized = useMemo(() => {
    const profile = member.raw?.userProfile || member || {};
    const roleMap = { 1: 'Member', 2: 'Admin', 3: 'Superadmin' };

    // Handle childrenNames parsing
    let parsedChildren = [];
    const childrenRaw = profile.childrenNames;

    if (typeof childrenRaw === 'string') {
      try {
        parsedChildren = JSON.parse(childrenRaw);
      } catch {
        parsedChildren = childrenRaw.split(',').map((c) => c.trim());
      }
    } else if (Array.isArray(childrenRaw)) {
      parsedChildren = childrenRaw;
    }

    return {
      fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'N/A',
      email: member.email || profile.email || 'N/A',
      countryCode: member.countryCode || '',
      mobile: member.mobile || profile.contactNumber || 'N/A',
      profileImage: profile.profile || member.profileUrl || 'https://placehold.co/96x96/e2e8f0/64748b?text=👤',
      gender: profile.gender || 'N/A',
      dob: profile.dob || null,
      maritalStatus: profile.maritalStatus || 'N/A',
      marriageDate: profile.marriageDate || null,
      spouseName: profile.spouseName || 'N/A',
      childrenNames: parsedChildren,
      childrenCount: parsedChildren.length,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-0 relative overflow-y-auto max-h-[92vh] glassy-menu" style={{ border: '2.5px solid #e0f3dd', boxShadow: '0 12px 32px rgba(63,152,44,0.18)' }}>
        {/* Gradient Header */}
        <div style={{ background: 'linear-gradient(90deg, #3f982c 0%, #38f9d7 100%)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '32px 0 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <img
            src={normalized.profileImage}
            alt={normalized.fullName}
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            style={{ boxShadow: '0 4px 16px rgba(63,152,44,0.18)' }}
          />
          <button
            onClick={onClose}
            className="bg-unset absolute top-5 right-6 text-white hover:text-gray-200"
            style={{ fontSize: 28 }}
          >
            <FiX size={28} />
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: -16, marginBottom: 18 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#222', marginBottom: 2 }}>{normalized.fullName}</h2>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#3f982c', background: '#e0f3dd', borderRadius: 8, padding: '2px 12px', marginRight: 8 }}>{normalized.roleName}</span>
        </div>
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Detail icon={<FiMail />} label="Email" value={normalized.email} />
            <Detail icon={<FiPhone />} label="Contact Number" value={`${normalized.countryCode} ${normalized.mobile}`} />
            <Detail icon={<FiUser />} label="Gender" value={normalized.gender} />
            <Detail icon={<FiCalendar />} label="Date of Birth" value={formatDate(normalized.dob)} />
            <Detail icon={<FiCalendar />} label="Age" value={calculateAge(normalized.dob)} />
            <Detail icon={<FiGlobe />} label="Religion" value={normalized.religion} />
            <Detail icon={<FiGlobe />} label="Language" value={normalized.language} />
            <Detail icon={<FiBookOpen />} label="Caste" value={normalized.caste} />
            <Detail icon={<FiBookOpen />} label="Gothram" value={normalized.gothram} />
            <Detail icon={<FiBookOpen />} label="Kuladevata" value={normalized.kuladevata} />
            <Detail icon={<FiMapPin />} label="Region" value={normalized.region} />
            <Detail icon={<FiHome />} label="Address" value={normalized.address} />
            <Detail icon={<FiHeart />} label="Marital Status" value={normalized.maritalStatus} />
            {normalized.maritalStatus === 'Married' && (
              <>
                <Detail icon={<FiCalendar />} label="Marriage Date" value={formatDate(normalized.marriageDate)} />
                <Detail icon={<FiUserCheck />} label="Spouse Name" value={normalized.spouseName} />
                <Detail icon={<FiUsers />} label="Children Count" value={normalized.childrenCount} />
                <Detail icon={<FiUserPlus />} label="Children Names" value={normalized.childrenNames.length > 0 ? normalized.childrenNames.join(', ') : 'N/A'} />
              </>
            )}
            <Detail icon={<FiUser />} label="Father's Name" value={normalized.fatherName} />
            <Detail icon={<FiUser />} label="Mother's Name" value={normalized.motherName} />
            <Detail icon={<FiSmile />} label="Hobbies" value={normalized.hobbies} />
            <Detail icon={<FiThumbsUp />} label="Likes" value={normalized.likes} />
            <Detail icon={<FiThumbsDown />} label="Dislikes" value={normalized.dislikes} />
            <Detail icon={<FiBookOpen />} label="Favorite Foods" value={normalized.favoriteFoods} />
            <Detail icon={<FiBookOpen />} label="Bio" value={normalized.bio} />
            <Detail icon={<FiCalendar />} label="Last Updated" value={formatDate(normalized.updatedAt)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', borderRadius: 10, padding: '10px 16px', marginBottom: 2, boxShadow: '0 1px 4px rgba(60,60,90,0.06)' }}>
    <span style={{ color: '#3f982c', fontSize: 18, flexShrink: 0 }}>{icon}</span>
    <div>
      <p style={{ fontSize: 13, color: '#888', margin: 0, fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#222', margin: 0 }}>{value || 'N/A'}</p>
    </div>
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
