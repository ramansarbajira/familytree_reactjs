import React, { useState, useEffect, useRef } from 'react';
import PhoneInput from 'react-phone-input-2';
import Swal from 'sweetalert2';
import { UserProvider, useUser } from '../Contexts/UserContext';

const ProfileFormModal = ({ isOpen, onClose, onAddMember, onUpdateProfile, mode = 'add', memberData = {} }) => {
  const mobileRef = useRef(null);
  const { userInfo, userLoading } = useUser();
  
  // Define initial form data structure
  const initialFormData = {
    // Account Information
    email: '',
    mobile: '', // For login (separate from contact number)
    countryCode: '+91', // For login mobile
    password: '', // Only for user creation/password change
    status: '1', // Default to Active (1)
    role: '1', // Default to Member (1)
    
    // Personal Information
    firstName: '',
    lastName: '',
    profileImageUrl: '',
    profileImageFile: null,
    gender: '',
    dob: '',
    
    // Contact Information
    address: '',
    
    // Family Information
    maritalStatus: '',
    marriageDate: '',
    spouseName: '',
    childrenCount: 0,
    childrenNames: [],
    fatherName: '',
    motherName: '',
    familyCode: '',
    
    // Cultural Information
    religionId: '',
    languageId: '',
    caste: '',
    gothramId: '',
    kuladevata: '',
    region: '',
    
    // Additional Information
    hobbies: '',
    likes: '',
    dislikes: '',
    favoriteFoods: '',
    bio: '',
    
    // Calculated fields
    age: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const firstErrorRef = useRef(null);
  const lastMemberDataRef = useRef({});
  const hasInitializedForm = useRef(false);
  const [apiError, setApiError] = useState(null);
  const errorRef = useRef(null);

  // State for dropdown data
  const [dropdownData, setDropdownData] = useState({
    languages: [],
    religions: [],
    gothrams: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (apiError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [apiError]);

  // Effect to populate form data when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      if (!hasInitializedForm.current) {
        if (mode === 'edit-profile' || mode === 'edit-member') {
          const sourceDataRaw = mode === 'edit-profile' ? userInfo : memberData;

          if (!sourceDataRaw) return;
          console.log(sourceDataRaw);
          
          const sourceData = {
            ...sourceDataRaw,
            ...sourceDataRaw.userProfile, // Flatten userProfile
          };

          const currentMemberDataKey =
            sourceData?.email || sourceData?.id || JSON.stringify(sourceData);
          const lastProcessedKey =
            lastMemberDataRef.current?.email || lastMemberDataRef.current?.id || JSON.stringify(lastMemberDataRef.current);

          if (currentMemberDataKey !== lastProcessedKey) {
            // Handle children names
            let childrenNames = [];
            if (sourceData.childrenNames) {
              if (Array.isArray(sourceData.childrenNames)) {
                childrenNames = [...sourceData.childrenNames];
              } else if (typeof sourceData.childrenNames === 'string') {
                try {
                  childrenNames = JSON.parse(sourceData.childrenNames);
                } catch {
                  childrenNames = [];
                }
              }
            }
            
            // Parse contact number
            let countryCode = '+91';
            let mobile = '';

            if (sourceData.countryCode) {
              countryCode = sourceData.countryCode;
            }
            if (sourceData.mobile) {
              mobile = sourceData.mobile;
            }

            const newFormData = {
              ...initialFormData,
              ...sourceData,
              dob: sourceData.dob ? new Date(sourceData.dob).toISOString().split('T')[0] : '',
              marriageDate: sourceData.marriageDate
                ? new Date(sourceData.marriageDate).toISOString().split('T')[0]
                : '',
              childrenNames,
              childrenCount: sourceData.childrenCount || childrenNames.length,
              profileImageUrl: sourceData.profile || '',
              profileImageFile: null,
              familyCode: sourceData.familyCode || sourceData.familyMember?.familyCode || '',
              countryCode,
              mobile,
              status: sourceData.status ? String(sourceData.status) : '1',
              religionId: sourceData.religionId ? String(sourceData.religionId) : '',
              languageId: sourceData.languageId
                ? String(sourceData.languageId)
                : sourceData.motherTongue
                ? String(sourceData.motherTongue)
                : '',
              gothramId: sourceData.gothramId
                ? String(sourceData.gothramId)
                : sourceData.gothram
                ? String(sourceData.gothram)
                : '',
            };

            setFormData(newFormData);
            lastMemberDataRef.current = { ...sourceData };
            setErrors({});
            setApiError('');
            setShowPasswordField(false);
          }
        } else {
          setFormData(initialFormData);
          lastMemberDataRef.current = {};
          setErrors({});
          setApiError('');
          setShowPasswordField(true);
        }

        hasInitializedForm.current = true;
      }
    } else {
      // Reset on modal close
      hasInitializedForm.current = false;
    }
  }, [isOpen, mode, memberData, userInfo]);

  // Effect to calculate age based on DOB
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (formData.age !== age.toString()) {
        setFormData((prevData) => ({ ...prevData, age: age.toString() }));
      }
    } else if (formData.age !== '') {
      setFormData((prevData) => ({ ...prevData, age: '' }));
    }
  }, [formData.dob, formData.age]);

  // Enhanced fetchDropdownData function with error handling
  const fetchDropdownData = async () => {
    try {
      setDropdownData(prev => ({ ...prev, loading: true, error: null }));

      const endpoints = [
        `${import.meta.env.VITE_API_BASE_URL}/language`,
        `${import.meta.env.VITE_API_BASE_URL}/religion`,
        `${import.meta.env.VITE_API_BASE_URL}/gothram`
      ];

      const responses = await Promise.all(
        endpoints.map(url => fetch(url).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          return res.json();
        }))
      );

      // Extract data based on your API structure
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
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setDropdownData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dropdown options'
      }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};

    // Account Information Validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    
    if (mode === 'add' && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    // Personal Information Validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';


    // Family Information Validation
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setApiError('');
  };

  const handleMobileChange = (value, data, fieldName) => {
    const dialCode = `+${data.dialCode}`;
    const fullNumber = value.replace(/\D/g, '');
    const mobile = fullNumber.startsWith(data.dialCode)
      ? fullNumber.slice(data.dialCode.length)
      : fullNumber;

    setFormData(prev => ({
      ...prev,
      [fieldName]: mobile,
      countryCode: dialCode  // store as 'countryCode', not 'mobileCountryCode' or 'loginCountryCode'
    }));

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const getFullMobile = (countryCode, mobile) => {
    return `${countryCode.replace('+', '')}${mobile}`;
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        profileImageFile: file,
        profileImageUrl: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        profileImageFile: null,
        profileImageUrl: memberData.profileImage || '',
      }));
    }
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

    // Prepare childrenNames if needed
    if (formData.maritalStatus === 'Married' && formData.childrenCount > 0) {
      const childrenNames = [];
      for (let i = 0; i < formData.childrenCount; i++) {
        const name = formData[`childName${i}`];
        if (name) {
          childrenNames.push(name);
        }
      }
      if (childrenNames.length > 0) {
        formData.childrenNames = childrenNames;
      }
    }

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
    
    if (!formDataToSend.has('familyCode') && userInfo?.familyCode) {
      formDataToSend.append('familyCode', userInfo.familyCode);
    }

    if (formData.profileImageFile instanceof File) {
      formDataToSend.append('profile', formData.profileImageFile);
    } else {
      formDataToSend.delete('profile');
    }
    
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }


    let apiUrl = '';
    let httpMethod = '';

    if (mode === 'add') {
      apiUrl = `${import.meta.env.VITE_API_BASE_URL}/family/member/register-and-join-family`;
      httpMethod = 'POST';
    } else {
      const userId = memberData.id || userInfo?.userId || '';
      apiUrl = `${import.meta.env.VITE_API_BASE_URL}/user/profile/update/${userId}`;
      httpMethod = 'PUT';
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
     
      const response = await fetch(apiUrl, {
        method: httpMethod,
        body: formDataToSend,
        headers: headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.message || 'Operation failed. Please try again.');
        return;
      }

      const resultData = await response.json();
      if (mode === 'add' && onAddMember) {
        onAddMember(resultData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Family member created successfully.',
          confirmButtonColor: '#3f982c',
        });
      } else if (onUpdateProfile) {
        onUpdateProfile(resultData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile updated successfully.',
          confirmButtonColor: '#3f982c',
        });
      }
      onClose();
      
    } catch (error) {
      setApiError('Network error or server unreachable. Please try again.');
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

  if (!isOpen) return null;

  const title = mode === 'add' ? 'Add New Family Member' : (mode === 'edit-profile' ? 'Edit Your Profile' : 'Edit Family Member Profile');
  const submitButtonText = isLoading ? 'Processing...' : (mode === 'add' ? 'Add Member' : 'Save');

  const inputClassName = (fieldName) => `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-sm font-inter text-gray-800 placeholder-gray-400 ${
    errors[fieldName] ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
  }`;

  const sectionClassName = "bg-white p-6 rounded-lg space-y-4 border border-gray-200";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="bg-unset p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {apiError && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded border border-red-300 flex justify-between items-center">
              {apiError}
              <button onClick={() => setApiError('')} className="bg-unset text-red-700 hover:text-red-900">
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Profile Image Section */}
            <div className={sectionClassName}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm flex items-center justify-center bg-gray-100">
                    {formData.profileImageUrl || formData.profileUrl ? (
                      <img
                        src={formData.profileImageUrl || formData.profileUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/128x128/cccccc/ffffff?text=No+Image'; }}
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Change Photo</span>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <label htmlFor="profile" className={labelClassName}>
                    Upload New Image
                  </label>
                  <input
                    id="profile"
                    name="profile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-[var(--color-primary)] file:text-white
                      hover:file:bg-[var(--color-primary)] file:cursor-pointer"
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
                
                {/* Login Mobile Number */}
                <div>
                  <label htmlFor="mobile" className={labelClassName}>
                    Login Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    inputClass={errors.mobile ? 'border border-red-500 focus:border-red-500' : 'border border-gray-300'}
                    country={'in'}
                    value={getFullMobile(formData.countryCode, formData.mobile)}
                    onChange={(value, data) => handleMobileChange(value, data, 'mobile')}
                    inputProps={{
                      name: 'mobile',
                      required: true,
                      id: 'mobile',
                      ref: mobileRef,
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
                    readOnly
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>
                
                <div>
                  <label htmlFor="status" className={labelClassName}>
                    Account Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClassName('status')}
                  >
                    <option value="0">Unverified</option>
                    <option value="1">Active</option>
                    <option value="2">Inactive</option>
                    <option value="3">Deleted</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="role" className={labelClassName}>
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClassName('role')}
                  >
                    <option value="1">Member</option>
                    <option value="2">Admin</option>
                  </select>
                </div>

                {(mode === 'add' || showPasswordField) && (
                  <div className="relative">
                    <label htmlFor="password" className={labelClassName}>
                      Password {mode === 'add' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClassName('password') + ' pr-10'}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="bg-unset text-primary absolute right-3 top-[34px] hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.05 11.05 0 013.304-4.348M3 3l18 18M16.24 16.24A5 5 0 017.76 7.76" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1.5 12S5.5 5.5 12 5.5 22.5 12 22.5 12s-4 6.5-10.5 6.5S1.5 12 1.5 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                )}
                {mode !== 'add' && !showPasswordField && (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setShowPasswordField(true)}
                      className="bg-unset text-sm text-[var(--color-primary)] hover:underline"
                    >
                      Change Password
                    </button>
                  </div>
                )}

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
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    className={inputClassName('dob')}
                  />
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
                {/* Contact Mobile Number */}
                
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
                        value={formData.childrenCount || 0}
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
                    
                    {/* Dynamic child name inputs */}
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
                                name={`child-${index}`}
                                type="text"
                                value={formData.childrenNames?.[index] || ''}
                                onChange={(e) => {
                                  const newChildrenNames = [...(formData.childrenNames || [])];
                                  newChildrenNames[index] = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    childrenNames: newChildrenNames
                                  }));
                                }}
                                className={inputClassName('childrenNames')}
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
                {(mode === 'add' || formData.familyCode) && (
                  <div>
                    <label htmlFor="familyCode" className={labelClassName}>
                      Family Code
                    </label>
                    <input
                      id="familyCode"
                      name="familyCode"
                      type="text"
                      value={formData.familyCode || userInfo?.familyCode || ''}
                      onChange={handleChange}
                      className={inputClassName('familyCode')}
                      placeholder="FAM000123"
                      readOnly
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Cultural & Background Section */}
            <div className={sectionClassName}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cultural & Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Religion Dropdown */}
                <div>
                  <label htmlFor="religionId" className={labelClassName}>
                    Religion
                  </label>
                  <select
                    id="religionId"
                    name="religionId"
                    value={formData.religionId}
                    onChange={handleChange}
                    className={inputClassName('religionId')}
                    disabled={dropdownData.loading}
                  >
                    <option value="">Select Religion</option>
                    {dropdownData.religions.map(religion => (
                      <option key={religion.id} value={religion.id}>
                        {religion.name}
                      </option>
                    ))}
                  </select>
                  {dropdownData.loading && (
                    <p className="text-xs text-gray-500 mt-1">Loading religions...</p>
                  )}
                </div>

                {/* Language Dropdown */}
                <div>
                  <label htmlFor="languageId" className={labelClassName}>
                    Language
                  </label>
                  <select
                    id="languageId"
                    name="languageId"
                    value={formData.languageId}
                    onChange={handleChange}
                    className={inputClassName('languageId')}
                    disabled={dropdownData.loading}
                  >
                    <option value="">Select Language</option>
                    {dropdownData.languages.map(language => (
                      <option key={language.id} value={language.id}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                  {dropdownData.loading && (
                    <p className="text-xs text-gray-500 mt-1">Loading languages...</p>
                  )}
                </div>

                {/* Caste Input */}
                <div>
                  <label htmlFor="caste" className={labelClassName}>
                    Caste
                  </label>
                  <input
                    id="caste"
                    name="caste"
                    type="text"
                    value={formData.caste}
                    onChange={handleChange}
                    className={inputClassName('caste')}
                    placeholder="Enter caste"
                  />
                </div>

                {/* Gothram Dropdown */}
                <div>
                  <label htmlFor="gothramId" className={labelClassName}>
                    Gothram
                  </label>
                  <select
                    id="gothramId"
                    name="gothramId"
                    value={formData.gothramId}
                    onChange={handleChange}
                    className={inputClassName('gothramId')}
                    disabled={dropdownData.loading}
                  >
                    <option value="">Select Gothram</option>
                    {dropdownData.gothrams.map(gothram => (
                      <option key={gothram.id} value={gothram.id}>
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
                    value={formData.kuladevata}
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
                    value={formData.region}
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
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-unset px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white font-medium rounded-lg transition-colors flex items-center ${
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
    </div>
  );
};

export default ProfileFormModal;