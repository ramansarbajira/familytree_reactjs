import React, { useState } from 'react';

const ProfileInfo = () => {
  const [profileData, setProfileData] = useState({
    // Basic Information
    profilePic: null,
    yourName: 'Stephan Curry',
    dateOfBirth: '14/03/1988',
    yourAge: '36',
    gender: 'Male',
    maritalStatus: 'Married',
    spouseName: 'Ayesha',
    childrensName: 'Canon Curry',
    
    // Family Information
    fathersName: 'Murugesan',
    mothersName: 'Sowmya',
    motherTongue: 'Tamil',
    religion: 'Hindu',
    caste: 'Vellalar',
    gothram: 'Athri Maharishi',
    kuladevata: 'Mariamman',
    
    // Personal Preferences
    hobbies: 'Playing football',
    likes: 'Watching movies in theatre',
    dislikes: 'Loud noises',
    favouriteFood: 'Biryani',
    address: '204, North Anna Salai, Chennai',
    contactNumber: '8122345789',
    
    // Bio & Family ID
    bio: "No big plans, no wild dreams - just aiming for a simple life filled with good people, delicious food, and peaceful, honest moments. This page isn't about chasing trends or showing off. It's just bits and pieces from an ordinary journey, capturing the quiet joy in everyday life. ❤️ Here's to living slow, staying grounded, and making the most of each day as it comes.",
    familyCode: 'FAM-8927'
  });

  const [isEditing, setIsEditing] = useState({});

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving profile data:', profileData);
    // Reset editing states
    setIsEditing({});
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white font-helvetica shadow-lg rounded-lg">
      {/* Header */}
      <div className="flex justify-end mb-8">
  <div className="flex space-x-3">
    <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
      Back
    </button>

    <button 
      onClick={handleSave}
      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
    >
      Save changes
    </button>
  </div>
</div>

      {/* Section 1: Basic Information */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Your profile & basic information details.</h2>
            <p className="text-sm text-gray-500">Tap the field to start editing the details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex justify-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Profile Pic <span className="text-blue-500"></span>
              </label>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                  <img 
                    src="/api/placeholder/80/80" 
                   
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="bg-white text-black text-sm hover:underline">Change Photo</button>
              </div>
            </div>
          </div>

          {/* Fields below profile picture */}
          <div className="space-y-6">
            {/* Row 1: Your Name and Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.yourName}
                  onChange={(e) => handleInputChange('yourName', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="DD/MM/YYYY"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                </div>
              </div>
            </div>

            {/* Row 2: Your Age and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your age <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.yourAge}
                  onChange={(e) => handleInputChange('yourAge', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Age in years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Gender</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 3: Marital Status and Spouse Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                <select
                  value={profileData.maritalStatus}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              {/* Spouse Name - only show if married */}
              {profileData.maritalStatus === 'Married' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Name</label>
                  <input
                    type="text"
                    value={profileData.spouseName}
                    onChange={(e) => handleInputChange('spouseName', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Row 4: Children's Name (only show if married) */}
            {profileData.maritalStatus === 'Married' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Children's Name</label>
                  <input
                    type="text"
                    value={profileData.childrensName}
                    onChange={(e) => handleInputChange('childrensName', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div></div> {/* Empty div to maintain grid structure */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Family Information */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Your family info & identity details.</h2>
            <p className="text-sm text-gray-500">Tap the field to start editing the details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Row 1: Father's Name and Mother's Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Father's name</label>
              <input
                type="text"
                value={profileData.fathersName}
                onChange={(e) => handleInputChange('fathersName', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mother's name</label>
              <input
                type="text"
                value={profileData.mothersName}
                onChange={(e) => handleInputChange('mothersName', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 2: Mother Tongue and Religion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mother Tongue</label>
              <select
                value={profileData.motherTongue}
                onChange={(e) => handleInputChange('motherTongue', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Bengali">Bengali</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Religion</label>
              <select
                value={profileData.religion}
                onChange={(e) => handleInputChange('religion', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Hindu">Hindu</option>
                <option value="Islam">Islam</option>
                <option value="Christianity">Christianity</option>
                <option value="Buddhism">Buddhism</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 3: Caste and Gothram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Caste</label>
              <input
                type="text"
                value={profileData.caste}
                onChange={(e) => handleInputChange('caste', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gothram</label>
              <select
                value={profileData.gothram}
                onChange={(e) => handleInputChange('gothram', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Athri Maharishi">Athri Maharishi</option>
                <option value="Bharadwaja">Bharadwaja</option>
                <option value="Vishvamitra">Vishvamitra</option>
                <option value="Jamadagni">Jamadagni</option>
                <option value="Vashishta">Vashishta</option>
                <option value="Kashyapa">Kashyapa</option>
                <option value="Agastya">Agastya</option>
              </select>
            </div>
          </div>

          {/* Row 4: Kuladevata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kuladevata</label>
              <input
                type="text"
                value={profileData.kuladevata}
                onChange={(e) => handleInputChange('kuladevata', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your family deity"
              />
            </div>
            <div></div> {/* Empty div to maintain grid structure */}
          </div>
        </div>
      </div>

      {/* Section 3: Personal Preferences */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Your personal preferences & contact details.</h2>
            <p className="text-sm text-gray-500">Tap the field to start editing the details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hobbies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hobbies</label>
            <input
              type="text"
              value={profileData.hobbies}
              onChange={(e) => handleInputChange('hobbies', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Likes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Likes</label>
            <input
              type="text"
              value={profileData.likes}
              onChange={(e) => handleInputChange('likes', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What do you like?"
            />
          </div>

          {/* Dislikes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dislikes</label>
            <input
              type="text"
              value={profileData.dislikes}
              onChange={(e) => handleInputChange('dislikes', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What do you dislike?"
            />
          </div>

          {/* Favourite Food */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Favourite food</label>
            <input
              type="text"
              value={profileData.favouriteFood}
              onChange={(e) => handleInputChange('favouriteFood', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your address</label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Contact Number */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact number</label>
            <div className="flex">
              <select className="px-3 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50">
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <input
                type="tel"
                value={profileData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className="flex-1 px-3 py-2.5 border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Bio & Family ID */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Your Bio & family ID.</h2>
            <p className="text-sm text-gray-500">Tap the field to start editing the details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Family Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Family code/Root ID</label>
            <input
              type="text"
              value={profileData.familyCode}
              onChange={(e) => handleInputChange('familyCode', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter family code"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;