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
  
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
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
  if (!token || !user) return;
  
  // Set token and user info
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.STAY_LOGGED_IN, stayLoggedIn.toString());
  
  // Set session expiry if not staying logged in
  if (!stayLoggedIn) {
    const expiryTime = new Date().getTime() + SESSION_TIMEOUT;
    localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiryTime.toString());
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
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
 * Validates JWT token format
 * @param {string} token - JWT token to validate
 * @returns {boolean} True if token format is valid
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // Check if token has 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Check if each part is base64 encoded
  try {
    parts.forEach(part => {
      if (!part) throw new Error('Empty token part');
      // Try to decode each part
      window.atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch (error) {
    console.warn('Invalid token format:', error.message);
    return false;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // Validate token format
  if (!isValidTokenFormat(token)) {
    console.warn('Invalid token format detected, clearing auth data');
    clearAuthData();
    return false;
  }
  
  return true;
};

/**
 * Detect if running in server environment vs local
 * @returns {boolean} True if running on server
 */
const isServerEnvironment = () => {
  const hostname = window.location.hostname;
  return !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
};

/**
 * Create fetch with timeout
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} Fetch response with timeout
 */
const fetchWithTimeout = (url, options, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

/**
 * Authenticated fetch utility with proper error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries for network errors
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}, retries = 2) => {
  const token = getToken();
  const isServer = isServerEnvironment();
  
  // Validate token before making request
  if (!token || !isValidTokenFormat(token)) {
    console.warn('No valid token available for authenticated request');
    clearAuthData();
    throw new Error('Authentication required');
  }
  
  // Prepare headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  // Validate request body for POST/PUT requests
  if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
    if (options.body && typeof options.body === 'string') {
      try {
        JSON.parse(options.body);
      } catch (error) {
        console.error('Invalid JSON in request body:', error);
        throw new Error('Invalid request body format');
      }
    }
  }
  
  const fetchOptions = {
    ...options,
    headers
  };
  
  // Increase retries for server environment
  const maxRetries = isServer ? Math.max(retries, 3) : retries;
  // Longer timeout for server environment
  const timeout = isServer ? 45000 : 30000;
  
  console.log(`Making request to ${url} (Environment: ${isServer ? 'Server' : 'Local'}, Retries: ${maxRetries})`);
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    
    try {
      const response = await fetchWithTimeout(url, fetchOptions, timeout);
      const duration = Date.now() - startTime;
      
      console.log(`Request completed in ${duration}ms (Attempt ${attempt + 1}/${maxRetries + 1})`);
      
      // Handle different response status codes
      if (response.status === 401) {
        console.warn('Authentication failed - clearing auth data');
        clearAuthData();
        throw new Error('Authentication failed');
      }
      
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Bad Request (400):', errorData);
        throw new Error(`Bad Request: ${errorData.message || 'Invalid request'}`);
      }
      
      if (response.status === 500) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server Error (500):', errorData);
        
        // For server environment, retry 500 errors
        if (isServer && attempt < maxRetries) {
          console.warn(`Server error on attempt ${attempt + 1}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000));
          continue;
        }
        
        throw new Error(`Server Error: ${errorData.message || 'Internal server error'}`);
      }
      
      if (response.status === 502) {
        const errorData = await response.text().catch(() => 'Bad Gateway');
        console.error('Bad Gateway (502):', errorData);
        
        // Always retry 502 errors as they're usually temporary
        if (attempt < maxRetries) {
          console.warn(`Bad Gateway on attempt ${attempt + 1}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 3000));
          continue;
        }
        
        throw new Error('Bad Gateway: Server temporarily unavailable');
      }
      
      if (response.status === 503) {
        console.error('Service Unavailable (503)');
        
        // Retry 503 errors
        if (attempt < maxRetries) {
          console.warn(`Service unavailable on attempt ${attempt + 1}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 5000));
          continue;
        }
        
        throw new Error('Service Unavailable: Server is temporarily overloaded');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`HTTP Error ${response.status}:`, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }
      
      return response;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Request failed after ${duration}ms (Attempt ${attempt + 1}/${maxRetries + 1}):`, error.message);
      
      // Handle timeout errors
      if (error.message === 'Request timeout') {
        if (attempt < maxRetries) {
          console.warn(`Request timeout on attempt ${attempt + 1}, retrying with longer timeout...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000));
          continue;
        }
        throw new Error('Request timeout: Server is taking too long to respond');
      }
      
      // Handle network errors
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        if (attempt < maxRetries) {
          console.warn(`Network error on attempt ${attempt + 1}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000));
          continue;
        }
        throw new Error('Network error: Please check your internet connection');
      }
      
      // For other errors, don't retry unless it's a server error
      if (attempt === maxRetries || (!error.message.includes('Server Error') && !error.message.includes('Bad Gateway'))) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000));
      console.warn(`Retrying request (attempt ${attempt + 2}/${maxRetries + 1}):`, url);
    }
  }
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