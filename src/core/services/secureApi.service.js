// Secure API wrapper service
import axiosInstance from '../../legacy/api/axios';
import securityMiddleware from '../middleware/security.middleware';
import { securityUtils } from '../../legacy/api/axios';

/**
 * Secure API wrapper service with enhanced security features
 */
class SecureApiService {
  constructor() {
    this.axios = axiosInstance;
    this.security = securityMiddleware;
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
   * Make a secure PATCH request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise} API response
   */
  async securePatch(url, data = {}, config = {}) {
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
      const response = await this.axios.patch(url, sanitizedData, secureConfig);
      
      // Validate response
      return this.security.validateResponse(response);
    } catch (error) {
      this.security.logSecurityEvent('API_PATCH_ERROR', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Upload file securely
   * @param {string} url - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {Object} config - Request configuration
   * @returns {Promise} API response
   */
  async secureFileUpload(url, formData, config = {}) {
    try {
      // Security checks
      if (this.security.shouldBlockRequest({ url, ...config })) {
        throw new Error('Request blocked for security reasons');
      }

      // Validate file data
      if (!formData || !(formData instanceof FormData)) {
        throw new Error('Invalid file data');
      }

      // Add security headers
      const secureConfig = {
        ...config,
        headers: {
          ...this.security.addSecurityHeaders(config.headers),
          'Content-Type': 'multipart/form-data'
        }
      };

      // Make request
      const response = await this.axios.post(url, formData, secureConfig);
      
      // Validate response
      return this.security.validateResponse(response);
    } catch (error) {
      this.security.logSecurityEvent('API_FILE_UPLOAD_ERROR', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Batch multiple requests securely
   * @param {Array} requests - Array of request configurations
   * @returns {Promise} Array of responses
   */
  async secureBatch(requests) {
    try {
      const promises = requests.map(({ method, url, data, config }) => {
        switch (method.toLowerCase()) {
          case 'get':
            return this.secureGet(url, config);
          case 'post':
            return this.securePost(url, data, config);
          case 'put':
            return this.securePut(url, data, config);
          case 'delete':
            return this.secureDelete(url, config);
          case 'patch':
            return this.securePatch(url, data, config);
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      this.security.logSecurityEvent('API_BATCH_ERROR', { error: error.message });
      throw error;
    }
  }

  /**
   * Get security status
   * @returns {Object} Security status information
   */
  getSecurityStatus() {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      isSecure: window.location.protocol === 'https:',
      hasValidToken: !!localStorage.getItem('token'),
      securityFeatures: {
        rateLimiting: true,
        requestValidation: true,
        responseValidation: true,
        headerSecurity: true,
        dataSanitization: true
      }
    };
  }
}

// Create singleton instance
const secureApiService = new SecureApiService();

export default secureApiService;
