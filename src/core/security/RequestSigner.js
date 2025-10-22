import { 
  generateHMAC, 
  generateRandomString, 
  generateRequestId,
  validateHMAC 
} from '../utils/cryptoUtils.js';

/**
 * Request Signing Service for API Security
 * Prevents request tampering and ensures data integrity
 */
class RequestSigner {
  constructor() {
    this.secretKey = import.meta.env.VITE_API_SECRET || 'default-secret-key-change-in-production';
    this.clientId = import.meta.env.VITE_CLIENT_ID || 'crm-web-client';
    
    // Validate secret key
    if (this.secretKey === 'default-secret-key-change-in-production') {
      console.warn('⚠️ Using default API secret. Please set VITE_API_SECRET environment variable for production.');
    }
  }

  /**
   * Generate HMAC signature for request
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request payload
   * @param {number} timestamp - Request timestamp
   * @returns {string} HMAC signature
   */
  generateSignature(method, url, data, timestamp) {
    try {
      // Create payload string
      const payload = this.createPayload(method, url, data, timestamp);
      
      // Generate HMAC-SHA256 signature using crypto utils
      const signature = generateHMAC(payload, this.secretKey);
      
      return signature;
    } catch (error) {
      console.error('Error generating signature:', error);
      throw new Error('Failed to generate request signature');
    }
  }

  /**
   * Create standardized payload for signing
   * @param {string} method - HTTP method
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {number} timestamp - Timestamp
   * @returns {string} Payload string
   */
  createPayload(method, url, data, timestamp) {
    // Sort data keys for consistent signature generation
    const sortedData = data ? this.sortObjectKeys(data) : {};
    const dataString = JSON.stringify(sortedData);
    
    return `${method.toUpperCase()}|${url}|${dataString}|${timestamp}`;
  }

  /**
   * Sort object keys recursively for consistent ordering
   * @param {Object} obj - Object to sort
   * @returns {Object} Sorted object
   */
  sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = this.sortObjectKeys(obj[key]);
    });

    return sorted;
  }

  /**
   * Validate response signature
   * @param {Object} response - API response
   * @param {string} expectedSignature - Expected signature
   * @returns {boolean} True if signature is valid
   */
  validateResponseSignature(response, expectedSignature) {
    try {
      const responseData = response.data || {};
      const timestamp = response.headers['x-response-timestamp'];
      
      if (!timestamp) {
        return false;
      }

      const payload = this.createPayload('RESPONSE', '', responseData, parseInt(timestamp));
      const calculatedSignature = generateHMAC(payload, this.secretKey);
      
      return calculatedSignature === expectedSignature;
    } catch (error) {
      console.error('Error validating response signature:', error);
      return false;
    }
  }

  /**
   * Generate nonce for replay protection
   * @returns {string} Unique nonce
   */
  generateNonce() {
    return generateRandomString(16);
  }

  /**
   * Get security headers for API requests
   * @param {string} method - HTTP method
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @returns {Object} Security headers
   */
  getSecurityHeaders(method, url, data) {
    const timestamp = Date.now();
    const nonce = this.generateNonce();
    const signature = this.generateSignature(method, url, data, timestamp);

    return {
      'X-Client-ID': this.clientId,
      'X-Request-Timestamp': timestamp.toString(),
      'X-Request-Nonce': nonce,
      'X-Request-Signature': signature,
      'X-Client-Version': '1.0.0',
      'X-Platform': 'web',
      'X-Request-ID': this.generateRequestId()
    };
  }

  /**
   * Generate unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    return generateRequestId();
  }

  /**
   * Check if request is expired (older than 5 minutes)
   * @param {number} timestamp - Request timestamp
   * @returns {boolean} True if expired
   */
  isRequestExpired(timestamp) {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    return (now - timestamp) > fiveMinutes;
  }
}

// Export singleton instance
export const requestSigner = new RequestSigner();
export default RequestSigner;
