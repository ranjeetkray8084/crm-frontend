// Enhanced Security middleware for API requests
import { securityUtils } from '../../legacy/api/axios';
import { dataEncryption } from '../security/DataEncryption.js';

/**
 * Enhanced Security middleware class for API requests
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
      /expression\s*\(/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi,
      /window\.location/gi,
      /document\.write/gi,
      /innerHTML/gi,
      /outerHTML/gi,
      /alert\s*\(/gi,
      /confirm\s*\(/gi,
      /prompt\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,
      /new\s+Function/gi,
      /import\s*\(/gi,
      /require\s*\(/gi,
      /process\.env/gi,
      /__proto__/gi,
      /constructor/gi,
      /prototype/gi
    ];

    // SQL injection patterns
    this.sqlInjectionPatterns = [
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+set/gi,
      /alter\s+table/gi,
      /create\s+table/gi,
      /exec\s*\(/gi,
      /execute\s*\(/gi,
      /sp_executesql/gi,
      /xp_cmdshell/gi,
      /';\s*drop/gi,
      /'\s*or\s*1\s*=\s*1/gi,
      /'\s*or\s*'1'\s*=\s*'1/gi,
      /'\s*union\s*select/gi
    ];

    // XSS patterns
    this.xssPatterns = [
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi,
      /<style/gi,
      /<form/gi,
      /<input/gi,
      /<textarea/gi,
      /<select/gi,
      /<option/gi,
      /<button/gi,
      /<img\s+[^>]*onerror/gi,
      /<svg\s+[^>]*onload/gi,
      /<body\s+[^>]*onload/gi,
      /<div\s+[^>]*onclick/gi,
      /<a\s+[^>]*onclick/gi
    ];

    this.securityEvents = [];
    this.maxSecurityEvents = 1000;
  }

  /**
   * Validate and sanitize request data with enhanced security
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
        // Enhanced sanitization
        const sanitizedValue = this.sanitizeValue(value);

        // Check for additional security threats
        if (this.detectSecurityThreats(key, sanitizedValue)) {
          this.logSecurityEvent('SECURITY_THREAT_DETECTED', {
            field: key,
            value: typeof sanitizedValue === 'string' ? sanitizedValue.substring(0, 100) : sanitizedValue,
            threat: 'Malicious content detected'
          });
          continue; // Skip this field
        }

        // Encrypt sensitive fields
        if (this.isSensitiveField(key)) {
          sanitized[key] = dataEncryption.encrypt(sanitizedValue);
          sanitized[`${key}_encrypted`] = true;
        } else {
          sanitized[key] = sanitizedValue;
        }
      } else {
        this.logSecurityEvent('INVALID_FIELD_REJECTED', {
          field: key,
          reason: !this.isValidField(key) ? 'Invalid field name' : 'Invalid field value'
        });
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
   * Enhanced sanitize individual value
   * @param {any} value - Value to sanitize
   * @returns {any} Sanitized value
   */
  sanitizeValue(value) {
    if (typeof value === 'string') {
      // Remove HTML tags and attributes
      value = value.replace(/<[^>]*>/g, '');
      value = value.replace(/<[^>]*$/g, ''); // Remove incomplete tags

      // Remove suspicious characters and patterns
      value = value.replace(/[<>\"'&]/g, '');
      value = value.replace(/javascript:/gi, '');
      value = value.replace(/vbscript:/gi, '');
      value = value.replace(/data:/gi, '');
      value = value.replace(/on\w+\s*=/gi, '');

      // Remove SQL injection patterns
      this.sqlInjectionPatterns.forEach(pattern => {
        value = value.replace(pattern, '');
      });

      // Remove XSS patterns
      this.xssPatterns.forEach(pattern => {
        value = value.replace(pattern, '');
      });

      // Remove suspicious JavaScript functions
      this.suspiciousPatterns.forEach(pattern => {
        value = value.replace(pattern, '');
      });

      // Decode HTML entities
      value = value.replace(/&lt;/g, '<');
      value = value.replace(/&gt;/g, '>');
      value = value.replace(/&amp;/g, '&');
      value = value.replace(/&quot;/g, '"');
      value = value.replace(/&#x27;/g, "'");
      value = value.replace(/&#x2F;/g, '/');

      // Remove null bytes and control characters
      value = value.replace(/\0/g, '');
      value = value.replace(/[\x00-\x1F\x7F]/g, '');

      // Trim whitespace
      value = value.trim();
    }

    return value;
  }

  /**
   * Detect security threats in field data
   * @param {string} fieldName - Field name
   * @param {any} value - Field value
   * @returns {boolean} True if threat detected
   */
  detectSecurityThreats(fieldName, value) {
    if (typeof value !== 'string') {
      return false;
    }

    // Check for script injection
    if (this.suspiciousPatterns.some(pattern => pattern.test(value))) {
      return true;
    }

    // Check for SQL injection
    if (this.sqlInjectionPatterns.some(pattern => pattern.test(value))) {
      return true;
    }

    // Check for XSS
    if (this.xssPatterns.some(pattern => pattern.test(value))) {
      return true;
    }

    // Check for suspicious file paths
    if (value.includes('..') || value.includes('/etc/') || value.includes('/var/')) {
      return true;
    }

    // Check for suspicious URLs
    if (value.match(/https?:\/\/[^\s]+/) && !this.isAllowedDomain(value)) {
      return true;
    }

    return false;
  }

  /**
   * Check if field contains sensitive data
   * @param {string} fieldName - Field name
   * @returns {boolean} True if sensitive
   */
  isSensitiveField(fieldName) {
    const sensitiveFields = [
      'password', 'passwd', 'pwd', 'secret', 'token', 'key',
      'email', 'phone', 'mobile', 'telephone', 'ssn', 'social',
      'credit', 'card', 'cvv', 'pin', 'otp', 'code',
      'address', 'street', 'city', 'zip', 'postal',
      'bank', 'account', 'routing', 'iban', 'swift'
    ];

    return sensitiveFields.some(field =>
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  /**
   * Check if domain is allowed
   * @param {string} value - Value containing URL
   * @returns {boolean} True if domain is allowed
   */
  isAllowedDomain(value) {
    const allowedDomains = [
      'leadstracker.in',
      'app.leadstracker.in',
      'crm.leadstracker.in',
      'localhost',
      '127.0.0.1'
    ];

    const urlMatch = value.match(/https?:\/\/([^\/\s]+)/);
    if (!urlMatch) return false;

    const domain = urlMatch[1];
    return allowedDomains.some(allowed => domain.includes(allowed));
  }

  /**
   * Add comprehensive security headers to request
   * @param {Object} headers - Request headers
   * @returns {Object} Enhanced headers
   */
  addSecurityHeaders(headers = {}) {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://app.leadstracker.in;",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Request-ID': this.generateRequestId(),
      'X-Timestamp': Date.now().toString()
    };

    return {
      ...headers,
      ...securityHeaders
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
   * Enhanced log security event
   * @param {string} eventType - Security event type
   * @param {Object} details - Event details
   */
  logSecurityEvent(eventType, details = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      details: details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    this.securityEvents.push(event);

    // Keep only last N events
    if (this.securityEvents.length > this.maxSecurityEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxSecurityEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event);
    }

    // Send to security monitoring service
    this.sendSecurityEvent(event);
  }

  /**
   * Send security event to monitoring service
   * @param {Object} event - Security event
   */
  async sendSecurityEvent(event) {
    try {
      // Only send critical security events to avoid spam
      const criticalEvents = [
        'SECURITY_THREAT_DETECTED',
        'SUSPICIOUS_REQUEST',
        'MALICIOUS_CONTENT',
        'UNAUTHORIZED_ACCESS_ATTEMPT'
      ];

      if (criticalEvents.includes(event.type)) {
        console.warn('Critical security event detected:', event);
      }
    } catch (error) {
      console.error('Error sending security event:', error);
    }
  }

  /**
   * Get session ID
   * @returns {string} Session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('crm_session_id');
    if (!sessionId) {
      // Import generateSessionId dynamically to avoid circular imports
      import('../utils/cryptoUtils.js').then(({ generateSessionId }) => {
        sessionId = generateSessionId();
        sessionStorage.setItem('crm_session_id', sessionId);
      }).catch(() => {
        // Fallback if import fails
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('crm_session_id', sessionId);
      });
    }
    return sessionId;
  }

  /**
   * Validate request integrity
   * @param {Object} config - Request configuration
   * @returns {boolean} True if request is valid
   */
  validateRequestIntegrity(config) {
    try {
      // Check for required headers
      const requiredHeaders = ['X-Client-Version', 'X-Platform', 'X-Request-Timestamp'];
      const missingHeaders = requiredHeaders.filter(header => !config.headers?.[header]);

      if (missingHeaders.length > 0) {
        this.logSecurityEvent('MISSING_SECURITY_HEADERS', { missingHeaders, config });
        return false;
      }

      // Check for suspicious URL modifications
      if (config.url && config.url.includes('localhost') && process.env.NODE_ENV === 'production') {
        this.logSecurityEvent('SUSPICIOUS_URL_DETECTED', { url: config.url });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating request integrity:', error);
      return false;
    }
  }

  /**
   * Get security events for monitoring
   * @returns {Array} Security events
   */
  getSecurityEvents() {
    return [...this.securityEvents];
  }

  /**
   * Clear security events
   */
  clearSecurityEvents() {
    this.securityEvents = [];
  }

  /**
   * Block suspicious IP or user
   * @param {string} identifier - IP or user identifier
   */
  blockUser(identifier) {
    this.blockedIPs.add(identifier);
    this.logSecurityEvent('USER_BLOCKED', { identifier, reason: 'Suspicious activity detected' });
  }

  /**
   * Check if user is blocked
   * @param {string} identifier - IP or user identifier
   * @returns {boolean} True if blocked
   */
  isUserBlocked(identifier) {
    return this.blockedIPs.has(identifier);
  }

  /**
   * Unblock user
   * @param {string} identifier - IP or user identifier
   */
  unblockUser(identifier) {
    this.blockedIPs.delete(identifier);
    this.logSecurityEvent('USER_UNBLOCKED', { identifier });
  }
}

// Create singleton instance
const securityMiddleware = new SecurityMiddleware();

export default securityMiddleware;
