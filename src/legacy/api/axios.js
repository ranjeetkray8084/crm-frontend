// src/utils/axios.js
import axios from "axios";

// ✅ Backend API base URL - pointing to Spring Boot backend
// Use environment variable for development, fallback to production URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://backend.leadstracker.in";

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
        if (!token || token.length === 0) {
          console.error('❌ Token is empty after trim:', config.url);
        } else {
          // Ensure Authorization header is set correctly (case-sensitive)
          config.headers['Authorization'] = `Bearer ${token}`;
          
          // Debug logging for notes endpoint to diagnose 401 issues
          if (config.url && config.url.includes('/notes') && config.method === 'post') {
            console.log('🔍 Notes Request Debug:', {
              url: config.url,
              method: config.method,
              hasToken: !!token,
              tokenLength: token.length,
              tokenPreview: token.substring(0, 20) + '...',
              authHeader: config.headers['Authorization']?.substring(0, 30) + '...'
            });
          }
        }
      } else {
        // Log warning in development to help debug
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ No token found in storage for request:', config.url);
        }
      }

      // Use environment-based security configuration (wrapped in try-catch to not break token)
      try {
        const { ENV_CONFIG } = await import('../../core/config/environment.js');
        const securityConfig = ENV_CONFIG.getSecurityConfig();
        
        if (!securityConfig.skipSecurityHeaders) {
          // Add basic security headers for production/development
          const { getBasicSecurityHeaders } = await import('../../core/security/SimpleSecurityInit.js');
          const securityHeaders = getBasicSecurityHeaders();
          config.headers = { ...config.headers, ...securityHeaders };

          // Add request timestamp
          config.headers['X-Request-Timestamp'] = Date.now().toString();
        }

        if (!securityConfig.skipInputSanitization) {
          // Basic input sanitization for sensitive operations
          if (isSensitiveOperation(config.method, config.url) && config.data) {
            const { sanitizeInput } = await import('../../core/security/SimpleSecurityInit.js');
            config.data = sanitizeRequestData(config.data, sanitizeInput);
          }
        }
      } catch (securityError) {
        // If security config fails, log but don't break the request
        console.warn('Security config error (non-blocking):', securityError);
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
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

// Helper function to check if operation is sensitive
function isSensitiveOperation(method, url) {
  const sensitiveMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  const sensitiveEndpoints = ['/auth/', '/users/', '/companies/', '/leads/', '/properties/'];
  
  return sensitiveMethods.includes(method.toUpperCase()) && 
         sensitiveEndpoints.some(endpoint => url.includes(endpoint));
}

// Helper function to sanitize request data
function sanitizeRequestData(data, sanitizeInput) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestData(value, sanitizeInput);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

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
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      const isLoginEndpoint = error.config?.url?.includes('/api/auth/login');
      const isFollowUpEndpoint = error.config?.url?.includes('/followups');
      const isNotesEndpoint = error.config?.url?.includes('/notes');
      const isOnLogin = window.location.pathname.includes('/login') || window.location.pathname === '/';

      // For login endpoint, provide better error messages
      if (isLoginEndpoint) {
        // Only log if it's not a simple credential error
        if (!error.response || error.response.status !== 401) {
          console.log('🔍 Login failed - checking error type...');
          
          // Check if it's a network error vs authentication error
          if (!error.response) {
            error.message = 'Unable to connect to server. Please check your internet connection.';
            error.isNetworkError = true;
            console.log('🚨 Network connectivity issue detected');
          } else {
            console.log('✅ Server is accessible - 401 is expected for wrong credentials');
          }
        }
        // Don't log 401 errors for login - they're expected for wrong credentials
      }

      // For notes endpoint 401, check if token exists and log helpful info
      if (isNotesEndpoint) {
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
            console.error('❌ Token decode error:', e);
          }
        }

        // Log comprehensive error info
        const errorLog = {
          url: error.config?.url,
          method: error.config?.method,
          hasToken: !!token,
          tokenLength: token?.trim()?.length || 0,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'N/A',
          hasAuthHeader: !!authHeader,
          authHeaderPreview: authHeader ? authHeader.substring(0, 40) + '...' : 'N/A',
          tokenExpired: tokenExpired,
          tokenExpiryTime: tokenExpiryTime?.toLocaleString() || 'N/A',
          tokenDecodeError: tokenDecodeError,
          tokenPayloadInfo: payloadInfo,
          requestHeaders: Object.keys(error.config?.headers || {}),
          responseStatus: error.response?.status,
          responseData: error.response?.data,
          responseHeaders: error.response?.headers,
          hostname: window.location.hostname,
          isProduction: window.location.hostname.includes('.leadstracker.in')
        };
        
        console.error('🔴 Notes endpoint 401 Unauthorized:', errorLog);
        
        // Also log separately for better visibility
        if (tokenExpired) {
          console.error('❌ TOKEN EXPIRED:', {
            expired: true,
            expiryTime: tokenExpiryTime?.toLocaleString(),
            currentTime: new Date().toLocaleString()
          });
        } else if (tokenDecodeError) {
          console.error('❌ TOKEN DECODE FAILED:', tokenDecodeError);
        } else if (!tokenExpired && payloadInfo) {
          console.warn('⚠️ TOKEN NOT EXPIRED but backend rejected:', {
            expiryTime: tokenExpiryTime?.toLocaleString(),
            timeRemaining: tokenExpiryTime ? Math.max(0, Math.floor((tokenExpiryTime.getTime() - Date.now()) / 1000)) : 'N/A',
            userId: payloadInfo.userId
          });
        }
        
        // Check if token might be expired or invalid
        if (token) {
          const cleanedToken = token.trim();
          if (cleanedToken.length === 0) {
            console.error('❌ Token is empty after trimming whitespace');
          } else if (!authHeader || !authHeader.includes('Bearer')) {
            console.error('❌ Authorization header missing or malformed in request');
          } else {
            // Check if token is expired
            let tokenExpired = false;
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const currentTime = Date.now() / 1000;
              tokenExpired = payload.exp < currentTime;
            } catch (e) {
              // Token decode failed
            }

            if (tokenExpired) {
              console.warn('⚠️ Token is expired. Clearing token and asking user to re-login.');
              
              // Clear expired token
              sessionStorage.removeItem('token');
              localStorage.removeItem('token');
              sessionStorage.removeItem('user');
              localStorage.removeItem('user');
              
              error.userMessage = 'Your session has expired. Please refresh the page and login again.';
            } else {
              console.warn('⚠️ Token exists and header looks correct, but backend rejected. Token might be invalid or revoked.');
              
              // In production, token expiry is common - suggest user to refresh page or re-login
              const isProduction = window.location.hostname !== 'localhost' && 
                                  !window.location.hostname.includes('127.0.0.1') &&
                                  window.location.hostname.includes('.leadstracker.in');
              if (isProduction) {
                console.warn('⚠️ Production environment detected. Token may have expired. User should refresh the page or re-login.');
                
                // Add error message to help user
                error.userMessage = 'Your session may have expired. Please refresh the page or login again to create notes.';
              }
              
              // Check backend error message
              const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
              if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
                console.warn('⚠️ Backend indicates token is expired/invalid. User should re-login.');
                error.userMessage = error.userMessage || 'Session expired. Please login again.';
              }
            }
          }
        } else {
          console.error('❌ No token found in storage for notes request');
          error.userMessage = 'Authentication token not found. Please login again.';
        }
        
        // Don't logout for notes errors - just reject and let component handle it
        // But add helpful error message
        if (!error.userMessage) {
          error.userMessage = 'Unable to create note. Please check your login status.';
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
      console.error('🚨 Network error:', error.message);
      
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