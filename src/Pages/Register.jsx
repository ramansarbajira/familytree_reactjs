import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import AuthLogo from '../Components/AuthLogo';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const familyCode = params.get('familyCode');
  const firstNameRef = useRef(null);
  const mobileRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    countryCode: '',
    password: '',
    confirmPassword: '',
    hasAcceptedTerms: false,
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const apiErrorRef = useRef(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: minLength && hasUpperCase && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasSpecialChar
    };
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.countryCode || !formData.mobile) {
      newErrors.mobile = 'Valid mobile number is required';
    } else if (formData.mobile.length < 6 || formData.mobile.length > 15) {
      newErrors.mobile = 'Mobile number must be between 6 and 15 digits';
    }
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must be at least 8 characters with 1 uppercase letter and 1 special character';
      }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.hasAcceptedTerms) {
      newErrors.hasAcceptedTerms = 'You must agree to the Terms & Conditions to create an account';
    }

    setErrors(newErrors);

    if (newErrors.firstName) {
      firstNameRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(''); // reset before new attempt

    if (!validate()) return;

    setIsLoading(true); // Set loading to true when API call starts

    try {
      // Create API data without confirmPassword
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        countryCode: formData.countryCode,
        password: formData.password,
        hasAcceptedTerms: true,
        termsVersion: 'v1.0.0',
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.message || 'Login failed. Please check credentials.');
        // Focus on error section after a short delay to ensure DOM update
        setTimeout(() => {
          apiErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          apiErrorRef.current?.focus();
        }, 100);
        return;
      }
      
      const data = await response.json();
      // Navigate to OTP verification page with email and familyCode in URL if present
      if (familyCode) {
        navigate(`/verify-otp?familyCode=${familyCode}`, { state: { email: data.email, mobile: data.mobile } });
      } else {
        navigate('/verify-otp', { state: { email: data.email, mobile: data.mobile } });
      }
    } catch (error) {
      setApiError('Registration failed. Please check your network and try again.');
      // Focus on error section after a short delay to ensure DOM update
      setTimeout(() => {
        apiErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        apiErrorRef.current?.focus();
      }, 100);
    } finally {
      setIsLoading(false); // Set loading to false when API call completes
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex justify-center mb-1">
          <AuthLogo className="w-28 h-28" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
          <p className="text-sm text-gray-500 mt-1">Please enter your details to sign up</p>
        </div>

        {apiError && (
          <div 
            ref={apiErrorRef}
            tabIndex="-1"
            className="error-alert mb-4 p-3 text-sm text-red-700 bg-red-100 rounded border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            {apiError}
            <button
              onClick={() => setApiError('')}
              className="ml-3 font-bold hover:text-red-900"
              aria-label="Dismiss error"
              style={{ float: 'right' }}
            >
              &times;
            </button>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name and Last Name in same row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 mb-1">
                First name <span className="text-red-500">*</span> 
              </label>
              <input
                id="firstName"
                ref={firstNameRef}
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.firstName
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-[var(--color-primary)]'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 mb-1">
                Last name  <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.lastName
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-[var(--color-primary)]'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
               Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-500 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="Enter email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mobile Number */}
          <div className="w-full">
            <label htmlFor="mobile" className="block text-sm font-bold text-gray-700 mb-1">
              Mobile number <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              country={'in'}
              value={`${formData.countryCode}${formData.mobile}`}
              onChange={(value, data) => {
                const dialCode = `+${data.dialCode}`;
                const mobileNumber = value.replace(data.dialCode, '').replace(/\D/g, ''); // remove country code & non-digits

                setFormData((prev) => ({
                  ...prev,
                  countryCode: dialCode,
                  mobile: mobileNumber
                }));

                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.mobile;
                  return newErrors;
                });
              }}
              inputProps={{
                name: 'mobile',
                required: true,
                id: 'mobile',
                ref: mobileRef,
                placeholder: 'Enter mobile number'
              }}
              specialLabel=""
              disableSearchIcon={true}
              containerStyle={{ width: '100%' }}
              inputStyle={{
                width: '100%',
                height: '44px',
                fontSize: '14px',
                paddingLeft: '50px',
                border: `1px solid ${errors.mobile ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '6px',
                outline: 'none',
                boxShadow: errors.mobile ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none',
              }}
              buttonStyle={{
                border: `1px solid ${errors.mobile ? '#ef4444' : '#d1d5db'}`,
                borderRight: 'none',
                borderRadius: '6px 0 0 6px',
                backgroundColor: 'white',
                width: '48px',
                height: '44px',
              }}
              dropdownStyle={{
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 50,
              }}
            />
            {errors.mobile && (
              <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
            )}
          </div>

          {/* Password */}
       <div className="relative">
  <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-1">
    Password <span className="text-red-500">*</span>
  </label>
  <input
    id="password"
    type={showPassword ? 'text' : 'password'}
    value={formData.password}
    onChange={(e) => handleChange('password', e.target.value)}
    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
      errors.password
        ? 'border-red-500 focus:ring-red-300'
        : 'border-gray-300 focus:ring-[var(--color-primary)]'
    }`}
    placeholder="Enter password"
  />
  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute top-9 right-3 cursor-pointer text-gray-500"
  >
    {showPassword ? (
      // Eye Slash SVG
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.05 11.05 0 013.304-4.348M3 3l18 18M16.24 16.24A5 5 0 017.76 7.76" />
      </svg>
    ) : (
      // Eye Open SVG
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12S5.5 5.5 12 5.5 22.5 12 22.5 12s-4 6.5-10.5 6.5S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </span>
  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
  
  {/* Password Requirements */}
  {formData.password && (
    <div className="mt-2 text-xs">
      <p className="text-gray-600 mb-1">Password requirements:</p>
      <div className="space-y-1">
        <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-1">{formData.password.length >= 8 ? '✓' : '○'}</span>
          At least 8 characters
        </div>
        <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-1">{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
          1 uppercase letter
        </div>
        <div className={`flex items-center ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-1">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✓' : '○'}</span>
          1 special character
        </div>
      </div>
    </div>
  )}
</div>

          {/* Confirm Password */}
       <div className="relative">
  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-800 mb-1">
    Confirm Password <span className="text-red-500">*</span>
  </label>
  <input
    id="confirmPassword"
    type={showConfirmPassword ? 'text' : 'password'}
    value={formData.confirmPassword}
    onChange={(e) => handleChange('confirmPassword', e.target.value)}
    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
      errors.confirmPassword
        ? 'border-red-500 focus:ring-red-300'
        : 'border-gray-300 focus:ring-[var(--color-primary)]'
    }`}
    placeholder="Confirm password"
  />
  <span
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute top-9 right-3 cursor-pointer text-gray-500"
  >
    {showConfirmPassword ? (
      // Eye Slash SVG
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.05 11.05 0 013.304-4.348M3 3l18 18M16.24 16.24A5 5 0 017.76 7.76" />
      </svg>
    ) : (
      // Eye Open SVG
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12S5.5 5.5 12 5.5 22.5 12 22.5 12s-4 6.5-10.5 6.5S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </span>
  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
</div>

          <div className="pt-2">
            <div className="flex items-start space-x-2">
              <input
                id="hasAcceptedTerms"
                type="checkbox"
                checked={formData.hasAcceptedTerms}
                onChange={(e) => handleChange('hasAcceptedTerms', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor="hasAcceptedTerms" className="text-xs text-gray-700">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[var(--color-primary)] underline"
                >
                  Terms & Conditions
                </button>
                {' '}and confirm that I have permission to share my family members' information and will provide only valid contact details
              </label>
            </div>
            {errors.hasAcceptedTerms && (
              <p className="text-red-500 text-xs mt-1">{errors.hasAcceptedTerms}</p>
            )}
          </div>

          {/* Submit Button with loading state */}
            <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 bg-[var(--color-primary)] hover:brightness-110 text-white font-semibold rounded-lg transition flex justify-center items-center ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
                </>
            ) : (
                'Sign Up'
            )}
            </button>
        </form>

        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Terms & Conditions</h2>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="px-4 py-4 max-h-72 overflow-y-auto text-sm text-gray-700 space-y-3">
                <p>
                  This application is designed to help you build and maintain your family tree and share memories with your
                  trusted family members. By using the application, you agree to provide accurate information about yourself and
                  any family members you add.
                </p>
                <p>
                  When you add details about your family members, you confirm that you have their permission where required by
                  law, and that you will not provide fake, misleading, or harmful contact information.
                </p>
                <p>
                  Non-app users are family members who do not have their own login. For these members, only general
                  information should be stored. You must not use dummy or fabricated email addresses or phone numbers for them.
                  Where contact details are unknown, you must leave those fields empty.
                </p>
                <p>
                  You agree not to upload content that is unlawful, abusive, harassing, defamatory, or that violates the
                  privacy or rights of others. We reserve the right to remove content that violates these rules and, if
                  necessary, to restrict or disable your access.
                </p>
                <p>
                  We may update these Terms & Conditions from time to time. When we do, we will update the version number
                  displayed here. If there are material changes, you may be asked to review and accept the updated terms before
                  continuing to use the application.
                </p>
                <p className="font-semibold">Current terms version: v1.0.0</p>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:brightness-110"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6 pb-8">
          Already have an account?{' '}
          <a href="/login" className="text-[var(--color-primary)] hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;