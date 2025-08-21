/**
 * Utility functions for handling authentication
 */

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
  const token = localStorage.getItem('access_token');
  return token ? getUserIdFromToken(token) : null;
};
