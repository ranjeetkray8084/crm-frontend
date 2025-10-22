/**
 * Localhost Security Configuration
 * Disables HTTPS enforcement for local development
 */

class LocalhostSecurityConfig {
  constructor() {
    this.isLocalhost = this.checkIfLocalhost();
    this.isDevelopment = import.meta.env.NODE_ENV === 'development';
  }

  /**
   * Check if running on localhost
   */
  checkIfLocalhost() {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.includes('localhost') ||
           hostname.includes('127.0.0.1');
  }

  /**
   * Get security configuration for current environment
   */
  getSecurityConfig() {
    return {
      isLocalhost: this.isLocalhost,
      isDevelopment: this.isDevelopment,
      isProduction: !this.isDevelopment,
      forceHTTPS: this.shouldForceHTTPS(),
      enableSecurityAlerts: this.shouldEnableSecurityAlerts(),
      enableHttpsEnforcement: this.shouldEnableHttpsEnforcement()
    };
  }

  /**
   * Determine if HTTPS should be forced
   */
  shouldForceHTTPS() {
    // Don't force HTTPS on localhost
    if (this.isLocalhost) {
      return false;
    }
    
    // Force HTTPS in production
    return this.isDevelopment === false;
  }

  /**
   * Determine if security alerts should be shown
   */
  shouldEnableSecurityAlerts() {
    // Show security alerts everywhere except localhost
    return !this.isLocalhost;
  }

  /**
   * Determine if HTTPS enforcement should be enabled
   */
  shouldEnableHttpsEnforcement() {
    // Enable HTTPS enforcement everywhere except localhost
    return !this.isLocalhost;
  }

  /**
   * Log security configuration
   */
  logSecurityConfig() {
    const config = this.getSecurityConfig();
    
    console.log('🔧 Localhost Security Configuration:');
    console.log('====================================');
    console.log('Environment:', config.isDevelopment ? 'Development' : 'Production');
    console.log('Hostname:', window.location.hostname);
    console.log('Is Localhost:', config.isLocalhost);
    console.log('Force HTTPS:', config.forceHTTPS);
    console.log('Security Alerts:', config.enableSecurityAlerts);
    console.log('HTTPS Enforcement:', config.enableHttpsEnforcement);
    
    if (config.isLocalhost) {
      console.log('✅ Localhost detected - HTTPS enforcement disabled for development');
    } else {
      console.log('🌐 Production environment - HTTPS enforcement enabled');
    }
  }

  /**
   * Disable security alerts for localhost
   */
  disableSecurityAlerts() {
    if (this.isLocalhost) {
      console.log('🔧 Disabling security alerts for localhost development');
      
      // Remove any existing security alerts
      const existingAlerts = document.querySelectorAll('[data-security-alert]');
      existingAlerts.forEach(alert => {
        alert.remove();
      });
      
      // Override console warnings for localhost
      const originalWarn = console.warn;
      console.warn = function(...args) {
        const message = args.join(' ');
        if (!message.includes('HTTP connection detected') && 
            !message.includes('not secure') &&
            !message.includes('redirecting to HTTPS')) {
          originalWarn.apply(console, args);
        }
      };
    }
  }

  /**
   * Setup localhost-friendly security
   */
  setupLocalhostSecurity() {
    const config = this.getSecurityConfig();
    
    if (config.isLocalhost) {
      console.log('🏠 Setting up localhost-friendly security configuration');
      
      // Disable security alerts
      this.disableSecurityAlerts();
      
      // Log configuration
      this.logSecurityConfig();
      
      // Return localhost-optimized config
      return {
        ...config,
        allowHttp: true,
        skipHttpsChecks: true,
        developmentMode: true
      };
    }
    
    return config;
  }
}

// Create singleton instance
export const localhostSecurityConfig = new LocalhostSecurityConfig();

// Auto-setup for localhost
if (localhostSecurityConfig.isLocalhost) {
  localhostSecurityConfig.setupLocalhostSecurity();
}

export default LocalhostSecurityConfig;
