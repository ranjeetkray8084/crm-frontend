// Security middleware for API requests
import { securityUtils } from '../../legacy/api/axios';

/**
 * Security middleware class for API requests
 */
class SecurityMiddleware {
  constructor() {
    this.blockedIPs = new Set();
    this.suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi
    ];
  }

  /**
   * Validate and sanitize request data
   * @param {Object} data - Request data
   * @returns {Object} Sanitized data
   */
  sanitizeRequestData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.isValidField(key) && this.isValidValue(value)) {
        sanitized[key] = this.sanitizeValue(value);
      }
    }

    return sanitized;
  }

  /**
   * Check if field name is valid
   * @param {string} fieldName - Field name to validate
   * @returns {boolean} True if valid
   */
  isValidField(fieldName) {
    if (typeof fieldName !== 'string') return false;
    
    // Block suspicious field names
    const suspiciousFields = ['__proto__', 'constructor', 'prototype'];
    if (suspiciousFields.includes(fieldName)) return false;
    
    // Block fields with suspicious patterns
    if (this.suspiciousPatterns.some(pattern => pattern.test(fieldName))) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if value is valid
   * @param {any} value - Value to validate
   * @returns {boolean} True if valid
   */
  isValidValue(value) {
    if (value === null || value === undefined) return false;
    
    // Block suspicious values
    if (typeof value === 'string') {
      if (this.suspiciousPatterns.some(pattern => pattern.test(value))) {
        return false;
      }
      
      // Block extremely long strings
      if (value.length > 10000) return false;
    }
    
    return true;
  }

  /**
   * Sanitize individual value
   * @param {any} value - Value to sanitize
   * @returns {any} Sanitized value
   */
  sanitizeValue(value) {
    if (typeof value === 'string') {
      // Remove HTML tags
      value = value.replace(/<[^>]*>/g, '');
      
      // Remove suspicious characters
      value = value.replace(/[<>\"'&]/g, '');
      
      // Trim whitespace
      value = value.trim();
    }
    
    return value;
  }

  /**
   * Add security headers to request
   * @param {Object} headers - Request headers
   * @returns {Object} Enhanced headers
   */
  addSecurityHeaders(headers = {}) {
    return {
      ...headers,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'X-Request-ID': this.generateRequestId(),
      'X-Timestamp': Date.now().toString()
    };
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate API response
   * @param {Object} response - API response
   * @returns {Object} Validated response
   */
  validateResponse(response) {
    if (!response) {
      throw new Error('Invalid response received');
    }

    // Check for suspicious content in response
    if (response.data && typeof response.data === 'object') {
      const dataStr = JSON.stringify(response.data);
      if (this.suspiciousPatterns.some(pattern => pattern.test(dataStr))) {
        throw new Error('Suspicious content detected in response');
      }
    }

    return response;
  }

  /**
   * Check if request should be blocked
   * @param {Object} requestConfig - Request configuration
   * @returns {boolean} True if should be blocked
   */
  shouldBlockRequest(requestConfig) {
    // Block requests to suspicious URLs
    if (requestConfig.url) {
      const suspiciousUrls = [
        /javascript:/,
        /data:text\/html/,
        /vbscript:/,
        /file:\/\//,
        /ftp:\/\//
      ];
      
      if (suspiciousUrls.some(pattern => pattern.test(requestConfig.url))) {
        return true;
      }
    }

    // Block requests with suspicious headers
    if (requestConfig.headers) {
      const suspiciousHeaders = [
        'X-Forwarded-For',
        'X-Real-IP',
        'X-Forwarded-Host'
      ];
      
      if (suspiciousHeaders.some(header => requestConfig.headers[header])) {
        return true;
      }
    }

    return false;
  }

  /**
   * Log security event
   * @param {string} event - Security event type
   * @param {Object} details - Event details
   */
  logSecurityEvent(event, details = {}) {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to security monitoring (implement as needed)
    } else {
      // Security event logged in development
    }
  }
}

// Create singleton instance
const securityMiddleware = new SecurityMiddleware();

export default securityMiddleware;
