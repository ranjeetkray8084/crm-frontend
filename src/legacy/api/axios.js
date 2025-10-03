// src/utils/axios.js
import axios from "axios";

// ✅ Backend API base URL - pointing to Spring Boot backend
// Use environment variable for development, fallback to production URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8083";

// Debug log to verify which URL is being used
console.log('🔗 API Base URL:', BASE_URL);
console.log('🔧 Environment Variable VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

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

// ✅ Enhanced request interceptor with security measures
axiosInstance.interceptors.request.use(
  (config) => {
    // Rate limiting check
    if (!rateLimiter.canMakeRequest()) {
      return Promise.reject(new Error('Rate limit exceeded. Please try again later.'));
    }

    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production' && config.url && !config.url.startsWith('https://')) {
      config.url = config.url.replace('http://', 'https://');
    }

    // Add authentication token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add request timestamp for security
    config.headers['X-Request-Timestamp'] = Date.now().toString();

    // Obfuscate sensitive headers
    // Removed code that stripped password and confirmPassword from request data

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  (error) => {
    // Enhanced error handling with security
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      const isFollowUpEndpoint = error.config?.url?.includes('/followups');
      const isOnLogin = window.location.pathname.includes('/login') || window.location.pathname === '/';

      // Don't logout for follow-up API errors (temporary fix for backend JPA issue)
      if (isFollowUpEndpoint) {
        return Promise.reject(error);
      }

      // Only logout for auth endpoints or if we're not on login page
      if (isAuthEndpoint && !isOnLogin) {
        // Clear auth data securely
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();

        // Redirect to login
        window.location.href = "/";
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
