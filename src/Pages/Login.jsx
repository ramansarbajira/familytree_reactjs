import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLogo from '../Components/AuthLogo';

const Login = () => {
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // For loader
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Email or phone is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';

    setErrors(newErrors);

    if (newErrors.username) {
      usernameRef.current?.focus();
    } else if (newErrors.password) {
      passwordRef.current?.focus();
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
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true); // Show loader

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/login`, {
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
      localStorage.clear();
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      navigate('/dashboard'); // Redirect to home page after login
    } catch (error) {
      setApiError('Login failed. Please check your network or credentials.');
    } finally {
      setIsSubmitting(false); // Hide loader
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
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back!!!</h2>
          <p className="text-sm text-gray-500 mt-1">Please enter your login details</p>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-5 mb-3">
          {['google', 'twitter', 'facebook'].map((social) => (
            <button
              key={social}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-white border shadow hover:shadow-lg transition"
            >
              <img src={`/assets/${social}.png`} alt={social} className="w-10 h-10" />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* API Error */}
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
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
            <input
              id="username"
              ref={usernameRef}
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.username
                  ? 'border-red-500 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="Email or Phone No"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Password */}
         <div className="relative">
  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
  <input
    id="password"
    ref={passwordRef}
    type={showPassword ? 'text' : 'password'}
    value={formData.password}
    onChange={(e) => handleChange('password', e.target.value)}
    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
      errors.password
        ? 'border-red-500 focus:ring-red-300'
        : 'border-gray-300 focus:ring-[var(--color-primary)]'
    }`}
    placeholder="Enter password"
  />
  {/* Eye Icon */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute top-9 right-4 text-gray-500 hover:text-gray-700 focus:outline-none bg-transparent"
  tabIndex={-1}
  >
    {showPassword ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-.898.12-1.768.345-2.592m.66-2.384a9.961 9.961 0 0115.455 2.204M9.88 9.88a3 3 0 104.24 4.24M15 12a3 3 0 01-3 3m0-6a3 3 0 013 3m-3 3a3 3 0 01-3-3" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm1.45 5.33L4.98 5.86m14.09 10.09A9.953 9.953 0 0021 12c0-5.523-4.477-10-10-10-1.658 0-3.216.403-4.594 1.117" />
      </svg>
    )}
  </button>
  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
</div>


          {/* Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
              <span>Stay logged in</span>
            </label>
            <a href="/forgot-password" className="text-[var(--color-primary)] hover:underline">Forgot password?</a>
          </div>

          {/* Submit Button with Loader */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 flex items-center justify-center font-semibold rounded-lg transition ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[var(--color-primary)] hover:brightness-110 text-white'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Sign Up */}
        <p className="text-center text-sm text-gray-500 mt-6 pb-8">
          Don't have an account?{' '}
          <a href="/register" className="text-[var(--color-primary)] hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
