// API Client with CORS error handling and retry logic
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  constructor() {
    this.defaultOptions = {
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  async request(endpoint, options = {}, retryCount = 0) {
    const { headers = {}, ...otherOptions } = options;
    
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    const config = {
      ...this.defaultOptions,
      ...otherOptions,
      headers: {
        ...this.defaultOptions.headers,
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle CORS preflight issues
      if (response.type === 'opaque' || response.type === 'opaqueredirect') {
        throw new Error('CORS preflight failed - server may not allow this origin');
      }
      
      return response;
    } catch (error) {
      // Handle CORS and network errors with retry logic
      if (this.isCorsOrNetworkError(error)) {
        console.warn(`CORS/Network error on ${endpoint}:`, error.message);
        
        if (retryCount < 2) {
          console.warn(`Retrying request to ${endpoint}... (${retryCount + 1}/3)`);
          await this.delay(this.getRetryDelay(retryCount));
          return this.request(endpoint, options, retryCount + 1);
        } else {
          console.error(`CORS/Network error persists for ${endpoint} after ${retryCount + 1} attempts`);
          throw new Error(`CORS/Network error: ${error.message}. Check server CORS configuration.`);
        }
      }
      
      throw error;
    }
  }

  isCorsOrNetworkError(error) {
    return (
      error.name === 'TypeError' &&
      (error.message.includes('CORS') ||
       error.message.includes('fetch') ||
       error.message.includes('NetworkError') ||
       error.message.includes('Failed to fetch'))
    );
  }

  getRetryDelay(retryCount) {
    // Exponential backoff: 2s, 5s, 10s
    return [2000, 5000, 10000][retryCount] || 10000;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
