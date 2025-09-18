import React, { useState, useEffect, useRef } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Swal from 'sweetalert2';

const ProfileFormPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    countryCode: '+91',
    password: '',
    status: '1',
    role: '1',
    firstName: '',
    lastName: '',
    profileImageUrl: '',
    gender: '',
    dob: '',
    address: '',
    maritalStatus: '',
    marriageDate: '',
    spouseName: '',
    childrenCount: 0,
    childrenNames: [],
    fatherName: '',
    motherName: '',
    familyCode: '',
    religionId: '',
    languageId: '',
    caste: '',
    gothramId: '',
    kuladevata: '',
    region: '',
    hobbies: '',
    likes: '',
    dislikes: '',
    favoriteFoods: '',
    bio: '',
    age: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const firstErrorRef = useRef(null);
  const errorRef = useRef(null);

  // New states for member validation and data fetching
  const [isValidatingMember, setIsValidatingMember] = useState(true);
  const [memberValidationError, setMemberValidationError] = useState(null);
  const [isAuthorizedMember, setIsAuthorizedMember] = useState(false);
  const [currentMemberData, setCurrentMemberData] = useState(null);
  const [isLinkUsed, setIsLinkUsed] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // State for dropdown data
  const [dropdownData, setDropdownData] = useState({
    languages: [],
    religions: [],
    gothrams: [],
    loading: true,
    error: null
  });

  // Get URL parameters
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const familyCode = urlParams.get('familyCode');
    const memberId = urlParams.get('memberId');
    return { familyCode, memberId };
  };

  // Validate member and fetch family data
  const validateMemberAccess = async () => {
    try {
      setIsValidatingMember(true);
      setMemberValidationError(null);

      const { familyCode, memberId } = getUrlParams();

      if (!familyCode || !memberId) {
        throw new Error('Missing family code or member ID in URL');
      }

      // Simple validation call
      const response = await fetch(`${baseUrl}/family/member/public/${familyCode}/member/${memberId}/exists`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Member validation failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.data?.exists) {
        // Check if link is already used
        if (result.data?.isLinkUsed) {
          setIsLinkUsed(true);
          throw new Error('This invitation link has already been used and is no longer valid.');
        }
        
        setIsAuthorizedMember(true);
        setCurrentMemberData({ memberId: parseInt(memberId), familyCode });
        // Set familyCode in form
        setFormData(prev => ({ ...prev, familyCode }));
      } else {
        throw new Error('Member not authorized');
      }

    } catch (error) {
      console.error('Member validation failed:', error);
      setMemberValidationError(error.message);
      setIsAuthorizedMember(false);
    } finally {
      setIsValidatingMember(false);
    }
  };

  // Populate form with existing member data
  const populateFormWithMemberData = (memberData) => {
    const user = memberData.user;
    const userProfile = user.userProfile;

    setFormData(prevData => ({
      ...prevData,
      email: user.email || '',
      mobile: user.mobile || '',
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      profileImageUrl: user.profileImage || userProfile?.profile || '',
      gender: userProfile?.gender || '',
      dob: userProfile?.dob || '',
      address: userProfile?.address || '',
      familyCode: memberData.familyCode || '',
      // Add other fields as they become available in the API response
    }));
  };

  // Enhanced fetchDropdownData function with error handling
  const fetchDropdownData = async () => {
    try {
      setDropdownData(prev => ({ ...prev, loading: true, error: null }));

      // Use environment variable instead of hardcoded localhost
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

      const endpoints = [
        `${baseUrl}/language`,
        `${baseUrl}/religion`, 
        `${baseUrl}/gothram`
      ];

      const responses = await Promise.all(
        endpoints.map(url => fetch(url).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
          return res.json();
        }))
      );

      // Extract data based on your API structure - handle both .data and direct response
      const languages = responses[0]?.data || responses[0] || [];
      const religions = responses[1]?.data || responses[1] || [];
      const gothrams = responses[2]?.data || responses[2] || [];

      setDropdownData({
        languages,
        religions,
        gothrams,
        loading: false,
        error: null
      });

      console.log('Dropdown data loaded:', { 
        languages: languages.length, 
        religions: religions.length, 
        gothrams: gothrams.length 
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setDropdownData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dropdown options'
      }));
    }
  };

  // Form validation function
  const validate = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    if (!formData.dob.trim()) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      if (birthDate >= today) {
        newErrors.dob = 'Date of birth must be in the past';
      }
    }
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';

    if (formData.maritalStatus === 'Married') {
      if (!formData.marriageDate) newErrors.marriageDate = 'Marriage date is required for married individuals';
      if (!formData.spouseName.trim()) newErrors.spouseName = 'Spouse name is required for married individuals';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstErrorFieldName = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorFieldName}"], [id="${firstErrorFieldName}"]`);
      if (errorElement) {
        firstErrorRef.current = errorElement;
      }
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value || ''
    }));

    // Clear errors for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setApiError('');
  };

  const handleMobileChange = (value, data) => {
    const dialCode = `+${data.dialCode}`;
    const fullNumber = value.replace(/\D/g, '');
    const mobile = fullNumber.startsWith(data.dialCode)
      ? fullNumber.slice(data.dialCode.length)
      : fullNumber;

    setFormData(prev => ({
      ...prev,
      mobile: mobile || '',
      countryCode: dialCode
    }));

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.mobile;
      return newErrors;
    });
    setApiError('');
  };

  const getFullMobile = (countryCode, mobile) => {
    return `${countryCode.replace('+', '')}${mobile || ''}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) {
      if (firstErrorRef.current) {
        firstErrorRef.current.focus();
      }
      return;
    }

    setIsLoading(true);

    const allowedFields = [
      'profile',
      'firstName',
      'lastName',
      'gender',
      'dob',
      'age',
      'maritalStatus',
      'marriageDate',
      'spouseName',
      'childrenNames',
      'fatherName',
      'motherName',
      'religionId',
      'languageId',
      'caste',
      'gothramId',
      'kuladevata',
      'region',
      'hobbies',
      'likes',
      'dislikes',
      'favoriteFoods',
      'countryId',
      'address',
      'bio',
      'familyCode',
      'email',
      'mobile',
      'countryCode',
      'password',
      'role',
      'status',
    ];

    const formDataToSend = new FormData();

    // Append allowed fields
    allowedFields.forEach((field) => {
      const value = formData[field];

      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        if (
          ['religionId', 'languageId', 'gothramId', 'countryId', 'age', 'status', 'role'].includes(field)
        ) {
          formDataToSend.append(field, parseInt(value));
        } else if (field === 'childrenNames' && Array.isArray(value)) {
          formDataToSend.append(field, JSON.stringify(value));
        } else {
          formDataToSend.append(field, value);
        }
      }
    });

    if (selectedImageFile instanceof File) {
      formDataToSend.append('profile', selectedImageFile);
    }

    try {
      const { memberId } = getUrlParams();
      
      if (!memberId) {
        setApiError('Member ID not found. Please refresh the page and try again.');
        setIsLoading(false);
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const apiUrl = `${baseUrl}/user/profile/update/public/${memberId}`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Operation failed. Please try again.';
        setApiError(errorMessage);
        return;
      }

      const resultData = await response.json();
      
      // Mark the link as used after successful save
      try {
        const { familyCode, memberId } = getUrlParams();
        await fetch(`${baseUrl}/family/member/public/${familyCode}/member/${memberId}/mark-used`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (linkError) {
        console.warn('Failed to mark link as used:', linkError);
        // Don't fail the whole operation if this fails
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully. This invitation link is now invalid.',
        confirmButtonColor: '#3f982c',
      }).then(() => {
        // Clear the URL parameters to prevent back button issues
        window.history.replaceState({}, document.title, window.location.pathname);
        window.history.back();
      });
      
    } catch (error) {
      const errorMessage = 'Network error or server unreachable. Please try again.';
      setApiError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again!',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial setup - validate member and fetch dropdown data
  useEffect(() => {
    validateMemberAccess();
    fetchDropdownData();
  }, []);

  // Auto-calculate age when DOB changes
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      const ageString = calculatedAge.toString();
      if (formData.age !== ageString) {
        setFormData(prevData => ({
          ...prevData,
          age: ageString
        }));
      }
    } else if (formData.age !== '') {
      setFormData(prevData => ({
        ...prevData,
        age: ''
      }));
    }
  }, [formData.dob]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, or GIF)');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviewUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Show loading state while validating member
  if (isValidatingMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Validating Member Access</h2>
            <p className="text-gray-600 text-sm">Please wait while we verify your permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if member validation failed
  if (memberValidationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-4">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isLinkUsed ? 'bg-orange-100' : 'bg-red-100'
            }`}>
              <svg className={`w-6 h-6 ${
                isLinkUsed ? 'text-orange-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isLinkUsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                )}
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {isLinkUsed ? 'Link Already Used' : 'Access Denied'}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{memberValidationError}</p>
            {isLinkUsed ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-orange-700 text-xs">
                  This invitation link has been used and is no longer valid. If you need to update your profile again, please contact your family administrator.
                </p>
              </div>
            ) : null}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.history.back()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Go Back
              </button>
              {!isLinkUsed && (
                <button
                  onClick={validateMemberAccess}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only render the form if member is authorized
  if (!isAuthorizedMember) {
    return null;
  }

  const title = `Edit Profile - ${currentMemberData?.user?.fullName || 'Member'}`;
  const submitButtonText = isLoading ? 'Processing...' : 'Save Changes';

  const inputClassName = (fieldName) => `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-sm font-inter text-gray-800 placeholder-gray-400 ${
    errors[fieldName] ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }`;

  const sectionClassName = "bg-white p-6 rounded-lg space-y-4 border border-gray-200 shadow-sm";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-inter">
      <div className="max-w-4xl mx-auto">
        {/* Header with member info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
              <p className="text-gray-600 mt-1">
                Family Code: <span className="font-medium">{currentMemberData?.familyCode}</span> | 
                Member ID: <span className="font-medium">{currentMemberData?.memberId}</span>
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="bg-unset px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Back
            </button>
          </div>
          <p className="text-gray-600 mt-2">Update your profile information below</p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div 
            ref={errorRef}
            tabIndex="-1"
            className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded border border-red-300 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-red-500"
            role="alert"
            aria-live="polite"
          >
            <span>{apiError}</span>
            <button 
              onClick={() => setApiError('')} 
              className="bg-unset text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              aria-label="Close error message"
            >
              &times;
            </button>
          </div>
        )}

        {/* Show error message if dropdown data failed to load */}
        {dropdownData.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-red-700 text-sm">
                Error loading dropdown options: {dropdownData.error}
              </p>
              <button
                onClick={fetchDropdownData}
                className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className={sectionClassName}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm flex items-center justify-center bg-gray-100">
                  {imagePreviewUrl || formData.profileImageUrl ? (
                    <img
                      src={imagePreviewUrl || formData.profileImageUrl}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label
                  htmlFor="profile"
                  className="absolute inset-0 bg-black bg-opacity-30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white text-sm font-medium">Change Photo</span>
                </label>
              </div>
              <div className="flex-1 w-full">
                <label htmlFor="profile" className={labelClassName}>
                  Upload New Image
                </label>
                <input
                  id="profile"
                  name="profile"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700 file:cursor-pointer"
                />
                <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF (Max. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className={sectionClassName}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className={labelClassName}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClassName('email')}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="mobile" className={labelClassName}>
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  inputClass={errors.mobile ? 'border border-red-500 focus:border-red-500' : 'border border-gray-300'}
                  country={'in'}
                  value={getFullMobile(formData.countryCode || '+91', formData.mobile || '')}
                  onChange={(value, data) => handleMobileChange(value, data)}
                  inputProps={{
                    name: 'mobile',
                    required: true,
                    id: 'mobile',
                  }}
                  containerStyle={{ width: '100%' }}
                  inputStyle={{
                    width: '100%',
                    height: '42px',
                    fontSize: '14px',
                    paddingLeft: '48px',
                    border: `1px solid ${errors.mobile ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '8px',
                  }}
                  buttonStyle={{
                    border: `1px solid ${errors.mobile ? '#ef4444' : '#d1d5db'}`,
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                    backgroundColor: 'white',
                  }}
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>
              
              <div className="relative">
                <label htmlFor="password" className={labelClassName}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={inputClassName('password') + ' pr-12'}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 transition-colors p-0 bg-transparent border-0"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className={sectionClassName}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClassName}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClassName('firstName')}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className={labelClassName}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClassName('lastName')}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label htmlFor="gender" className={labelClassName}>
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClassName('gender')}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label htmlFor="dob" className={labelClassName}>
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`${inputClassName('dob')} pr-10`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {formData.dob && (
                    <div className="absolute inset-y-0 right-8 flex items-center pr-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, dob: '' }));
                          if (errors.dob) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.dob;
                              return newErrors;
                            });
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {formData.dob && (
                  <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Selected: {new Date(formData.dob).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
              </div>
              <div>
                <label htmlFor="age" className={labelClassName}>
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="text"
                  value={formData.age}
                  readOnly
                  className={`${inputClassName('age')} bg-gray-100 cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className={sectionClassName}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="address" className={labelClassName}>
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClassName('address')}
                  placeholder="Full address"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Family Information Section */}
          <div className={sectionClassName}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="maritalStatus" className={labelClassName}>
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className={inputClassName('maritalStatus')}
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>}
              </div>
              
              {formData.maritalStatus === 'Married' && (
                <>
                  <div>
                    <label htmlFor="marriageDate" className={labelClassName}>
                      Marriage Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="marriageDate"
                      name="marriageDate"
                      type="date"
                      value={formData.marriageDate}
                      onChange={handleChange}
                      className={inputClassName('marriageDate')}
                    />
                    {errors.marriageDate && <p className="text-red-500 text-xs mt-1">{errors.marriageDate}</p>}
                  </div>
                  <div>
                    <label htmlFor="spouseName" className={labelClassName}>
                      Spouse Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="spouseName"
                      name="spouseName"
                      type="text"
                      value={formData.spouseName}
                      onChange={handleChange}
                      className={inputClassName('spouseName')}
                      placeholder="Spouse's full name"
                    />
                    {errors.spouseName && <p className="text-red-500 text-xs mt-1">{errors.spouseName}</p>}
                  </div>
                  <div>
                    <label htmlFor="childrenCount" className={labelClassName}>
                      Number of Children
                    </label>
                    <input
                      type="number"
                      id="childrenCount"
                      name="childrenCount"
                      min="0"
                      value={formData.childrenCount}
                      onChange={(e) => {
                        const count = Math.max(0, parseInt(e.target.value) || 0);
                        setFormData(prev => ({
                          ...prev,
                          childrenCount: count,
                          childrenNames: Array(count).fill('').map((_, i) =>
                            prev.childrenNames && prev.childrenNames[i] ? prev.childrenNames[i] : ''
                          )
                        }));
                      }}
                      className={inputClassName('childrenCount')}
                    />
                  </div>
                  
                  {formData.childrenCount > 0 && (
                    <div className="md:col-span-2 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Children Names</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: formData.childrenCount }).map((_, index) => (
                          <div key={index}>
                            <label htmlFor={`child-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                              Child {index + 1}
                            </label>
                            <input
                              id={`child-${index}`}
                              type="text"
                              value={formData.childrenNames[index] || ''}
                              onChange={(e) => {
                                const newChildrenNames = [...formData.childrenNames];
                                newChildrenNames[index] = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  childrenNames: newChildrenNames
                                }));
                              }}
                              className={inputClassName(`child-${index}`)}
                              placeholder={`Child ${index + 1} name`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <label htmlFor="fatherName" className={labelClassName}>
                  Father's Name
                </label>
                <input
                  id="fatherName"
                  name="fatherName"
                  type="text"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className={inputClassName('fatherName')}
                  placeholder="Father's name"
                />
              </div>
              <div>
                <label htmlFor="motherName" className={labelClassName}>
                  Mother's Name
                </label>
                <input
                  id="motherName"
                  name="motherName"
                  type="text"
                  value={formData.motherName}
                  onChange={handleChange}
                  className={inputClassName('motherName')}
                  placeholder="Mother's name"
                />
              </div>
              <div>
                <label htmlFor="familyCode" className={labelClassName}>
                  Family Code
                </label>
                <input
                  id="familyCode"
                  name="familyCode"
                  type="text"
                  value={formData.familyCode}
                  onChange={handleChange}
                  className={`${inputClassName('familyCode')} bg-gray-100 cursor-not-allowed`}
                  placeholder="FAM000123"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Cultural & Background Section */}
          <div className={sectionClassName}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cultural & Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="religionId" className={labelClassName}>
                  Religion
                </label>
                <select
                  id="religionId"
                  name="religionId"
                  value={formData.religionId || ''}
                  onChange={handleChange}
                  className={inputClassName('religionId')}
                  disabled={dropdownData.loading}
                >
                  <option value="">Select Religion</option>
                  {dropdownData.religions.map(religion => (
                    <option key={religion.id} value={String(religion.id)}>
                      {religion.name}
                    </option>
                  ))}
                </select>
                {dropdownData.loading && (
                  <p className="text-xs text-gray-500 mt-1">Loading religions...</p>
                )}
              </div>

              <div>
                <label htmlFor="languageId" className={labelClassName}>
                  Language
                </label>
                <select
                  id="languageId"
                  name="languageId"
                  value={formData.languageId || ''}
                  onChange={handleChange}
                  className={inputClassName('languageId')}
                  disabled={dropdownData.loading}
                >
                  <option value="">Select Language</option>
                  {dropdownData.languages.map(language => (
                    <option key={language.id} value={String(language.id)}>
                      {language.name}
                    </option>
                  ))}
                </select>
                {dropdownData.loading && (
                  <p className="text-xs text-gray-500 mt-1">Loading languages...</p>
                )}
              </div>

              <div>
                <label htmlFor="caste" className={labelClassName}>
                  Caste
                </label>
                <input
                  id="caste"
                  name="caste"
                  type="text"
                  value={formData.caste || ''}
                  onChange={handleChange}
                  className={inputClassName('caste')}
                  placeholder="Enter caste"
                />
              </div>

              <div>
                <label htmlFor="gothramId" className={labelClassName}>
                  Gothram
                </label>
                <select
                  id="gothramId"
                  name="gothramId"
                  value={formData.gothramId || ''}
                  onChange={handleChange}
                  className={inputClassName('gothramId')}
                  disabled={dropdownData.loading}
                >
                  <option value="">Select Gothram</option>
                  {dropdownData.gothrams.map(gothram => (
                    <option key={gothram.id} value={String(gothram.id)}>
                      {gothram.name}
                    </option>
                  ))}
                </select>
                {dropdownData.loading && (
                  <p className="text-xs text-gray-500 mt-1">Loading gothrams...</p>
                )}
              </div>

              <div>
                <label htmlFor="kuladevata" className={labelClassName}>
                  Kuladevata
                </label>
                <input
                  id="kuladevata"
                  name="kuladevata"
                  type="text"
                  value={formData.kuladevata || ''}
                  onChange={handleChange}
                  className={inputClassName('kuladevata')}
                  placeholder="Family deity"
                />
              </div>
              <div>
                <label htmlFor="region" className={labelClassName}>
                  Region
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  value={formData.region || ''}
                  onChange={handleChange}
                  className={inputClassName('region')}
                  placeholder="e.g., South Tamil Nadu"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className={sectionClassName}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="bio" className={labelClassName}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className={inputClassName('bio')}
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              </div>
              <div>
                <label htmlFor="hobbies" className={labelClassName}>
                  Hobbies
                </label>
                <textarea
                  id="hobbies"
                  name="hobbies"
                  value={formData.hobbies}
                  onChange={handleChange}
                  className={inputClassName('hobbies')}
                  placeholder="e.g., Reading, Traveling"
                  rows="2"
                />
              </div>
              <div>
                <label htmlFor="favoriteFoods" className={labelClassName}>
                  Favorite Foods
                </label>
                <textarea
                  id="favoriteFoods"
                  name="favoriteFoods"
                  value={formData.favoriteFoods}
                  onChange={handleChange}
                  className={inputClassName('favoriteFoods')}
                  placeholder="e.g., Dosa, Biryani"
                  rows="2"
                />
              </div>
              <div>
                <label htmlFor="likes" className={labelClassName}>
                  Likes
                </label>
                <textarea
                  id="likes"
                  name="likes"
                  value={formData.likes}
                  onChange={handleChange}
                  className={inputClassName('likes')}
                  placeholder="Things you like"
                  rows="2"
                />
              </div>
              <div>
                <label htmlFor="dislikes" className={labelClassName}>
                  Dislikes
                </label>
                <textarea
                  id="dislikes"
                  name="dislikes"
                  value={formData.dislikes}
                  onChange={handleChange}
                  className={inputClassName('dislikes')}
                  placeholder="Things you dislike"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 bg-white p-6 rounded-lg shadow-sm">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-unset px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileFormPage;