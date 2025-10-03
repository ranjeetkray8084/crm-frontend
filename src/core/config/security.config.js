// Security configuration for different environments
export const securityConfig = {
  // Production environment
  production: {
    api: {
      baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083') + '/api',
      timeout: 30000,
      maxRetries: 3,
      enableHTTPS: true,
      enableRateLimiting: true,
      maxRequestsPerMinute: 100
    },
    security: {
      enableRequestValidation: true,
      enableResponseValidation: true,
      enableHeaderSecurity: true,
      enableDataSanitization: true,
      enableXSSProtection: true,
      enableCSRFProtection: true,
      enableContentSecurityPolicy: true
    },
    logging: {
      enableDebugMode: false,
      enableConsoleLogs: false,
      enableNetworkLogs: false,
      enableSecurityLogs: true
    },
    build: {
      enableSourceMaps: false,
      enableMinification: true,
      enableCompression: true
    }
  },

  // Development environment
  development: {
    api: {
      baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083'),
      timeout: 30000,
      maxRetries: 3,
      enableHTTPS: false,
      enableRateLimiting: true,
      maxRequestsPerMinute: 1000
    },
    security: {
      enableRequestValidation: true,
      enableResponseValidation: true,
      enableHeaderSecurity: true,
      enableDataSanitization: true,
      enableXSSProtection: true,
      enableCSRFProtection: false,
      enableContentSecurityPolicy: false
    },
    logging: {
      enableDebugMode: true,
      enableConsoleLogs: true,
      enableNetworkLogs: true,
      enableSecurityLogs: true
    },
    build: {
      enableSourceMaps: true,
      enableMinification: false,
      enableCompression: false
    }
  }
};

// Get current environment configuration
export const getCurrentSecurityConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return securityConfig[env] || securityConfig.development;
};

// Security constants
export const SECURITY_CONSTANTS = {
  // Rate limiting
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 100,
  
  // Request validation
  MAX_REQUEST_SIZE: 10485760, // 10MB
  MAX_FIELD_LENGTH: 10000,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILE_SIZE: 5242880, // 5MB
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },
  
  // Suspicious patterns
  SUSPICIOUS_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /eval\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /location\./gi
  ],
  
  // Blocked field names
  BLOCKED_FIELD_NAMES: [
    '__proto__',
    'constructor',
    'prototype',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf'
  ]
};

// Security utility functions
export const securityUtils = {
  // Check if current environment is production
  isProduction: () => process.env.NODE_ENV === 'production',
  
  // Check if HTTPS is enabled
  isHTTPSEnabled: () => {
    const config = getCurrentSecurityConfig();
    return config.api.enableHTTPS;
  },
  
  // Check if security feature is enabled
  isSecurityFeatureEnabled: (feature) => {
    const config = getCurrentSecurityConfig();
    return config.security[feature] || false;
  },
  
  // Get API base URL based on environment
  getApiBaseURL: () => {
    const config = getCurrentSecurityConfig();
    return config.api.baseURL;
  },
  
  // Validate URL security
  isSecureURL: (url) => {
    if (!url) return false;
    
    // Block suspicious protocols
    const blockedProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
    if (blockedProtocols.some(protocol => url.toLowerCase().startsWith(protocol))) {
      return false;
    }
    
    // Force HTTPS in production
    if (securityUtils.isProduction() && !url.startsWith('https://')) {
      return false;
    }
    
    return true;
  },
  
  // Generate secure random string
  generateSecureRandom: (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Hash sensitive data (basic implementation)
  hashData: (data) => {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    
    // Simple hash function - in production, use proper cryptographic hashing
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
};

export default securityConfig;
