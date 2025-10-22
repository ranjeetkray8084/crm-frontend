import axios from 'axios';
import securityMiddleware from '../middleware/security.middleware.js';
import { requestSigner } from '../security/RequestSigner.js';
import { dataEncryption } from '../security/DataEncryption.js';
import { tokenManager } from '../security/TokenManager.js';

/**
 * Enhanced Secure API Service with comprehensive security features
 */
class EnhancedSecureApiService {
  constructor() {
    this.axios = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend.leadstracker.in',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Version': '1.0.0',
        'X-Platform': 'web'
      }
    });
    
    this.security = securityMiddleware;
    this.setupInterceptors();
    this.initializeTokenManager();
  }

  /**
   * Initialize token manager
   */
  initializeTokenManager() {
    tokenManager.initialize();
  }

  /**
   * Setup request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.axios.interceptors.request.use(
      async (config) => {
        try {
          // Validate request integrity
          if (!this.security.validateRequestIntegrity(config)) {
            throw new Error('Request integrity validation failed');
          }

          // Get valid token
          const token = await tokenManager.getValidToken();
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }

          // Add security headers
          config.headers = this.security.addSecurityHeaders(config.headers);

          // Add request signing for sensitive operations
          if (this.isSensitiveOperation(config.method, config.url)) {
            const securityHeaders = requestSigner.getSecurityHeaders(
              config.method,
              config.url,
              config.data
            );
            config.headers = { ...config.headers, ...securityHeaders };
          }

          // Encrypt sensitive data
          if (config.data && this.isSensitiveOperation(config.method, config.url)) {
            config.data = dataEncryption.encryptSensitiveFields(config.data);
          }

          return config;
        } catch (error) {
          console.error('Request interceptor error:', error);
          this.security.logSecurityEvent('REQUEST_INTERCEPTOR_ERROR', { error: error.message });
          throw error;
        }
      },
      (error) => {
        this.security.logSecurityEvent('REQUEST_INTERCEPTOR_ERROR', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => {
        try {
          // Validate response
          const validatedResponse = this.security.validateResponse(response);
          
          // Decrypt sensitive data if needed
          if (response.data && typeof response.data === 'object') {
            response.data = dataEncryption.decryptSensitiveFields(response.data);
          }
          
          return validatedResponse;
        } catch (error) {
          this.security.logSecurityEvent('RESPONSE_VALIDATION_ERROR', { error: error.message });
          throw error;
        }
      },
      (error) => {
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if operation is sensitive and requires additional security
   * @param {string} method - HTTP method
   * @param {string} url - API URL
   * @returns {boolean} True if sensitive
   */
  isSensitiveOperation(method, url) {
    const sensitiveMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const sensitiveEndpoints = ['/auth/', '/users/', '/companies/', '/leads/', '/properties/'];
    
    return sensitiveMethods.includes(method.toUpperCase()) && 
           sensitiveEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Handle response errors
   * @param {Object} error - Error object
   */
  handleResponseError(error) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenManager.clearTokens();
      this.security.logSecurityEvent('TOKEN_EXPIRED', { 
        url: error.config?.url,
        status: error.response.status 
      });
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Access forbidden
      this.security.logSecurityEvent('ACCESS_FORBIDDEN', { 
        url: error.config?.url,
        status: error.response.status 
      });
    } else if (error.response?.status === 429) {
      // Rate limited
      this.security.logSecurityEvent('RATE_LIMITED', { 
        url: error.config?.url,
        retryAfter: error.response.headers['retry-after']
      });
    } else if (error.response?.status >= 500) {
      // Server error
      this.security.logSecurityEvent('SERVER_ERROR', { 
        url: error.config?.url,
        status: error.response.status 
      });
    }
  }

  /**
   * Make a secure GET request
   * @param {string} url - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise} API response
   */
  async secureGet(url, config = {}) {
    try {
      // Security checks
      if (this.security.shouldBlockRequest({ url, ...config })) {
        throw new Error('Request blocked for security reasons');
      }

      // Add security headers
      const secureConfig = {
        ...config,
        headers: this.security.addSecurityHeaders(config.headers)
      };

      // Make request
      const response = await this.axios.get(url, secureConfig);
      
      // Validate response
      return this.security.validateResponse(response);
    } catch (error) {
      this.security.logSecurityEvent('API_GET_ERROR', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Make a secure POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise} API response
   */
  async securePost(url, data = {}, config = {}) {
    try {
      // Security checks
      if (this.security.shouldBlockRequest({ url, ...config })) {
        throw new Error('Request blocked for security reasons');
      }

      // Sanitize request data
      const sanitizedData = this.security.sanitizeRequestData(data);
      
      // Add security headers
      const secureConfig = {
        ...config,
        headers: this.security.addSecurityHeaders(config.headers)
      };

      // Make request
      const response = await this.axios.post(url, sanitizedData, secureConfig);
      
      // Validate response
      return this.security.validateResponse(response);
    } catch (error) {
      this.security.logSecurityEvent('API_POST_ERROR', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Make a secure PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise} API response
   */
  async securePut(url, data = {}, config = {}) {
    try {
      // Security checks
      if (this.security.shouldBlockRequest({ url, ...config })) {
        throw new Error('Request blocked for security reasons');
      }

      // Sanitize request data
      const sanitizedData = this.security.sanitizeRequestData(data);
      
      // Add security headers
      const secureConfig = {
        ...config,
        headers: this.security.addSecurityHeaders(config.headers)
      };

      // Make request
      const response = await this.axios.put(url, sanitizedData, secureConfig);
      
      // Validate response
      return this.security.validateResponse(response);
    } catch (error) {
      this.security.logSecurityEvent('API_PUT_ERROR', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Make a secure DELETE request
   * @param {string} url - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise} API response
   */
  async secureDelete(url, config = {}) {
    try {
      // Security checks
      if (this.security.shouldBlockRequest({ url, ...config })) {
        throw new Error('Request blocked for security reasons');
      }

      // Add security headers
      const secureConfig = {
        ...config,
        headers: this.security.addSecurityHeaders(config.headers)
      };

      // Make request
      const response = await this.axios.delete(url, secureConfig);
      
      // Validate response
      return this.security.validateResponse(response);
    } catch (error) {
      this.security.logSecurityEvent('API_DELETE_ERROR', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Upload file securely
   * @param {string} url - Upload endpoint
   * @param {FormData} formData - File data
   * @param {Object} config - Upload configuration
   * @returns {Promise} Upload response
   */
  async secureUpload(url, formData, config = {}) {
    try {
      // Validate file data
      if (!this.validateFileData(formData)) {
        throw new Error('Invalid file data');
      }

      // Security checks
      if (this.security.shouldBlockRequest({ url, ...config })) {
        throw new Error('Request blocked for security reasons');
      }

      // Add security headers
      const secureConfig = {
        ...config,
        headers: {
          ...this.security.addSecurityHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      };

      // Make request
      const response = await this.axios.post(url, formData, secureConfig);
      
      // Validate response
      return this.security.validateResponse(response);
    } catch (error) {
      this.security.logSecurityEvent('FILE_UPLOAD_ERROR', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Validate file data
   * @param {FormData} formData - File data
   * @returns {boolean} True if valid
   */
  validateFileData(formData) {
    try {
      // Check for files in form data
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Validate file size (max 10MB)
          if (value.size > 10 * 1024 * 1024) {
            return false;
          }
          
          // Validate file type
          const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv', 'text/plain'
          ];
          
          if (!allowedTypes.includes(value.type)) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('File validation error:', error);
      return false;
    }
  }

  /**
   * Get security events for monitoring
   * @returns {Array} Security events
   */
  getSecurityEvents() {
    return this.security.getSecurityEvents();
  }

  /**
   * Clear security events
   */
  clearSecurityEvents() {
    this.security.clearSecurityEvents();
  }

  /**
   * Get current security status
   * @returns {Object} Security status
   */
  getSecurityStatus() {
    return {
      tokenValid: !tokenManager.isTokenExpired(),
      securityEventsCount: this.security.getSecurityEvents().length,
      blockedUsersCount: this.security.blockedIPs.size,
      sessionId: this.security.getSessionId()
    };
  }
}

// Export singleton instance
export const enhancedSecureApiService = new EnhancedSecureApiService();
export default EnhancedSecureApiService;
