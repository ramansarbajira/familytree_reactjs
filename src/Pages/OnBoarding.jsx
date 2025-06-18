import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaUsers, FaEnvelope, FaInfoCircle, FaCloudUploadAlt } from 'react-icons/fa';
import AuthLogo from '../Components/AuthLogo';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { jwtDecode } from 'jwt-decode';

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

  // Add refs for focusing on error fields
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const dobRef = useRef(null);
  const genderRef = useRef(null);
  const fatherNameRef = useRef(null);
  const motherNameRef = useRef(null);
  const motherTongueRef = useRef(null);
  const contactNumberRef = useRef(null);
  const addressRef = useRef(null);

  // Add errors state
  const [errors, setErrors] = useState({});
  const [userLoading, setUserLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: 0, // Changed to number
    gender: '',
    maritalStatus: '',
    spouseName: '',
    childrenCount: 0, // Changed to number
    profile: null,
    fatherName: '',
    motherName: '',
    motherTongue: 0, // Changed to number (dropdown ID)
    religion: 0, // Changed to number (dropdown ID)
    caste: '',
    gothram: 0, // Changed to number (dropdown ID)
    kuladevata: '',
    hobbies: '',
    likes: '',
    dislikes: '',
    favoriteFood: '',
    address: '',
    contactNumber: '',
    bio: '',
    familyCode: 'FAM-8927'
  });

  // New state for API data
  const [dropdownData, setDropdownData] = useState({
    languages: [],
    religions: [],
    gothrams: [],
    loading: true,
    error: null
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    
    // Handle number inputs
    if (type === 'number' || ['childrenCount', 'motherTongue', 'religion', 'gothram'].includes(name)) {
      processedValue = value === '' ? 0 : parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  
    // Clear error for this field when user starts typing
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Validation function for each section
  const validateCurrentSection = () => {
    const newErrors = {};

    if (activeSection === 'basic') {

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name should only contain letters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name should only contain letters';
    }

      // Date of Birth validation
      if (!formData.dateOfBirth.trim()) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const today = new Date();
        const birthDate = new Date(formData.dateOfBirth);
        if (birthDate >= today) {
          newErrors.dateOfBirth = 'Date of birth must be in the past';
        }
      }

      // Gender validation
      if (!formData.gender.trim()) {
        newErrors.gender = 'Gender is required';
      }
    }

    if (activeSection === 'family') {
      // Father's name validation
      if (!formData.fatherName.trim()) {
        newErrors.fatherName = 'Father\'s name is required';
      }

      // Mother's name validation
      if (!formData.motherName.trim()) {
        newErrors.motherName = 'Mother\'s name is required';
      }

      // Mother tongue validation
      if (!formData.motherTongue || formData.motherTongue === 0) {
        newErrors.motherTongue = 'Mother tongue is required';
      }
    }

    if (activeSection === 'contact') {
      // Contact number validation
      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = 'Contact number is required';
      } else if (formData.contactNumber.length < 10) {
        newErrors.contactNumber = 'Please enter a valid contact number';
      }

      // Address validation
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    }

    setErrors(newErrors);

    // Focus on first error field
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.keys(newErrors)[0];
      const refMap = {
        firstName: firstNameRef,
        lastName: lastNameRef,
        dateOfBirth: dobRef,
        gender: genderRef,
        fatherName: fatherNameRef,
        motherName: motherNameRef,
        motherTongue: motherTongueRef,
        contactNumber: contactNumberRef,
        address: addressRef
      };

      if (refMap[firstError]?.current) {
        refMap[firstError].current.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const goToPrevious = () => {
    if (!isFirst) {
      const prevSection = sections[currentIndex - 1];
      setActiveSection(prevSection.id);
      setErrors({}); // Clear errors when navigating
    }
  };

  const goToNext = () => {
    // Validate current section before moving to next
    if (validateCurrentSection()) {
      if (!isLast) {
        const nextSection = sections[currentIndex + 1];
        setActiveSection(nextSection.id);
      }
    }
  };

  const handleSave = async () => {
    if (!validateCurrentSection()) {
      return;
    }
  
    setIsSubmitting(true);
    setApiError('');
    setApiSuccess('');
  
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setApiError('Authentication token not found. Please login again.');
        return;
      }
  
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId || decodedToken.id || decodedToken.sub;
      
      if (!userId) {
        setApiError('Invalid authentication token. Please login again.');
        return;
      }
  
      // Prepare JSON payload with proper data types
      const jsonPayload = {
        profile: formData.profile || '',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || '',
        maritalStatus: formData.maritalStatus || '',
        spouseName: formData.spouseName || '',
        childrenCount: parseInt(formData.childrenCount) || 0,
        fatherName: formData.fatherName || '',
        motherName: formData.motherName || '',
        motherTongue: parseInt(formData.motherTongue) || null,
        religion: parseInt(formData.religion) || null,
        caste: formData.caste || '',
        gothram: parseInt(formData.gothram) || null,
        kuladevata: formData.kuladevata || '',
        hobbies: formData.hobbies || '',
        likes: formData.likes || '',
        dislikes: formData.dislikes || '',
        favoriteFood: formData.favoriteFood || '',
        address: formData.address || '',
        contactNumber: formData.contactNumber || '',
        bio: formData.bio || '',
        familyCode: formData.familyCode || 'FAM-8927'
      };
  
      // Add children names if they exist
      if (formData.maritalStatus === 'Married' && parseInt(formData.childrenCount) > 0) {
        const childrenNames = [];
        for (let i = 0; i < parseInt(formData.childrenCount); i++) {
          if (formData[`childName${i}`]) {
            childrenNames.push(formData[`childName${i}`]);
          }
        }
        if (childrenNames.length > 0) {
          jsonPayload.childrenNames = childrenNames;
        }
      }
  
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonPayload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.message || 'Failed to update profile. Please try again.');
        return;
      }
  
      const data = await response.json();
      setApiSuccess('Profile updated successfully!');
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
  
    } catch (error) {
      console.error('Error updating profile:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // API calls
  useEffect(() => {
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

    fetchDropdownData();
  }, []);
  

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setUserLoading(true);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No access token found');
          setUserLoading(false);
          return;
        }
  
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId || decodedToken.id || decodedToken.sub;
        
        if (!userId) {
          console.error('No user ID found in token');
          setUserLoading(false);
          return;
        }
  
        const response = await fetch(`https://familytree-backend-trs6.onrender.com/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
  
        const userData = await response.json();
        
        // Update formData with proper data types
        setFormData(prev => ({
          ...prev,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          maritalStatus: userData.maritalStatus || '',
          spouseName: userData.spouseName || '',
          childrenCount: userData.childrenCount ? parseInt(userData.childrenCount) : 0,
          fatherName: userData.fatherName || '',
          motherName: userData.motherName || '',
          motherTongue: userData.motherTongue ? parseInt(userData.motherTongue) : 0,
          religion: userData.religion ? parseInt(userData.religion) : 0,
          caste: userData.caste || '',
          gothram: userData.gothram ? parseInt(userData.gothram) : 0,
          kuladevata: userData.kuladevata || '',
          hobbies: userData.hobbies || '',
          likes: userData.likes || '',
          dislikes: userData.dislikes || '',
          favoriteFood: userData.favoriteFood || '',
          address: userData.address || '',
          contactNumber: userData.contactNumber || '',
          bio: userData.bio || ''
        }));
  
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setUserLoading(false);
      }
    };
  
    fetchUserDetails();
  }, []);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0; // Return 0 instead of empty string
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
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
             <div className="mb-8 text-center">
              <h1 className="text-xl font-semibold text-gray-800 mb-2">Fill in fields to update family and identity</h1>
              <p className="text-sm text-gray-600">This helps us maintain correct personal information!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's name</label>
                <input
                  ref={fatherNameRef}
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Enter father name"
                  className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 ${
                    errors.fatherName
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-[var(--color-primary)]'
                  }`}
                />
                {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's name</label>
                <input
                  ref={motherNameRef}
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  placeholder="Enter mother name"
                  className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 ${
                    errors.motherName
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-[var(--color-primary)]'
                  }`}
                />
                {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother Tongue</label>
              <select
                ref={motherTongueRef}
                name="motherTongue"
                value={formData.motherTongue || ''}
                onChange={handleChange}
                disabled={dropdownData.loading}
                className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.motherTongue
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-[var(--color-primary)]'
                }`}
              >
                <option value="">Select Mother Tongue</option>
                {dropdownData.languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
              {errors.motherTongue && <p className="text-red-500 text-xs mt-1">{errors.motherTongue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
              <select
                name="religion"
                value={formData.religion || ''}
                onChange={handleChange}
                disabled={dropdownData.loading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Religion</option>
                {dropdownData.religions.map((religion) => (
                  <option key={religion.id} value={religion.id}>
                    {religion.name}
                  </option>
                ))}
              </select>
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

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gothram</label>
              <select
                name="gothram"
                value={formData.gothram || ''}
                onChange={handleChange}
                disabled={dropdownData.loading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Gothram</option>
                {dropdownData.gothrams.map((gothram) => (
                  <option key={gothram.id} value={gothram.id}>
                    {gothram.name}
                  </option>
                ))}
              </select>
            </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kuladevata</label>
                <input
                  type="text"
                  name="kuladevata"
                  value={formData.kuladevata || ''}
                  onChange={handleChange}
                  placeholder="Enter Kuladevata"
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
    {formData.profile ? (
      <>
        <img
          src={URL.createObjectURL(formData.profile)}
          alt="Preview"
          className="w-full h-full object-cover rounded-full"
        />
        
        {/* Change and Remove options overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full">
          
          {/* Change option */}
          <label className="text-white text-xs font-medium cursor-pointer mb-2 hover:text-blue-300 transition-colors">
            Change
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  profile: e.target.files[0],
                }))
              }
              className="hidden"
            />
          </label>
          
          {/* Remove option */}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, profile: null }))}
            className="text-white text-xs font-medium hover:text-red-300 transition-colors"
          >
            Remove
          </button>
          
        </div>
      </>
    ) : (
      <label className="flex flex-col items-center justify-center text-gray-500 cursor-pointer w-full h-full">
        <FaCloudUploadAlt className="text-2xl mb-1" />
        <span className="text-xs text-center w-full">Upload your profile photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              profile: e.target.files[0],
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
    ref={firstNameRef}
    type="text"
    name="firstName"
    value={formData.firstName || ''}
    onChange={handleChange}
    placeholder="Enter your first name"
    className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 ${
      errors.firstName
        ? 'border-red-500 focus:ring-red-300'
        : 'border-gray-300 focus:ring-[var(--color-primary)]'
    }`}
  />
  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
</div>

{/* Lastname */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
  <input
    ref={lastNameRef}
    type="text"
    name="lastName"
    value={formData.lastName || ''}
    onChange={handleChange}
    placeholder="Enter your last name"
    className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 ${
      errors.lastName
        ? 'border-red-500 focus:ring-red-300'
        : 'border-gray-300 focus:ring-[var(--color-primary)]'
    }`}
  />
  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
</div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  ref={dobRef}
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 ${
                    errors.dateOfBirth
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-[var(--color-primary)]'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>

              {/* Age (Auto-calculated) */}
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
  <input
    type="number"
    value={calculateAge(formData.dateOfBirth) || ''}
    readOnly
    placeholder="Age will be calculated automatically"
    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
  />
</div>


              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  ref={genderRef}
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 ${
                    errors.gender
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-[var(--color-primary)]'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
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

{activeSection === 'contact' && (
  <div className="max-w-2xl mx-auto">
    <div className="mb-8 text-center">
      <h1 className="text-xl font-semibold text-gray-800 mb-2">Fill in fields to update Personal Preferences & Contact</h1>
      <p className="text-sm text-gray-600">This helps us maintain correct personal information!</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Your hobbies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your hobbies</label>
        <input
          type="text"
          name="hobbies"
          value={formData.hobbies}
          onChange={handleChange}
          placeholder="Playing football"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {/* Likes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
        <input
          type="text"
          name="likes"
          value={formData.likes}
          onChange={handleChange}
          placeholder="Watching movies in theatre"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {/* Dislikes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dislikes</label>
        <input
          type="text"
          name="dislikes"
          value={formData.dislikes}
          onChange={handleChange}
          placeholder="Loud music"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {/* Favourite food */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Favourite food</label>
        <input
          type="text"
          name="favoriteFood"
          value={formData.favoriteFood}
          onChange={handleChange}
          placeholder="Biryani"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {/* Enter address */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Enter address</label>
        <input
          ref={addressRef}
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="204, North Anna Salai, Chennai"
          className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 ${
            errors.address
              ? 'border-red-500 focus:ring-red-300'
              : 'border-gray-300 focus:ring-[var(--color-primary)]'
          }`}
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

{/* Contact number */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">Contact number</label>
  <div className="max-w-sm">
    <PhoneInput
      country={'in'}
      value={formData.contactNumber}
      onChange={(phone) => {
        setFormData(prev => ({ ...prev, contactNumber: phone }));
        // Clear error when user starts typing
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.contactNumber;
          return newErrors;
        });
      }}
      inputProps={{
        name: 'contactNumber',
        required: true,
        placeholder: '8122345789',
        ref: contactNumberRef
      }}
      disableSearchIcon={true}
      containerStyle={{
        width: '100%'
      }}
      inputStyle={{
        width: '70%',
        height: '44px',
        fontSize: '14px',
        paddingLeft: '60px',
        border: `1px solid ${errors.contactNumber ? '#ef4444' : '#d1d5db'}`,
        borderLeft: 'none',
        borderRadius: '0 6px 6px 0',
        outline: 'none',
        boxShadow: errors.contactNumber ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none'
      }}
      buttonStyle={{
        border: `1px solid ${errors.contactNumber ? '#ef4444' : '#d1d5db'}`,
        borderRight: 'none',
        borderRadius: '6px 0 0 6px',
        backgroundColor: 'white',
        width: '48px',
        height: '44px'
      }}
      dropdownStyle={{
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 50
      }}
    />
    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
  </div>
</div>
    </div>
  </div>
)}

{activeSection === 'bio' && (
  <div className="max-w-2xl mx-auto">
    <div className="mb-8 text-center">
      <h1 className="text-xl font-semibold text-gray-800 mb-2">Fill in fields to update Bio</h1>
      <p className="text-sm text-gray-600">This helps us maintain correct personal information!</p>
    </div>
    
    <div className="space-y-6">
      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          placeholder="Share a short story from your life — a moment, a lesson, or a memory you'd like future generations to remember."
          rows="4"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
        />
      </div>

      {/* Family code/Root ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Family code/Root ID</label>
        <div className="max-w-xs">
          <input
            type="text"
            name="familyCode"
            value={formData.familyCode || 'FAM-8927'}
            onChange={handleChange}
            placeholder="FAM-8927"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 text-gray-600"
            readOnly
          />
        </div>
      </div>
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