// src/utils/axios.js
import axios from "axios";

// ✅ Backend API base URL - ALWAYS USE PRODUCTION
// Force production API URL - no local backend support
const BASE_URL = "https://backend.leadstracker.in";


// ✅ Security configuration
const SECURITY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  rateLimit: {
    maxRequests: 100,
    timeWindow: 60000, // 1 minute
  }
};

// ✅ Rate limiting implementation
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    return false;
  }
}

const rateLimiter = new RateLimiter(SECURITY_CONFIG.rateLimit.maxRequests, SECURITY_CONFIG.rateLimit.timeWindow);

// ✅ Create an Axios instance with security headers
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "X-Client-Version": "1.0.0",
    "X-Platform": "web"
  }
});

// ✅ Enhanced request interceptor with basic security measures
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Rate limiting check
      if (!rateLimiter.canMakeRequest()) {
        return Promise.reject(new Error('Rate limit exceeded. Please try again later.'));
      }

      // Force HTTPS in production
      if (process.env.NODE_ENV === 'production' && config.url && !config.url.startsWith('https://')) {
        config.url = config.url.replace('http://', 'https://');
      }

      // CRITICAL: Get and add token FIRST - ensure it's always added even if other operations fail
      let token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        // Clean token - remove any whitespace
        token = token.trim();
        
        // Validate token format (should not be empty after trim)
        if (token && token.length > 0) {
          // Ensure Authorization header is set correctly (case-sensitive)
          config.headers['Authorization'] = `Bearer ${token}`;
          
        }
      }

      // Ensure data is object format (not string) - backend handles validation
      if (config.data && typeof config.data === 'string') {
        try {
          config.data = JSON.parse(config.data);
        } catch (e) {
          // Failed to parse - keep as is
        }
      }

      return config;
    } catch (error) {
      // Even on error, ensure token is added if available
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Removed sanitization functions - backend handles validation

// ✅ Enhanced response interceptor with security measures
axiosInstance.interceptors.response.use(
  (response) => {
    // Validate response structure
    if (response.data && typeof response.data === 'object') {
      // Remove sensitive data from response if needed
      if (response.data.password) {
        delete response.data.password;
      }
    }
    return response;
  },
  async (error) => {
    // Enhanced error handling with security
    // Handle 400 Bad Request errors (payload validation issues)
    if (error.response?.status === 400 && error.config?.url?.includes('/notes') && error.config?.method === 'post') {
      // Try to get more details from the response
      let responseText = '';
      try {
        responseText = error.response?.data?.toString() || '';
      } catch (e) {
        responseText = String(error.response?.data || '');
      }
      
    }
    
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      const isLoginEndpoint = error.config?.url?.includes('/api/auth/login');
      const isFollowUpEndpoint = error.config?.url?.includes('/followups');
      const isNotesEndpoint = error.config?.url?.includes('/notes');
      const isOnLogin = window.location.pathname.includes('/login') || window.location.pathname === '/';

      // For login endpoint, provide better error messages
      if (isLoginEndpoint && !error.response) {
        error.message = 'Unable to connect to server. Please check your internet connection.';
        error.isNetworkError = true;
      }

      // For leads PUT endpoint 401, check if token exists and log helpful info
      const isLeadsPutEndpoint = error.config?.url?.includes('/leads') && error.config?.method === 'put';
      
      if (isLeadsPutEndpoint || isNotesEndpoint) {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const authHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization;
        
        // Check if token is expired by decoding JWT
        let tokenExpired = false;
        let tokenExpiryTime = null;
        let tokenDecodeError = null;
        let payloadInfo = null;
        
        if (token) {
          try {
            const parts = token.trim().split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const currentTime = Date.now() / 1000;
              tokenExpired = payload.exp ? payload.exp < currentTime : false;
              tokenExpiryTime = payload.exp ? new Date(payload.exp * 1000) : null;
              payloadInfo = {
                exp: payload.exp,
                iat: payload.iat,
                userId: payload.userId || payload.sub,
                expDate: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A',
                currentTime: new Date(currentTime * 1000).toLocaleString()
              };
            } else {
              tokenDecodeError = 'Invalid token format: expected 3 parts';
            }
          } catch (e) {
            tokenDecodeError = e.message || 'Token decode failed';
          }
        }

        // Clear token if expired
        if (tokenExpired) {
          // Clear expired token
          sessionStorage.removeItem('token');
          localStorage.removeItem('token');
          sessionStorage.removeItem('user');
          localStorage.removeItem('user');
          
          error.userMessage = 'Your session has expired. Please refresh the page and login again.';
        } else if (!token) {
          error.userMessage = 'Authentication required. Please login again.';
        } else if (!authHeader || !authHeader.includes('Bearer')) {
          error.userMessage = 'Authorization header missing. Please refresh the page.';
        } else {
          // In production, token expiry is common - suggest user to refresh page or re-login
          const isProduction = window.location.hostname !== 'localhost' && 
                              !window.location.hostname.includes('127.0.0.1') &&
                              window.location.hostname.includes('.leadstracker.in');
          if (isProduction) {
            // CRITICAL FIX: Clear token from different backend environment
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Add error message to help user
            error.userMessage = 'Your login token is from a different environment. Please log in again to continue.';
            
            // Force redirect to login after short delay
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          }
          
          // Check backend error message
          const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
          if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
            error.userMessage = error.userMessage || 'Session expired. Please login again.';
          }
        }
        
        // Don't logout for notes/leads errors - just reject and let component handle it
        // But add helpful error message
        if (!error.userMessage) {
          const endpointType = isLeadsPutEndpoint ? 'update lead' : 'create note';
          error.userMessage = `Unable to ${endpointType}. Please check your login status.`;
        }
        
        return Promise.reject(error);
      }

      // Don't logout for follow-up API errors (temporary fix for backend JPA issue)
      if (isFollowUpEndpoint) {
        return Promise.reject(error);
      }

      // Only logout for auth endpoints or if we're not on login page
      if (isAuthEndpoint && !isOnLogin) {
        // Clear auth data securely
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login
        window.location.href = "/";
      }
    }

    // Handle network errors
    if (!error.response) {
      // Check if it's a connection error
      if (error.code === 'NETWORK_ERROR' || 
          error.message.includes('Network Error') ||
          error.message.includes('ERR_NETWORK') ||
          error.message.includes('ERR_CONNECTION_REFUSED') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED')) {
        error.message = 'Unable to connect to server. Please check your internet connection and try again.';
        error.isNetworkError = true;
      }
    }

    // Handle 400 errors (validation errors like duplicate email/phone)
    if (error.response?.status === 400) {
      // Let the service layer handle these specific validation errors
      // Don't modify the error here, just pass it through
    }

    // Handle 500 errors (like your JPA parameter binding issue)
    if (error.response?.status === 500) {
      // Don't logout for server errors
    }

    // Handle rate limiting errors
    if (error.response?.status === 429) {
      // Rate limiting handled
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      // Network error handled
    }

    return Promise.reject(error);
  }
);

// ✅ Add retry mechanism for failed requests
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;

    if (!config || !config.retry) {
      config.retry = 0;
    }

    if (config.retry >= SECURITY_CONFIG.maxRetries) {
      return Promise.reject(error);
    }

    config.retry += 1;

    // Exponential backoff
    const delay = SECURITY_CONFIG.retryDelay * Math.pow(2, config.retry - 1);

    await new Promise(resolve => setTimeout(resolve, delay));

    return axiosInstance(config);
  }
);

// ✅ Security utility functions
export const securityUtils = {
  // Encrypt sensitive data before sending
  encryptData: (data) => {
    // Basic obfuscation - in production, use proper encryption
    if (typeof data === 'string') {
      return btoa(encodeURIComponent(data));
    }
    return data;
  },

  // Decrypt sensitive data after receiving
  decryptData: (data) => {
    // Basic deobfuscation - in production, use proper decryption
    if (typeof data === 'string') {
      try {
        return decodeURIComponent(atob(data));
      } catch {
        return data;
      }
    }
    return data;
  },

  // Validate API response
  validateResponse: (response) => {
    if (!response || !response.data) {
      throw new Error('Invalid response format');
    }
    return response.data;
  },

  // Sanitize request data
  sanitizeRequest: (data) => {
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    return data;
  }
};

export default axiosInstance;
//helper functions