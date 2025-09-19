/**
 * Utility functions for handling authentication
 */

// Key names for localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_INFO: 'userInfo',
  STAY_LOGGED_IN: 'stayLoggedIn',
  SESSION_EXPIRY: 'sessionExpiry'
};

// Session timeout in milliseconds (12 hours)
const SESSION_TIMEOUT = 12 * 60 * 60 * 1000;

/**
 * Extracts user ID from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User ID or null if invalid token
 */
export const getUserIdFromToken = (token) => {
  try {
    if (!token) return null;
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;
    
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    return payload?.id || payload?.sub || payload?.userId || null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Gets the current user's ID from local storage
 * @returns {string|null} User ID or null if not logged in
 */
export const getCurrentUserId = () => {
  const token = getToken();
  return token ? getUserIdFromToken(token) : null;
};

/**
 * Get authentication token from storage
 * @returns {string|null} Token or null if not available or expired
 */
export const getToken = () => {
  // Check if session has expired
  const expiryTime = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
  if (expiryTime && new Date().getTime() > Number(expiryTime)) {
    clearAuthData();
    return null;
  }
  
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  
  // Validate token format
  if (token && !isValidTokenFormat(token)) {
    console.warn('Invalid token format detected, clearing auth data');
    clearAuthData();
    return null;
  }
  
  return token;
};

/**
 * Validate JWT token format
 * @param {string} token - JWT token to validate
 * @returns {boolean} True if token format is valid
 */
const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be base64 encoded (basic check)
  try {
    parts.forEach(part => {
      if (!part) throw new Error('Empty part');
      // Basic base64 validation
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Get user info from storage
 * @returns {Object|null} User info or null if not available
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * Set authentication data in storage
 * @param {string} token - JWT token
 * @param {Object} user - User info
 * @param {boolean} stayLoggedIn - Whether to keep the user logged in
 */
export const setAuthData = (token, user, stayLoggedIn = false) => {
  if (!token || !user) {
    console.error('Invalid token or user data provided to setAuthData');
    return;
  }
  
  // Validate token format before storing
  if (!isValidTokenFormat(token)) {
    console.error('Invalid token format, not storing auth data');
    return;
  }
  
  try {
    // Set token and user info
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.trim());
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.STAY_LOGGED_IN, stayLoggedIn.toString());
    
    // Set session expiry if not staying logged in
    if (!stayLoggedIn) {
      const expiryTime = new Date().getTime() + SESSION_TIMEOUT;
      localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiryTime.toString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
    }
  } catch (error) {
    console.error('Error storing auth data:', error);
    clearAuthData();
  }
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  sessionStorage.removeItem('tempLoginSession');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // Additional token validation can be added here
  return true;
};

/**
 * Initialize authentication state
 * Should be called when app loads
 */
export const initializeAuth = () => {
  // Clear expired session if exists
  const expiryTime = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
  if (expiryTime && new Date().getTime() > Number(expiryTime)) {
    clearAuthData();
  }
};

/**
 * Create authenticated fetch request with proper error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No valid authentication token available');
  }
  
  // Ensure headers object exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  // Validate request body for POST/PUT requests
  if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
    if (options.body && typeof options.body === 'string') {
      try {
        JSON.parse(options.body);
      } catch (error) {
        throw new Error('Invalid JSON in request body');
      }
    }
  }
  
  const fetchOptions = {
    ...options,
    headers,
    timeout: 15000 // 15 second timeout
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle specific error cases
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Bad Request: ${errorData.message || 'Invalid request data'}`);
    }
    
    if (response.status === 401) {
      // Token expired or invalid
      clearAuthData();
      throw new Error('Authentication expired. Please login again.');
    }
    
    return response;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};
