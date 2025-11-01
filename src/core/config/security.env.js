/**
 * Security Environment Configuration
 * Centralized security settings for the CRM application
 */

export const SECURITY_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: 'https://backend.leadstracker.in', // ALWAYS USE PRODUCTION
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    ENABLE_HTTPS: import.meta.env.NODE_ENV === 'production'
  },

  // Security Keys (should be set in environment variables)
  SECURITY_KEYS: {
    API_SECRET: import.meta.env.VITE_API_SECRET || 'default-secret-change-in-production',
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID || 'crm-web-client',
    ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key-32-chars'
  },

  // Request Signing Configuration
  REQUEST_SIGNING: {
    ENABLED: import.meta.env.VITE_ENABLE_REQUEST_SIGNING !== 'false',
    ALGORITHM: 'HMAC-SHA256',
    TIMESTAMP_TOLERANCE: 5 * 60 * 1000, // 5 minutes
    MAX_REQUEST_AGE: 10 * 60 * 1000 // 10 minutes
  },

  // Data Encryption Configuration
  DATA_ENCRYPTION: {
    ENABLED: import.meta.env.VITE_ENABLE_DATA_ENCRYPTION !== 'false',
    ALGORITHM: 'AES-256-CBC',
    SENSITIVE_FIELDS: [
      'password', 'passwd', 'pwd', 'secret', 'token', 'key',
      'email', 'phone', 'mobile', 'telephone', 'ssn', 'social',
      'credit', 'card', 'cvv', 'pin', 'otp', 'code',
      'address', 'street', 'city', 'zip', 'postal',
      'bank', 'account', 'routing', 'iban', 'swift'
    ]
  },

  // Rate Limiting Configuration
  RATE_LIMITING: {
    ENABLED: import.meta.env.VITE_ENABLE_RATE_LIMITING !== 'false',
    MAX_REQUESTS_PER_MINUTE: 100,
    MAX_REQUESTS_PER_HOUR: 1000,
    BURST_LIMIT: 10,
    TIME_WINDOW: 60 * 1000 // 1 minute
  },

  // Token Management Configuration
  TOKEN_MANAGEMENT: {
    STORAGE_KEY: 'crm_auth_token',
    REFRESH_KEY: 'crm_refresh_token',
    USER_KEY: 'crm_user_data',
    EXPIRY_KEY: 'crm_token_expiry',
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
    MAX_REFRESH_ATTEMPTS: 3
  },

  // Security Headers Configuration
  SECURITY_HEADERS: {
    CONTENT_SECURITY_POLICY: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://backend.leadstracker.in;",
    STRICT_TRANSPORT_SECURITY: 'max-age=31536000; includeSubDomains; preload',
    X_FRAME_OPTIONS: 'DENY',
    X_CONTENT_TYPE_OPTIONS: 'nosniff',
    X_XSS_PROTECTION: '1; mode=block',
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
    PERMISSIONS_POLICY: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  },

  // Monitoring Configuration
  MONITORING: {
    ENABLED: import.meta.env.VITE_ENABLE_SECURITY_MONITORING !== 'false',
    MAX_EVENTS: 1000,
    ALERT_THRESHOLDS: {
      FAILED_LOGIN_ATTEMPTS: 5,
      SUSPICIOUS_REQUESTS: 10,
      BLOCKED_REQUESTS: 20,
      SECURITY_THREAT_DETECTED: 1
    },
    REPORT_INTERVAL: 5 * 60 * 1000, // 5 minutes
    CLEANUP_INTERVAL: 60 * 60 * 1000 // 1 hour
  },

  // Input Validation Configuration
  INPUT_VALIDATION: {
    MAX_STRING_LENGTH: 10000,
    ALLOWED_FILE_TYPES: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv', 'text/plain'
    ],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    BLOCKED_PATTERNS: [
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
      /outerHTML/gi
    ]
  },

  // Allowed Domains
  ALLOWED_DOMAINS: [
    'leadstracker.in',
    'backend.leadstracker.in',
    'crm.leadstracker.in',
    'localhost',
    '127.0.0.1'
  ],

  // Development Settings
  DEVELOPMENT: {
    ENABLE_DEBUG_LOGS: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
    ENABLE_SECURITY_LOGS: import.meta.env.VITE_ENABLE_SECURITY_LOGS !== 'false',
    ENABLE_CONSOLE_WARNINGS: import.meta.env.NODE_ENV === 'development'
  }
};

// Validate security configuration
export function validateSecurityConfig() {
  const errors = [];

  // Check required environment variables
  if (!import.meta.env.VITE_API_SECRET || import.meta.env.VITE_API_SECRET === 'default-secret-change-in-production') {
    errors.push('VITE_API_SECRET must be set to a secure value');
  }

  if (!import.meta.env.VITE_ENCRYPTION_KEY || import.meta.env.VITE_ENCRYPTION_KEY === 'default-encryption-key-32-chars') {
    errors.push('VITE_ENCRYPTION_KEY must be set to a secure 32-character value');
  }

  // Validate encryption key length
  if (SECURITY_CONFIG.SECURITY_KEYS.ENCRYPTION_KEY.length < 32) {
    errors.push('Encryption key must be at least 32 characters long');
  }

  // Check HTTPS in production
  if (import.meta.env.NODE_ENV === 'production' && !SECURITY_CONFIG.API.BASE_URL.startsWith('https://')) {
    errors.push('API base URL must use HTTPS in production');
  }

  if (errors.length > 0) {
    console.error('Security configuration errors:', errors);
    if (import.meta.env.NODE_ENV === 'production') {
      throw new Error('Security configuration validation failed');
    }
  }

  return errors.length === 0;
}

// Initialize security configuration
export function initializeSecurityConfig() {
  const isValid = validateSecurityConfig();
  
  if (isValid) {
    console.log('Security configuration validated successfully');
  } else {
    console.warn('Security configuration has issues - check console for details');
  }

  return isValid;
}

export default SECURITY_CONFIG;
