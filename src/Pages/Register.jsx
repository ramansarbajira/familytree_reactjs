import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import AuthLogo from '../Components/AuthLogo';

const Register = () => {
  const navigate = useNavigate();
  const firstNameRef = useRef(null);
  const mobileRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    countryCode: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

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
    if (!formData.password.trim()) newErrors.password = 'Password is required';

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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.message || 'Login failed. Please check credentials.');
        return;
      }
      
      const data = await response.json();
      // Navigate to OTP verification page with email
      navigate('/verify-otp', { state: { email: data.email, mobile: data.mobile  } });
    } catch (error) {
      setApiError('Registration failed. Please check your network and try again.');
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
          <div className="error-alert mb-4 p-3 text-sm text-red-700 bg-red-100 rounded border border-red-300">
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
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-1">
              Password <span className="text-red-500">*</span> 
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-500 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="Enter password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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