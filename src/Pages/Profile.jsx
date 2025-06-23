import React, { useRef, useState, useEffect } from 'react';
import { FaEdit } from "react-icons/fa";
import Layout from '../Components/Layout';
import ActionButtons from '../Components/ActionButtons';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


const Profile = () => {
  const navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState('profile'); // Set default tab

  const fileInputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // JWT Token and User ID states
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [apiError, setApiError] = useState(null);

  const [dropdownData, setDropdownData] = useState({
    languages: [],
    religions: [],
    gothrams: [],
    loading: true,
    error: null
  });

  const [profileData, setProfileData] = useState({
    // Basic Information
    profilePic: null,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    yourAge: '',
    gender: 'Male',
    maritalStatus: 'Single',
    spouseName: '',
    marriageDate: '',
    childrenCount: 0,
    childrensName: [],
    
    // Family Information
    fathersName: '',
    mothersName: '',
    motherTongueId: '',
    religionId: '',
    caste: '',
    gothramId: '',
    kuladevata: '',
    
    // Personal Preferences
    hobbies: '',
    likes: '',
    dislikes: '',
    favouriteFood: '',
    address: '',
    countryCode: '+91',
    contactNumber: '',
    
    // Bio & Family ID
    bio: '',
    familyCode: ''
  });

  // JWT Token decoding useEffect
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      setApiError('Authentication token not found. Please login again.');
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);
      setToken(storedToken);
      setUserId(decoded?.userId || decoded?.id || decoded?.sub);
    } catch (error) {
      setApiError('Invalid token. Please login again.');
    }
  }, []);

  // Function to fetch profile data from API
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await fetch('https://familytree-backend-trs6.onrender.com/user/myProfile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const result = await response.json();
      
      if (result.message === "Profile fetched successfully" && result.data) {
        const apiData = result.data.userProfile;
        
        // Parse children names from JSON string
        let childrenNames = [];
        let childrenCount = 0;
        
        if (apiData.childrenNames) {
          try {
            childrenNames = JSON.parse(apiData.childrenNames);
            childrenCount = childrenNames.length;
          } catch (e) {
            console.error('Error parsing children names:', e);
            childrenNames = [];
            childrenCount = 0;
          }
        }

        // Map API response to your form structure
        const mappedData = {
          profilePic: apiData.profile,
          firstName: apiData.firstName || '',
          lastName: apiData.lastName || '',
          dateOfBirth: apiData.dob ? new Date(apiData.dob).toISOString().split('T')[0] : '',
          yourAge: apiData.age || '',
          gender: apiData.gender || 'Male',
          maritalStatus: apiData.maritalStatus || 'Single',
          spouseName: apiData.spouseName || '',
          marriageDate: apiData.marriageDate ? new Date(apiData.marriageDate).toISOString().split('T')[0] : '',
          childrenCount: childrenCount,
          childrensName: childrenNames,
          
          // Family Information
          fathersName: apiData.fatherName || '',
          mothersName: apiData.motherName || '',
          motherTongueId: apiData.languageId || '',
          religionId: apiData.religionId || '',
          caste: apiData.caste || '',
          gothramId: apiData.gothramId || '',
          kuladevata: apiData.kuladevata || '',
          
          // Personal Preferences
          hobbies: apiData.hobbies || '',
          likes: apiData.likes || '',
          dislikes: apiData.dislikes || '',
          favouriteFood: apiData.favoriteFoods || '',
          address: apiData.address || '',
          countryCode: result.data.countryCode || '+91',
          contactNumber: apiData.contactNumber || result.data.mobile || '',
          
          // Bio & Family ID
          bio: apiData.bio || '',
          familyCode: apiData.familyCode || ''
        };

        setProfileData(mappedData);
        
        // Set profile image if available
        if (apiData.profile) {
          setImageUrl(apiData.profile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      setDropdownData(prev => ({ ...prev, loading: true, error: null }));

      const [languagesRes, religionsRes, gothramsRes] = await Promise.all([
        fetch('https://familytree-backend-trs6.onrender.com/language'),
        fetch('https://familytree-backend-trs6.onrender.com/religion'),
        fetch('https://familytree-backend-trs6.onrender.com/gothram')
      ]);

      if (!languagesRes.ok || !religionsRes.ok || !gothramsRes.ok) {
        throw new Error('Failed to fetch dropdown data');
      }

      const [languages, religions, gothrams] = await Promise.all([
        languagesRes.json(),
        religionsRes.json(),
        gothramsRes.json()
      ]);

      setDropdownData({
        languages: languages.filter(item => item.status === 1),
        religions: religions.filter(item => item.status === 1),
        gothrams: gothrams.filter(item => item.status === 1),
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setDropdownData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dropdown options. Please refresh the page.'
      }));
    }
  };

  // Initial data fetch - only when token and userId are available
  useEffect(() => {
    if (token && userId) {
      fetchProfileData();
      fetchDropdownData();
    }
  }, [token, userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImageUrl(imageURL);
      // The file is already stored in the input ref, so we can access it in handleSave
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    if (isNaN(birthDate.getTime())) return '';
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? age.toString() : '';
  };

  const [isEditing, setIsEditing] = useState({});

  const handleInputChange = (field, value) => {
    if (field === 'dateOfBirth') {
      const calculatedAge = calculateAge(value);
      
      setProfileData(prev => ({
        ...prev,
        [field]: value,
        yourAge: calculatedAge
      }));
    } 
    else if (field === 'countryCode') {
      setProfileData(prev => ({
        ...prev,
        countryCode: value
      }));
    }
    else if (field === 'childrenCount') {
      const count = parseInt(value) || 0;
      let updatedChildrenNames = [...profileData.childrensName]; // Keep existing names
      
      if (count === 0) {
        // Don't clear the array, just hide the inputs
        // Keep the names in state so they can be restored
        updatedChildrenNames = profileData.childrensName; // Preserve existing names
      } else if (count < profileData.childrensName.length) {
        // If reducing count, keep only the first 'count' names
        updatedChildrenNames = profileData.childrensName.slice(0, count);
      } else if (count > profileData.childrensName.length) {
        // If increasing count, add empty strings for new children
        updatedChildrenNames = [
          ...profileData.childrensName,
          ...Array(count - profileData.childrensName.length).fill('')
        ];
      }
      
      setProfileData(prev => ({
        ...prev,
        childrenCount: count,
        childrensName: updatedChildrenNames
      }));
    }
    else if (field.startsWith('childName-')) {
      const index = parseInt(field.split('-')[1]);
      const updatedChildrenNames = [...profileData.childrensName];
      updatedChildrenNames[index] = value;
      
      setProfileData(prev => ({
        ...prev,
        childrensName: updatedChildrenNames
      }));
    }
    else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const toggleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleBack = () => {
     navigate('/myprofile'); 
    console.log("Going back...");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Check if we have token and userId
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }
  
      // Prepare FormData for multipart/form-data request
      const formData = new FormData();
  
      // Add profile image if a new one was selected
      if (fileInputRef.current?.files[0]) {
        formData.append('profile', fileInputRef.current.files[0]);
      }
  
      // Basic Information
      formData.append('firstName', profileData.firstName || '');
      formData.append('lastName', profileData.lastName || '');
      formData.append('gender', profileData.gender || 'Male');
      formData.append('dob', profileData.dateOfBirth || '');
      formData.append('age', profileData.yourAge || '0');
      formData.append('maritalStatus', profileData.maritalStatus || 'Single');
      formData.append('marriageDate', profileData.marriageDate || '');
      formData.append('spouseName', profileData.spouseName || '');
      
      // Convert children names array to JSON string
      formData.append('childrenNames', JSON.stringify(profileData.childrensName || []));
      
      // Family Information - THESE WERE MISSING
      formData.append('fatherName', profileData.fathersName || '');
      formData.append('motherName', profileData.mothersName || '');
      formData.append('languageId', profileData.motherTongueId || ''); // This was missing
      formData.append('religionId', profileData.religionId || '');
      formData.append('caste', profileData.caste || ''); // This was missing
      formData.append('gothramId', profileData.gothramId || ''); // This was missing
      formData.append('kuladevata', profileData.kuladevata || ''); // This was missing
      
      // Personal Preferences
      formData.append('hobbies', profileData.hobbies || '');
      formData.append('likes', profileData.likes || '');
      formData.append('dislikes', profileData.dislikes || '');
      formData.append('favoriteFoods', profileData.favouriteFood || '');
      formData.append('address', profileData.address || ''); // This was missing
      formData.append('contactNumber', profileData.contactNumber || '');
      formData.append('countryId', '101'); // Assuming India as default
      
      // Bio & Family Code - THESE WERE MISSING
      formData.append('bio', profileData.bio || ''); // This was missing
      formData.append('familyCode', profileData.familyCode || ''); // This was missing
  
      console.log('Saving profile data for user:', userId);
  
      const response = await fetch(`https://familytree-backend-trs6.onrender.com/user/profile/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      
      if (result.message === "Profile updated successfully" || result.success) {
        // Clear all edit states
        setIsEditing({});
        
        // Refresh the profile data to get the latest version
        await fetchProfileData();
        
        alert('Profile saved successfully!');
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
  
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message);
      alert(`Failed to save profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="mx-auto p-8 bg-white font-helvetica">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading profile...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="mx-auto p-8 bg-white font-helvetica">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-lg">{error}</div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mx-auto p-8 bg-white font-helvetica">
      {/* Header */}
       {/* First Location */}
       {/* Action Block */}
      <div className="hidden lg:block">
        <ActionButtons onSave={handleSave} onBack={handleBack} />
      </div>
      {/* Section 1: Basic Information */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">1. Your profile & basic information details.</h2>
            <p className="text-sm pl-8 text-gray-500">Tap the field to start editing the details</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col  gap-2">
            {/* Top title and edit icon */}
            <div className="flex gap-2 font-semibold">
              <span>Profile Pic</span>
              <FaEdit
                className="text-blue-500 cursor-pointer"
                onClick={() => fileInputRef.current.click()}
                title="Edit"
              />
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Circle profile image */}
            <div className="w-36 h-36 rounded-full overflow-hidden border shadow">
              <img
                src={
                  imageUrl ||
                  "/assets/unknown.svg" // default placeholder
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Fields below profile picture */}
          <div className="space-y-6">
            {/* Row 1: First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Row 2: Date of Birth and Your Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block text-sm font-semibold mb-2">
      Date of Birth <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        type="date"
        value={profileData.dateOfBirth}
        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        max={new Date().toISOString().split('T')[0]}
      />
    </div>
  </div>

  <div>
    <label className="block text-sm font-semibold mb-2">
      Your age <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={profileData.yourAge}
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
      placeholder="Age in years"
      readOnly
    />
  </div>
</div>

            {/* Row 3: Gender and Marital Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Gender</label>
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

              <div>
                <label className="block text-sm font-semibold mb-2">Marital Status</label>
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
            </div>

            {/* Row 4: Spouse Name and Children's Name (only show if married) */}
            {profileData.maritalStatus === 'Married' && (
  <>
    {/* Row 1: Spouse Name | Marriage Date */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold mb-2">Spouse Name</label>
        <input
          type="text"
          value={profileData.spouseName}
          onChange={(e) => handleInputChange('spouseName', e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Marriage Date</label>
        <input
          type="date"
          value={profileData.marriageDate || ''}
          onChange={(e) => handleInputChange('marriageDate', e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>

    {/* Row 2: Children Count | First Child Name (if count > 0) */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold mb-2">Number of Children</label>
        <input
          type="number"
          min="0"
          value={profileData.childrenCount}
          onChange={(e) => handleInputChange('childrenCount', e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {profileData.childrenCount > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2">Child 1 Name</label>
          <input
            type="text"
            value={profileData.childrensName[0] || ''}
            onChange={(e) => handleInputChange('childName-0', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>

    {/* Additional Children (2 per row) */}
    {profileData.childrenCount > 1 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {Array.from({ length: profileData.childrenCount - 1 }).map((_, index) => (
          <div key={index + 1}>
            <label className="block text-sm font-semibold mb-2">Child {index + 2} Name</label>
            <input
              type="text"
              value={profileData.childrensName[index + 1] || ''}
              onChange={(e) => handleInputChange(`childName-${index + 1}`, e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>
    )}
  </>
)}
          </div>
        </div>
      </div>

      {/* Section 2: Family Information */}
      <div className="mb-8 pt-6 pb-6">
        <div className="flex items-center space-x-2 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">2. Your family info & identity details.</h2>
            <p className="text-sm pl-8 text-gray-500">Tap the field to start editing the details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Row 1: Father's Name and Mother's Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Father's name</label>
              <input
                type="text"
                value={profileData.fathersName}
                onChange={(e) => handleInputChange('fathersName', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Mother's name</label>
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
    <label className="block text-sm font-semibold mb-2">Mother Tongue</label>
    {dropdownData.loading ? (
      <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" disabled>
        <option>Loading...</option>
      </select>
    ) : dropdownData.error ? (
      <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" disabled>
        <option>{dropdownData.error}</option>
      </select>
    ) : (
      <select
        value={profileData.motherTongueId}
        onChange={(e) => handleInputChange('motherTongueId', parseInt(e.target.value))}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select Mother Tongue</option>
        {dropdownData.languages.map((language) => (
          <option key={language.id} value={language.id}>
            {language.name}
          </option>
        ))}
      </select>
    )}
  </div>

  <div>
    <label className="block text-sm font-semibold mb-2">Religion</label>
    {dropdownData.loading ? (
      <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" disabled>
        <option>Loading...</option>
      </select>
    ) : dropdownData.error ? (
      <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" disabled>
        <option>{dropdownData.error}</option>
      </select>
    ) : (
      <select
        value={profileData.religionId}
        onChange={(e) => handleInputChange('religionId', parseInt(e.target.value))}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select Religion</option>
        {dropdownData.religions.map((religion) => (
          <option key={religion.id} value={religion.id}>
            {religion.name}
          </option>
        ))}
      </select>
    )}
  </div>
          </div>

          {/* Row 3: Caste and Gothram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Caste</label>
              <input
                type="text"
                value={profileData.caste}
                onChange={(e) => handleInputChange('caste', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
    <label className="block text-sm font-semibold mb-2">Gothram</label>
    {dropdownData.loading ? (
      <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" disabled>
        <option>Loading...</option>
      </select>
    ) : dropdownData.error ? (
      <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" disabled>
        <option>{dropdownData.error}</option>
      </select>
    ) : (
      <select
        value={profileData.gothramId}
        onChange={(e) => handleInputChange('gothramId', parseInt(e.target.value))}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select Gothram</option>
        {dropdownData.gothrams.map((gothram) => (
          <option key={gothram.id} value={gothram.id}>
            {gothram.name}
          </option>
        ))}
      </select>
    )}
  </div>
          </div>

          {/* Row 4: Kuladevata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Kuladevata</label>
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
      <div className="mb-8 pb-8">
  <div className="flex items-center space-x-2 mb-4">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">3. Your personal preferences & contact details.</h2>
      <p className="text-sm pl-8 text-gray-500">Tap the field to start editing the details</p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Hobbies */}
    <div>
      <label className="block text-sm font-semibold mb-2">Hobbies</label>
      <input
        type="text"
        value={profileData.hobbies}
        onChange={(e) => handleInputChange('hobbies', e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Likes */}
    <div>
      <label className="block text-sm font-semibold mb-2">Likes</label>
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
      <label className="block text-sm font-semibold mb-2">Dislikes</label>
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
      <label className="block text-sm font-semibold mb-2">Favourite food</label>
      <input
        type="text"
        value={profileData.favouriteFood}
        onChange={(e) => handleInputChange('favouriteFood', e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Address */}
    <div>
      <label className="block text-sm font-semibold mb-2">Your address</label>
      <input
        type="text"
        value={profileData.address}
        onChange={(e) => handleInputChange('address', e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Contact Number - Now same size as other boxes */}
    <div>
      <label className="block text-sm font-semibold mb-2">Contact number</label>
      <PhoneInput
    international
    defaultCountry="IN"
    value={profileData.contactNumber}
    onChange={(value) => handleInputChange('contactNumber', value)}
    // className="w-full" // Wrapper div class (keep simple)
    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    countrySelectProps={{
      className: "text-sm py-2.5"
    }}
    placeholder="Enter phone number"
  />
    </div>
  </div>
</div>

      {/* Section 4: Bio & Family ID */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">4. Your Bio & family ID.</h2>
            <p className="text-sm pl-8 text-gray-500">Tap the field to start editing the details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2">Bio</label>
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
            <label className="block text-sm font-semibold mb-2">Family code/Root ID</label>
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
       {/* Action Block */}
      <ActionButtons onSave={handleSave} onBack={handleBack} />
    </div>
    </Layout>
  );
};

export default Profile;
