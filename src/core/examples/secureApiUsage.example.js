// Example: How to use Secure API Service instead of direct axios calls
// This demonstrates the security features and best practices

import secureApiService from '../services/secureApi.service';
import securityMiddleware from '../middleware/security.middleware';
import { securityUtils } from '../config/security.config';

// ❌ OLD WAY - Direct axios calls (less secure)
// import axios from '../../legacy/api/axios';
// const response = await axios.post('/api/auth/login', credentials);

// ✅ NEW WAY - Using Secure API Service (more secure)

/**
 * Example 1: Secure Authentication
 */
export const secureLoginExample = async (credentials) => {
  try {
    // The secure API service automatically:
    // - Validates request data
    // - Adds security headers
    // - Sanitizes input
    // - Checks for suspicious patterns
    // - Applies rate limiting
    // - Validates responses
    
    const response = await secureApiService.securePost('/api/auth/login', credentials);
    
    // Response is automatically validated and sanitized
    return response.data;
  } catch (error) {
    // Security errors are logged automatically
    throw error;
  }
};

/**
 * Example 2: Secure Data Fetching
 */
export const secureDataFetchExample = async (userId) => {
  try {
    // Secure GET request with automatic validation
    const userData = await secureApiService.secureGet(`/api/users/${userId}`);
    
    // Data is automatically sanitized and validated
    return userData.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Example 3: Secure File Upload
 */
export const secureFileUploadExample = async (file, userId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    // Secure file upload with validation
    const response = await secureApiService.secureFileUpload('/api/users/upload-avatar', formData);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Example 4: Using Security Middleware Directly
 */
export const securityMiddlewareExample = (userInput) => {
  // Sanitize user input before processing
  const sanitizedInput = securityMiddleware.sanitizeRequestData(userInput);
  
  // Add security headers to custom requests
  const secureHeaders = securityMiddleware.addSecurityHeaders({
    'Custom-Header': 'value'
  });
  
  // Validate API response
  const validatedResponse = securityMiddleware.validateResponse({
    data: { message: 'Success' }
  });
  
  return {
    sanitizedInput,
    secureHeaders,
    validatedResponse
  };
};

/**
 * Example 5: Using Security Utils
 */
export const securityUtilsExample = () => {
  // Check if HTTPS is enabled
  const isHTTPS = securityUtils.isHTTPSEnabled();
  
  // Validate URL security
  const isSecureURL = securityUtils.isSecureURL('https://api.example.com');
  
  // Generate secure random string
  const randomString = securityUtils.generateSecureRandom(32);
  
  // Hash sensitive data
  const hashedData = securityUtils.hashData('sensitive information');
  
  return {
    isHTTPS,
    isSecureURL,
    randomString,
    hashedData
  };
};

/**
 * Example 6: Batch Secure Requests
 */
export const batchSecureRequestsExample = async () => {
  try {
    const requests = [
      { method: 'GET', url: '/api/users' },
      { method: 'POST', url: '/api/notifications', data: { message: 'Hello' } },
      { method: 'GET', url: '/api/stats' }
    ];
    
    // Execute multiple requests securely
    const responses = await secureApiService.secureBatch(requests);
    
    return responses;
  } catch (error) {
    throw error;
  }
};

/**
 * Example 7: Get Security Status
 */
export const getSecurityStatusExample = () => {
  // Get current security status
  const status = secureApiService.getSecurityStatus();
  
  console.log('Security Status:', status);
  /*
  Output:
  {
    timestamp: "2024-01-01T00:00:00.000Z",
    userAgent: "Mozilla/5.0...",
    url: "https://yourapp.com",
    isSecure: true,
    hasValidToken: true,
    securityFeatures: {
      rateLimiting: true,
      requestValidation: true,
      responseValidation: true,
      headerSecurity: true,
      dataSanitization: true
    }
  }
  */
  
  return status;
};

/**
 * Example 8: Migration Guide - Converting Existing Code
 */
export const migrationGuideExample = {
  // BEFORE (Less Secure)
  before: `
    // Old way - direct axios
    import axios from '../../legacy/api/axios';
    
    const login = async (credentials) => {
      const response = await axios.post('/api/auth/login', credentials);
      return response.data;
    };
  `,
  
  // AFTER (More Secure)
  after: `
    // New way - secure API service
    import secureApiService from '../services/secureApi.service';
    
    const login = async (credentials) => {
      const response = await secureApiService.securePost('/api/auth/login', credentials);
      return response.data;
    };
  `,
  
  // Benefits of migration:
  benefits: [
    'Automatic request validation',
    'Data sanitization',
    'Rate limiting',
    'Security headers',
    'Response validation',
    'Security logging',
    'XSS protection',
    'CSRF protection'
  ]
};

/**
 * Example 9: Error Handling with Security
 */
export const secureErrorHandlingExample = async () => {
  try {
    const response = await secureApiService.secureGet('/api/sensitive-data');
    return response.data;
  } catch (error) {
    // Security errors are automatically logged
    if (error.message.includes('Request blocked for security reasons')) {
      console.error('Security violation detected');
      // Handle security violation
    } else if (error.message.includes('Rate limit exceeded')) {
      console.error('Too many requests');
      // Handle rate limiting
    } else {
      console.error('API error:', error.message);
      // Handle other errors
    }
    
    throw error;
  }
};

/**
 * Example 10: Custom Security Configuration
 */
export const customSecurityConfigExample = () => {
  // You can customize security settings per request
  const customConfig = {
    headers: {
      'Custom-Security-Header': 'value'
    },
    timeout: 60000, // Custom timeout
    retry: 5 // Custom retry count
  };
  
  // Use custom config with secure API
  return secureApiService.secureGet('/api/custom-endpoint', customConfig);
};

// Export all examples
export default {
  secureLoginExample,
  secureDataFetchExample,
  secureFileUploadExample,
  securityMiddlewareExample,
  securityUtilsExample,
  batchSecureRequestsExample,
  getSecurityStatusExample,
  migrationGuideExample,
  secureErrorHandlingExample,
  customSecurityConfigExample
};
