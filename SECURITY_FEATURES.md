# CRM Frontend Security Features

## Overview
This document outlines the comprehensive security measures implemented in the CRM Frontend application to protect against various security threats and vulnerabilities.

## ⚠️ Important Note
**Client-side API calls will always be visible in the browser's network tab** - this is a fundamental limitation of web browsers and cannot be completely hidden. However, we have implemented multiple layers of security to protect your data and API endpoints.

## 🔒 Security Layers Implemented

### 1. Enhanced Axios Configuration (`src/legacy/api/axios.js`)
- **HTTPS Enforcement**: Forces HTTPS in production environment
- **Rate Limiting**: Client-side rate limiting (100 requests per minute)
- **Request Validation**: Validates all outgoing requests
- **Response Validation**: Validates all incoming responses
- **Retry Mechanism**: Automatic retry with exponential backoff
- **Security Headers**: Adds security headers to all requests
- **Data Sanitization**: Removes sensitive data from requests/responses
- **Token Security**: Secure JWT token handling

### 2. Security Middleware (`src/core/middleware/security.middleware.js`)
- **Request Validation**: Validates request data and headers
- **Data Sanitization**: Removes malicious content and HTML tags
- **Pattern Detection**: Blocks suspicious patterns (XSS, injection attacks)
- **Field Validation**: Blocks dangerous field names
- **Security Logging**: Logs security events for monitoring
- **Request Blocking**: Blocks suspicious requests before they're sent

### 3. Secure API Service (`src/core/services/secureApi.service.js`)
- **Secure Wrapper**: Wraps all API calls with security checks
- **Method Security**: Secure GET, POST, PUT, DELETE, PATCH methods
- **File Upload Security**: Secure file upload with validation
- **Batch Request Security**: Secure batch API operations
- **Error Handling**: Secure error handling without exposing sensitive data

### 4. Security Configuration (`src/core/config/security.config.js`)
- **Environment-based Security**: Different security levels for dev/prod
- **Configurable Features**: Enable/disable security features as needed
- **Security Constants**: Centralized security constants and patterns
- **Utility Functions**: Security utility functions for common operations

### 5. Enhanced Vite Configuration (`vite.config.js`)
- **Production Security**: Disables source maps and debug features in production
- **Code Obfuscation**: Obfuscates variable names in production builds
- **Console Removal**: Removes console.log statements in production
- **Security Headers**: Adds security headers to dev server and preview
- **Build Optimization**: Optimizes builds for security and performance

## 🛡️ Security Features

### Request Security
- ✅ HTTPS enforcement in production
- ✅ Request rate limiting
- ✅ Request data validation
- ✅ Request header security
- ✅ Suspicious URL blocking
- ✅ Malicious pattern detection

### Response Security
- ✅ Response data validation
- ✅ Sensitive data removal
- ✅ XSS protection
- ✅ Content type validation
- ✅ Response size limits

### Authentication Security
- ✅ JWT token validation
- ✅ Secure token storage
- ✅ Automatic token refresh
- ✅ Secure logout handling
- ✅ Session management

### Data Security
- ✅ Input sanitization
- ✅ Output encoding
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection

### Network Security
- ✅ CORS configuration
- ✅ Security headers
- ✅ Referrer policy
- ✅ Content security policy
- ✅ Permissions policy

## 🚀 Usage Examples

### Using Secure API Service
```javascript
import secureApiService from '../core/services/secureApi.service';

// Secure GET request
const data = await secureApiService.secureGet('/api/users');

// Secure POST request with data validation
const response = await secureApiService.securePost('/api/users', userData);

// Secure file upload
const uploadResponse = await secureApiService.secureFileUpload('/api/upload', formData);
```

### Using Security Middleware
```javascript
import securityMiddleware from '../core/middleware/security.middleware';

// Sanitize request data
const sanitizedData = securityMiddleware.sanitizeRequestData(userInput);

// Add security headers
const secureHeaders = securityMiddleware.addSecurityHeaders(existingHeaders);

// Validate response
const validatedResponse = securityMiddleware.validateResponse(apiResponse);
```

### Using Security Utils
```javascript
import { securityUtils } from '../core/config/security.config';

// Check if HTTPS is enabled
if (securityUtils.isHTTPSEnabled()) {
  // Force HTTPS
}

// Validate URL security
if (securityUtils.isSecureURL(url)) {
  // Proceed with request
}

// Generate secure random string
const randomString = securityUtils.generateSecureRandom(32);
```

## 🔧 Configuration

### Environment Variables
```bash
# Production
NODE_ENV=production
VITE_API_BASE_URL=https://backend.leadstracker.in/api
VITE_ENABLE_HTTPS=true
VITE_ENABLE_RATE_LIMITING=true

# Development
NODE_ENV=development
VITE_API_BASE_URL=https://backend.leadstracker.in
VITE_ENABLE_HTTPS=false
VITE_ENABLE_DEBUG_MODE=true
```

### Security Settings
```javascript
// Enable/disable security features
const config = {
  api: {
    enableHTTPS: true,
    enableRateLimiting: true,
    maxRequestsPerMinute: 100
  },
  security: {
    enableRequestValidation: true,
    enableResponseValidation: true,
    enableHeaderSecurity: true,
    enableDataSanitization: true
  }
};
```

## 📊 Security Monitoring

### Security Events Logged
- API request/response errors
- Suspicious request patterns
- Rate limit violations
- Security header violations
- Data validation failures

### Security Status
```javascript
// Get current security status
const status = secureApiService.getSecurityStatus();
console.log(status);
// Output:
// {
//   timestamp: "2024-01-01T00:00:00.000Z",
//   isSecure: true,
//   hasValidToken: true,
//   securityFeatures: {
//     rateLimiting: true,
//     requestValidation: true,
//     responseValidation: true,
//     headerSecurity: true,
//     dataSanitization: true
//   }
// }
```

## 🚨 Security Best Practices

### For Developers
1. **Always use secure API methods** instead of direct axios calls
2. **Validate all user input** before sending to API
3. **Never log sensitive data** to console
4. **Use HTTPS in production** environments
5. **Implement proper error handling** without exposing internals

### For Production
1. **Enable all security features** in production
2. **Monitor security logs** regularly
3. **Keep dependencies updated** to latest secure versions
4. **Use strong authentication** and authorization
5. **Implement rate limiting** on backend

### For Users
1. **Use strong passwords** and enable 2FA if available
2. **Keep browser updated** to latest version
3. **Be cautious of phishing** attempts
4. **Log out properly** when done using the application
5. **Report suspicious activity** to administrators

## 🔍 Security Testing

### Manual Testing
1. **Network Tab**: Check that requests use HTTPS in production
2. **Console**: Verify no sensitive data is logged
3. **Headers**: Check security headers are present
4. **Rate Limiting**: Test rate limiting functionality
5. **Input Validation**: Test with malicious input

### Automated Testing
1. **Security Headers**: Verify security headers are set
2. **Input Sanitization**: Test with XSS payloads
3. **Rate Limiting**: Test rate limit enforcement
4. **Authentication**: Test token validation
5. **Error Handling**: Test error response security

## 📚 Additional Resources

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Security Tools
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Checklist](https://securitychecklist.org/)

## 🤝 Support

If you have security concerns or need assistance:
1. **Check security logs** for any issues
2. **Review security configuration** for your environment
3. **Test security features** in development
4. **Contact security team** for critical issues

---

**Remember**: Security is an ongoing process. Regularly review and update security measures to protect against new threats and vulnerabilities.
