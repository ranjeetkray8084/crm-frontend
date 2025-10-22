/**
 * Security Initializer
 * Initializes all security features for the CRM application
 */

import { SECURITY_CONFIG, initializeSecurityConfig } from '../config/security.env.js';
import { tokenManager } from './TokenManager.js';
import { securityMonitor } from './SecurityMonitor.js';
import { requestSigner } from './RequestSigner.js';
import { dataEncryption } from './DataEncryption.js';
import securityMiddleware from '../middleware/security.middleware.js';

class SecurityInitializer {
  constructor() {
    this.initialized = false;
    this.initializationPromise = null;
  }

  /**
   * Initialize all security features
   * @returns {Promise<boolean>} True if initialization successful
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  /**
   * Perform the actual initialization
   * @returns {Promise<boolean>} True if successful
   */
  async _performInitialization() {
    try {
      console.log('🔒 Initializing security features...');

      // 1. Validate security configuration
      if (!initializeSecurityConfig()) {
        throw new Error('Security configuration validation failed');
      }

      // 2. Initialize token manager
      await this._initializeTokenManager();

      // 3. Initialize security monitoring
      await this._initializeSecurityMonitoring();

      // 4. Initialize request signing
      await this._initializeRequestSigning();

      // 5. Initialize data encryption
      await this._initializeDataEncryption();

      // 6. Initialize security middleware
      await this._initializeSecurityMiddleware();

      // 7. Setup global security handlers
      await this._setupGlobalSecurityHandlers();

      // 8. Initialize security monitoring dashboard
      await this._initializeSecurityDashboard();

      this.initialized = true;
      console.log('✅ Security features initialized successfully');

      // Log security initialization event
      securityMonitor.logEvent('SECURITY_INITIALIZED', {
        timestamp: Date.now(),
        features: [
          'Token Management',
          'Request Signing',
          'Data Encryption',
          'Security Monitoring',
          'Input Validation',
          'Security Headers'
        ]
      });

      return true;

    } catch (error) {
      console.error('❌ Security initialization failed:', error);
      
      // Log initialization failure
      securityMonitor.logEvent('SECURITY_INITIALIZATION_FAILED', {
        error: error.message,
        timestamp: Date.now()
      });

      return false;
    }
  }

  /**
   * Initialize token manager
   */
  async _initializeTokenManager() {
    try {
      tokenManager.initialize();
      
      // Check if user has valid session
      const token = tokenManager.getToken();
      if (token && !tokenManager.isTokenExpired()) {
        console.log('✅ Valid authentication token found');
      } else {
        console.log('ℹ️ No valid authentication token found');
      }
    } catch (error) {
      console.error('Token manager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize security monitoring
   */
  async _initializeSecurityMonitoring() {
    try {
      // Setup security event monitoring
      securityMonitor.onAlert((alert) => {
        this._handleSecurityAlert(alert);
      });

      // Log initialization
      securityMonitor.logEvent('SECURITY_MONITORING_INITIALIZED', {
        monitoringEnabled: SECURITY_CONFIG.MONITORING.ENABLED,
        maxEvents: SECURITY_CONFIG.MONITORING.MAX_EVENTS
      });

      console.log('✅ Security monitoring initialized');
    } catch (error) {
      console.error('Security monitoring initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize request signing
   */
  async _initializeRequestSigning() {
    try {
      if (SECURITY_CONFIG.REQUEST_SIGNING.ENABLED) {
        // Test request signing
        const testHeaders = requestSigner.getSecurityHeaders('GET', '/api/test', {});
        
        if (!testHeaders['X-Request-Signature']) {
          throw new Error('Request signing test failed');
        }

        console.log('✅ Request signing initialized');
      } else {
        console.log('⚠️ Request signing disabled');
      }
    } catch (error) {
      console.error('Request signing initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize data encryption
   */
  async _initializeDataEncryption() {
    try {
      if (SECURITY_CONFIG.DATA_ENCRYPTION.ENABLED) {
        // Test data encryption
        const testData = 'test-encryption-data';
        const encrypted = dataEncryption.encrypt(testData);
        const decrypted = dataEncryption.decrypt(encrypted);
        
        if (decrypted !== testData) {
          throw new Error('Data encryption test failed');
        }

        console.log('✅ Data encryption initialized');
      } else {
        console.log('⚠️ Data encryption disabled');
      }
    } catch (error) {
      console.error('Data encryption initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize security middleware
   */
  async _initializeSecurityMiddleware() {
    try {
      // Test security middleware
      const testData = { name: 'test', email: 'test@example.com' };
      const sanitized = securityMiddleware.sanitizeRequestData(testData);
      
      if (!sanitized || typeof sanitized !== 'object') {
        throw new Error('Security middleware test failed');
      }

      console.log('✅ Security middleware initialized');
    } catch (error) {
      console.error('Security middleware initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup global security handlers
   */
  async _setupGlobalSecurityHandlers() {
    try {
      // Handle page unload
      window.addEventListener('beforeunload', () => {
        securityMonitor.logEvent('PAGE_UNLOAD', { timestamp: Date.now() });
      });

      // Handle visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          securityMonitor.logEvent('PAGE_HIDDEN', { timestamp: Date.now() });
        } else {
          securityMonitor.logEvent('PAGE_VISIBLE', { timestamp: Date.now() });
        }
      });

      // Handle online/offline status
      window.addEventListener('online', () => {
        securityMonitor.logEvent('CONNECTION_ONLINE', { timestamp: Date.now() });
      });

      window.addEventListener('offline', () => {
        securityMonitor.logEvent('CONNECTION_OFFLINE', { timestamp: Date.now() });
      });

      // Handle errors
      window.addEventListener('error', (event) => {
        securityMonitor.logEvent('WINDOW_ERROR', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: Date.now()
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        securityMonitor.logEvent('UNHANDLED_PROMISE_REJECTION', {
          reason: event.reason?.toString(),
          timestamp: Date.now()
        });
      });

      console.log('✅ Global security handlers setup');
    } catch (error) {
      console.error('Global security handlers setup failed:', error);
      throw error;
    }
  }

  /**
   * Initialize security dashboard
   */
  async _initializeSecurityDashboard() {
    try {
      // Create security status element (for development)
      if (SECURITY_CONFIG.DEVELOPMENT.ENABLE_DEBUG_LOGS) {
        this._createSecurityStatusElement();
      }

      console.log('✅ Security dashboard initialized');
    } catch (error) {
      console.error('Security dashboard initialization failed:', error);
      // Don't throw error for dashboard initialization
    }
  }

  /**
   * Create security status element for development
   */
  _createSecurityStatusElement() {
    try {
      // Create security status indicator
      const statusElement = document.createElement('div');
      statusElement.id = 'security-status';
      statusElement.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
      `;

      // Update status periodically
      setInterval(() => {
        const status = securityMonitor.getSecurityStatus();
        statusElement.innerHTML = `
          <div>🔒 Security Status</div>
          <div>Score: ${status.securityScore}/100</div>
          <div>Events: ${status.recentEvents}</div>
          <div>Monitoring: ${status.monitoringEnabled ? '✅' : '❌'}</div>
        `;
      }, 5000);

      document.body.appendChild(statusElement);
    } catch (error) {
      console.warn('Failed to create security status element:', error);
    }
  }

  /**
   * Handle security alerts
   * @param {Object} alert - Security alert
   */
  _handleSecurityAlert(alert) {
    try {
      console.warn('🚨 Security Alert:', alert);

      // Show user notification for critical alerts
      if (alert.severity === 'HIGH' || alert.severity === 'CRITICAL') {
        this._showSecurityNotification(alert);
      }

      // Send alert to monitoring service
      this._sendAlertToMonitoring(alert);

    } catch (error) {
      console.error('Error handling security alert:', error);
    }
  }

  /**
   * Show security notification to user
   * @param {Object} alert - Security alert
   */
  _showSecurityNotification(alert) {
    try {
      // Create notification element
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff4444;
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        z-index: 10001;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      `;

      notification.innerHTML = `
        <h3>🚨 Security Alert</h3>
        <p>Type: ${alert.type}</p>
        <p>Severity: ${alert.severity}</p>
        <p>Time: ${new Date(alert.timestamp).toLocaleString()}</p>
        <button onclick="this.parentElement.remove()" style="
          background: white;
          color: #ff4444;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        ">Dismiss</button>
      `;

      document.body.appendChild(notification);

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 10000);

    } catch (error) {
      console.error('Error showing security notification:', error);
    }
  }

  /**
   * Send alert to monitoring service
   * @param {Object} alert - Security alert
   */
  async _sendAlertToMonitoring(alert) {
    try {
      // Implement sending to external monitoring service
      // This could be a webhook, API call, or integration with services like Sentry
      
      if (SECURITY_CONFIG.DEVELOPMENT.ENABLE_DEBUG_LOGS) {
        console.log('Sending alert to monitoring service:', alert);
      }

      // Example: Send to monitoring API
      // await fetch('/api/security/alerts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(alert)
      // });

    } catch (error) {
      console.error('Error sending alert to monitoring:', error);
    }
  }

  /**
   * Get security initialization status
   * @returns {Object} Initialization status
   */
  getInitializationStatus() {
    return {
      initialized: this.initialized,
      configValid: initializeSecurityConfig(),
      features: {
        tokenManagement: !!tokenManager,
        securityMonitoring: !!securityMonitor,
        requestSigning: !!requestSigner,
        dataEncryption: !!dataEncryption,
        securityMiddleware: !!securityMiddleware
      }
    };
  }

  /**
   * Reset security initialization
   */
  reset() {
    this.initialized = false;
    this.initializationPromise = null;
    
    // Remove security status element if it exists
    const statusElement = document.getElementById('security-status');
    if (statusElement) {
      statusElement.remove();
    }
  }
}

// Export singleton instance
export const securityInitializer = new SecurityInitializer();
export default SecurityInitializer;
