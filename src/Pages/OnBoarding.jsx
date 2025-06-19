import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaUsers, FaEnvelope, FaInfoCircle, FaCloudUploadAlt } from 'react-icons/fa';
import AuthLogo from '../Components/AuthLogo';
import FamilyCodeAutocomplete  from '../Components/SuggestFamily';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const OnBoarding = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Refs for form fields
  const fieldRefs = {
    firstName: useRef(null),
    lastName: useRef(null),
    dob: useRef(null),
    gender: useRef(null),
    fatherName: useRef(null),
    motherName: useRef(null),
    motherTongue: useRef(null),
    contactNumber: useRef(null),
    address: useRef(null)
  };

  
  const [errors, setErrors] = useState({});
  const [userLoading, setUserLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    age: 0,
    gender: '',
    maritalStatus: '',
    spouseName: '',
    marriageDate: '', // Added marriage date
    childrenCount: 0,
    profile: null,
    fatherName: '',
    motherName: '',
    motherTongue: 0,
    religionId: 0,
    caste: '',
    gothram: 0,
    kuladevata: '',
    hobbies: '',
    likes: '',
    dislikes: '',
    favoriteFoods: '',
    address: '',
    contactNumber: '',
    bio: '',
    familyCode: ''
  });

  const [dropdownData, setDropdownData] = useState({
    languages: [],
    religions: [],
    gothrams: [],
    loading: true,
    error: null
  });

  // Initialize token and user ID
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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    
    if (type === 'number' || ['childrenCount', 'motherTongue', 'religionId', 'gothram'].includes(name)) {
      processedValue = value === '' ? 0 : parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
      ...(name === 'dob' && { age: calculateAge(value) }) // Update age when DOB changes
    }));
  
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateCurrentSection = () => {
    const newErrors = {};

    if (activeSection === 'basic') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
        newErrors.firstName = 'First name should only contain letters';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
        newErrors.lastName = 'Last name should only contain letters';
      }

      if (!formData.dob.trim()) {
        newErrors.dob = 'Date of birth is required';
      } else {
        const today = new Date();
        const birthDate = new Date(formData.dob);
        if (birthDate >= today) {
          newErrors.dob = 'Date of birth must be in the past';
        }
      }

      if (!formData.gender.trim()) {
        newErrors.gender = 'Gender is required';
      }

      // Marriage date validation if married
      if (formData.maritalStatus === 'Married') {
        if (!formData.marriageDate.trim()) {
          newErrors.marriageDate = 'Marriage date is required';
        } else {
          const today = new Date();
          const marriageDate = new Date(formData.marriageDate);
          if (marriageDate >= today) {
            newErrors.marriageDate = 'Marriage date must be in the past';
          }
          
          // Validate marriage date is after birth date
          if (formData.dob) {
            const birthDate = new Date(formData.dob);
            if (marriageDate <= birthDate) {
              newErrors.marriageDate = 'Marriage date must be after birth date';
            }
          }
        }
      }
    }

    if (activeSection === 'family') {
      if (!formData.fatherName.trim()) {
        newErrors.fatherName = 'Father\'s name is required';
      }
      if (!formData.motherName.trim()) {
        newErrors.motherName = 'Mother\'s name is required';
      }
      if (!formData.motherTongue || formData.motherTongue === 0) {
        newErrors.motherTongue = 'Mother tongue is required';
      }
    }

    if (activeSection === 'contact') {
      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = 'Contact number is required';
      } else if (formData.contactNumber.length < 10) {
        newErrors.contactNumber = 'Please enter a valid contact number';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    }

    setErrors(newErrors);

    // Focus on first error field
    const firstError = Object.keys(newErrors)[0];
    if (firstError && fieldRefs[firstError]?.current) {
      fieldRefs[firstError].current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const goToPrevious = () => {
    if (!isFirst) {
      const prevSection = sections[currentIndex - 1];
      setActiveSection(prevSection.id);
      setErrors({});
    }
  };

  const goToNext = () => {
    if (validateCurrentSection() && !isLast) {
      const nextSection = sections[currentIndex + 1];
      setActiveSection(nextSection.id);
    }
  };

  const handleSave = async () => {
    if (!validateCurrentSection()) return;
    setIsSaving(true);
    
    setIsSubmitting(true);
    setApiError('');
    setApiSuccess('');
  
    try {
      if (!userId || !token) {
        setApiError('Authentication required. Please login again.');
        return;
      }
  
      const formDataToSend = new FormData();

      for (const key in formData) {
        if (
          formData[key] !== undefined &&
          formData[key] !== null &&
          key !== 'childrenNames' &&
          !key.startsWith('childName') &&
          key !== 'profile'
        ) {
          formDataToSend.append(key, formData[key]);
        }
      }

      // Append parsed numbers
      formDataToSend.set('childrenCount', parseInt(formData.childrenCount) || '0');
      formDataToSend.set('languageId', parseInt(formData.motherTongue) || '');
      formDataToSend.set('religionId', parseInt(formData.religionId) || '');
      formDataToSend.set('gothramId', parseInt(formData.gothram) || '');

      // Add childrenNames array (as comma-separated string, like in CURL)
      if (formData.maritalStatus === 'Married' && formData.childrenCount > 0) {
        const childrenNames = [];
        for (let i = 0; i < formData.childrenCount; i++) {
          if (formData[`childName${i}`]) {
            childrenNames.push(formData[`childName${i}`]);
          }
        }

        if (childrenNames.length > 0) {
          formDataToSend.append('childrenNames', JSON.stringify(childrenNames));
        }
      }

      // Add profile image if needed
      if (formData.profile instanceof File) {
        formDataToSend.append('profile', formData.profile); 
      }
      
      if(formData.familyCode == '' || formData.familyCode == null){
        formDataToSend.delete('familyCode');
      }
      formDataToSend.delete('motherTongue');
      formDataToSend.delete('gothram');
      formDataToSend.delete('childrenCount');
      formDataToSend.delete('profileUrl');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile/update/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
  
      setApiSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setApiError(error.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsSaving(false);
    }
  };

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setDropdownData(prev => ({ ...prev, loading: true, error: null }));

        const endpoints = [
          `${import.meta.env.VITE_API_BASE_URL}`+'/language',
          `${import.meta.env.VITE_API_BASE_URL}`+'/religion',
          `${import.meta.env.VITE_API_BASE_URL}`+'/gothram'
        ];

        const responses = await Promise.all(endpoints.map(url => fetch(url)));
        const data = await Promise.all(responses.map(res => res.json()));

        setDropdownData({
          languages: data[0].filter(item => item.status === 1),
          religions: data[1].filter(item => item.status === 1),
          gothrams: data[2].filter(item => item.status === 1),
          loading: false,
          error: null
        });
      } catch (error) {
        setDropdownData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dropdown options'
        }));
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId || !token) return;
      
      try {
        setUserLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user details');
        
         const jsonData = await response.json();

        const { userProfile } = jsonData.data;

        const childrenArray = userProfile.childrenNames
          ? JSON.parse(userProfile.childrenNames)
          : [];

        setFormData(prev => {
          const childFields = {};
          childrenArray.forEach((name, index) => {
            childFields[`childName${index}`] = name;
          });

          return {
            ...prev,
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            dob: userProfile.dob ? userProfile.dob.split('T')[0] : '',
            age: calculateAge(userProfile.dob) || 0,
            gender: userProfile.gender || '',
            maritalStatus: userProfile.maritalStatus || '',
            marriageDate: userProfile.marriageDate ? userProfile.marriageDate.split('T')[0] : '',
            spouseName: userProfile.spouseName || '',
            childrenCount: childrenArray.length || 0,
            ...childFields,
            fatherName: userProfile.fatherName || '',
            motherName: userProfile.motherName || '',
            motherTongue: userProfile.languageId ? parseInt(userProfile.languageId) : 0,
            religionId: userProfile.religionId ? parseInt(userProfile.religionId) : 0,
            caste: userProfile.caste || '',
            gothram: userProfile.gothramId ? parseInt(userProfile.gothramId) : 0,
            kuladevata: userProfile.kuladevata || '',
            hobbies: userProfile.hobbies || '',
            likes: userProfile.likes || '',
            dislikes: userProfile.dislikes || '',
            favoriteFoods: userProfile.favoriteFoods || '',
            address: userProfile.address || '',
            contactNumber: userProfile.contactNumber || '',
            bio: userProfile.bio || '',
            profileUrl: userProfile.profile || '',
            familyCode: userProfile.familyCode || ''
          };
        });
        // Parse response body

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, token]);

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
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
      {userLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="text-white text-lg font-semibold">Loading...</div>
          {/* You can replace this with a spinner animation if you have one */}
        </div>
      )}
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
                  ref={fieldRefs.fatherName}
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
                  ref={fieldRefs.motherName}
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
                ref={fieldRefs.motherTongue}
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
                name="religionId"
                value={formData.religionId || ''}
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
                {(formData.profile || formData.profileUrl) ? (
                  <>
                    <img
                      src={
                        formData.profile
                          ? URL.createObjectURL(formData.profile)
                          : formData.profileUrl
                      }
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />

                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full">
                      <label className="text-white text-xs font-medium cursor-pointer mb-2 hover:text-blue-300 transition-colors">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              profile: e.target.files[0],
                              profileUrl: '', // clear server image once new is selected
                            }))
                          }
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profile: null,
                            profileUrl: '',
                          }))
                        }
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
    ref={fieldRefs.firstName}
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
    ref={fieldRefs.lastName}
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
                  ref={fieldRefs.dob}
                  type="date"
                  name="dob"
                  value={formData.dob || ''}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 border rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 ${
                    errors.dob
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-[var(--color-primary)]'
                  }`}
                />
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
              </div>

              {/* Age (Auto-calculated) */}
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
  <input
    type="number"
    value={calculateAge(formData.dob) || ''}
    readOnly
    placeholder="Age will be calculated automatically"
    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
  />
</div>


              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  ref={fieldRefs.gender}
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

              {/* Spouse Name */}
              {formData.maritalStatus === 'Married' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marriage Date</label>
                  <input
                    type="date"
                    name="marriageDate"
                    value={formData.marriageDate || ''}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    placeholder="Select marriage date"
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
                    onChange={(e) => {
                      const newCount = parseInt(e.target.value || '0');
                      setFormData((prev) => {
                        const updated = { ...prev, childrenCount: newCount };

                        for (let i = 0; i < newCount; i++) {
                          if (prev[`childName${i}`]) {
                            updated[`childName${i}`] = prev[`childName${i}`];
                          } else {
                            updated[`childName${i}`] = ''; // initialize if not present
                          }
                        }
                        for (let i = newCount; i < 20; i++) {
                          if (updated.hasOwnProperty(`childName${i}`)) {
                            delete updated[`childName${i}`];
                          }
                        }
                        return updated;
                      });
                    }}
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
      {/* Contact number */}
      <div className="">
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
              ref: fieldRefs.contactNumber
            }}
            specialLabel=""
            disableSearchIcon={true}
            containerStyle={{
              width: '100%'
            }}
            inputStyle={{
              width: '100%',
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
          name="favoriteFoods"
          value={formData.favoriteFoods}
          onChange={handleChange}
          placeholder="Biryani"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {/* Enter address */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Enter address</label>
        <input
          ref={fieldRefs.address}
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
      <FamilyCodeAutocomplete formData={formData} setFormData={setFormData} />
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
          {!isLast && (
            <button
              className="text-sm text-gray-600 hover:text-black bg-unset"
              onClick={goToNext}
            >
              Skip
            </button>
          )}
          {isLast ? (
            <button
              className="px-6 py-2 rounded-md text-white text-sm bg-primary flex items-center justify-center gap-2 min-w-[80px]"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Save'
              )}
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