import React, { useState } from 'react';
import { FaUser, FaUsers, FaEnvelope, FaInfoCircle, FaCloudUploadAlt } from 'react-icons/fa';
import AuthLogo from '../Components/AuthLogo';
const OnBoarding = () => {
   const sections = [
    { id: 'basic', title: 'Basic Information', icon: <FaUser className="mr-3" />, description: 'General information about you' },
    { id: 'family', title: 'Family and Identity', icon: <FaUsers className="mr-3" />, description: 'Share a bit about your background' },
    { id: 'contact', title: 'Personal Preferences & Contact', icon: <FaEnvelope className="mr-3" />, description: 'How you like to be reached and what you prefer' },
    { id: 'bio', title: 'Bio & System-Generated Info', icon: <FaInfoCircle className="mr-3" />, description: 'Basic info about you and system updates' }
  ];

  const [activeSection, setActiveSection] = useState('basic');
  const currentIndex = sections.findIndex((sec) => sec.id === activeSection);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === sections.length - 1;

  const goToPrevious = () => {
    if (!isFirst) {
      const prevSection = sections[currentIndex - 1];
      setActiveSection(prevSection.id);
    }
  };

  const goToNext = () => {
    if (!isLast) {
      const nextSection = sections[currentIndex + 1];
      setActiveSection(nextSection.id);
    }
  };

  const handleSave = () => {
    // Submit the final form
    console.log('Saving final form...');
  };
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    maritalStatus: '',
    spouseName: '',
    childrenCount: '',
    profileImage: null,
    fatherName: '',
    motherName: '',
    religion: '',
    caste: '',
    gothram: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
      
      {/* Left - Tracking (40%) */}
      <div className="hidden lg:block w-[35%] border-r shadow-lg shadow-blue-100 z-10 p-6">
        
        <div className="flex flex-col h-full">
          {/* Logo */}
        <div className="flex mb-7">
          <AuthLogo className="w-18 h-18" />
        </div>
  <nav className="space-y-10 relative">
    {sections.map((section, index) => {
      const isActive = activeSection === section.id;
      const isCompleted = sections.findIndex(s => s.id === activeSection) > index;

      const textColor = isActive || isCompleted ? 'text-black' : 'text-[rgb(135,138,145)]';
      const iconColor = isActive || isCompleted ? 'text-black' : 'text-[rgb(135,138,145)]';
      const lineColor = isActive || isCompleted ? 'bg-black' : 'bg-[rgb(135,138,145)]';

      return (
        <div key={section.id} className="relative pl-2">
          {/* Vertical line centered on icon */}
          {index !== sections.length - 1 && (
            <div
              className={`absolute top-10 left-[20px] h-[calc(100%+10px)] w-px ${lineColor}`}
            />
          )}

          <div className="flex items-center gap-4" onClick={() => setActiveSection(section.id)}>
            {/* Icon Box - stays centered */}
            <div className="w-10 h-10 flex items-center justify-center shadow-md rounded-md bg-white z-10">
              <div className={`text-lg ${iconColor}`}>{section.icon}</div>
            </div>

            {/* Text aligned left */}
            <div>
              <div className={`text-sm font-semibold ${textColor}`}>
                {section.title}
              </div>
              <p className="text-xs text-gray-500 leading-4">{section.description}</p>
            </div>
          </div>
        </div>
      );
    })}
  </nav>
</div>

      
      </div>

      {/* Right - Form Section (60%) */}
      <div className="w-full lg:w-[65%] p-6 sm:p-8 md:p-10">
        
        {/* Form Fields */}
        {activeSection === 'family' && (
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Enter father name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's name</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  placeholder="Enter mother name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  placeholder="Your religion"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                <input
                  type="text"
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                  placeholder="Enter your caste"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gothram</label>
                <input
                  type="text"
                  name="gothram"
                  value={formData.gothram}
                  onChange={handleChange}
                  placeholder="Enter gothram"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'basic' && (
          <div className="max-w-3xl mx-auto">
            {/* Header Section */}
            <div className="mb-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800">Let's begin! Fill out your name & basic information</h3>
              <p className="text-sm text-gray-600">Start by sharing a few quick details about yourself</p>
            </div>

            {/* Image Upload */}
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32 rounded-full border-2 border-gray-300 flex flex-col items-center justify-center overflow-hidden">
                {formData.profileImage ? (
                  <img
                    src={URL.createObjectURL(formData.profileImage)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <label className="flex flex-col items-center justify-center text-gray-500 cursor-pointer">
                    <FaCloudUploadAlt className="text-2xl mb-1" />
                    <span className="text-xs text-center w-full">Upload your profile photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          profileImage: e.target.files[0],
                        }))
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>


            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Firstname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Lastname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>

              {/* Spouse Name */}
              {formData.maritalStatus === 'Married' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                  <input
                    type="text"
                    name="spouseName"
                    value={formData.spouseName || ''}
                    onChange={handleChange}
                    placeholder="Enter spouse name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}

              {/* Children Count */}
              {formData.maritalStatus === 'Married' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Children Count</label>
                  <input
                    type="number"
                    name="childrenCount"
                    value={formData.childrenCount || ''}
                    onChange={handleChange}
                    placeholder="Enter number of children"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}

              {/* Children Name Inputs */}
              {formData.maritalStatus === 'Married' && parseInt(formData.childrenCount) > 0 && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: parseInt(formData.childrenCount) }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={`Child ${index + 1} Name`}
                      value={formData[`childName${index}`] || ''}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          [`childName${index}`]: e.target.value
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between border-t pt-6 items-center">
        {/* Back */}
        <button
          className={`bg-unset text-gray-600 hover:text-black text-sm flex items-center gap-1 ${isFirst ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
          onClick={goToPrevious}
          disabled={isFirst}
        >
          <span>&larr;</span> <span>Back</span>
        </button>

        {/* Right Side: Skip + Next/Save */}
        <div className="flex items-center gap-5">
          {/* Skip */}
          {!isLast && (
            <button
              className="text-sm text-gray-600 hover:text-black bg-unset"
              onClick={goToNext}
            >
              Skip
            </button>
          )}

          {/* Next or Save */}
          {isLast ? (
            <button
              className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm"
              onClick={handleSave}
            >
              Save
            </button>
          ) : (
            <button
              className="bg-unset text-sm flex items-center gap-1 text-primary px-6 py-2 rounded-md"
              onClick={goToNext}
            >
              <span>Next</span> <span>&rarr;</span>
            </button>
          )}
        </div>
      </div>

      </div>
    </div>
  </div>
);


};

export default OnBoarding;