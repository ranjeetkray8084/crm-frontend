/**
 * HTTPS Enforcement Service
 * Automatically redirects HTTP to HTTPS and enforces secure connections
 */

class HTTPSEnforcer {
  constructor() {
    this.isProduction = import.meta.env.NODE_ENV === 'production';
    this.forceHTTPS = import.meta.env.VITE_FORCE_HTTPS !== 'false';
    this.httpsPort = import.meta.env.VITE_HTTPS_PORT || '443';
    this.httpPort = import.meta.env.VITE_HTTP_PORT || '80';
    
    this.initialize();
  }

  /**
   * Initialize HTTPS enforcement
   */
  initialize() {
    // Only enforce HTTPS in production, skip for localhost development
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost');
    
    if ((this.isProduction || this.forceHTTPS) && !isLocalhost) {
      this.enforceHTTPS();
      this.setupHTTPSMonitoring();
    }
    
    // Log current protocol status
    this.logProtocolStatus();
  }

  /**
   * Enforce HTTPS connection
   */
  enforceHTTPS() {
    const currentUrl = window.location.href;
    const isHTTPS = window.location.protocol === 'https:';
    
    if (!isHTTPS) {
      console.warn('🚨 HTTP connection detected - redirecting to HTTPS');
      
      // Redirect to HTTPS
      const httpsUrl = currentUrl.replace(/^http:/, 'https:');
      
      // Show security warning before redirect
      this.showSecurityWarning(() => {
        window.location.replace(httpsUrl);
      });
    }
  }

  /**
   * Setup continuous HTTPS monitoring
   */
  setupHTTPSMonitoring() {
    // Monitor for protocol changes
    const checkProtocol = () => {
      if (window.location.protocol !== 'https:') {
        console.warn('🚨 Protocol changed to HTTP - enforcing HTTPS');
        this.enforceHTTPS();
      }
    };

    // Check protocol every 30 seconds
    setInterval(checkProtocol, 30000);

    // Check protocol on focus (when user returns to tab)
    window.addEventListener('focus', checkProtocol);

    // Check protocol on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkProtocol();
      }
    });
  }

  /**
   * Show security warning before redirect
   */
  showSecurityWarning(onConfirm) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    modal.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
      <h2 style="color: #dc3545; margin-bottom: 15px;">Security Alert</h2>
      <p style="margin-bottom: 20px; color: #666;">
        Your connection is not secure. We're redirecting you to a secure HTTPS connection to protect your data.
      </p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="redirect-btn" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        ">Continue Securely</button>
      </div>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This redirect ensures your data remains secure and encrypted.
      </p>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Handle redirect button click
    const redirectBtn = document.getElementById('redirect-btn');
    redirectBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      onConfirm();
    });

    // Auto-redirect after 5 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
        onConfirm();
      }
    }, 5000);
  }

  /**
   * Log current protocol status
   */
  logProtocolStatus() {
    const protocol = window.location.protocol;
    const isSecure = protocol === 'https:';
    
    if (isSecure) {
      console.log('✅ HTTPS connection established - secure');
    } else {
      console.warn('⚠️ HTTP connection detected - not secure');
      
      if (this.isProduction) {
        console.error('🚨 PRODUCTION ENVIRONMENT USING HTTP - SECURITY RISK!');
      }
    }
  }

  /**
   * Check if current connection is secure
   */
  isSecureConnection() {
    return window.location.protocol === 'https:';
  }

  /**
   * Get current protocol information
   */
  getProtocolInfo() {
    return {
      protocol: window.location.protocol,
      isSecure: this.isSecureConnection(),
      hostname: window.location.hostname,
      port: window.location.port,
      isProduction: this.isProduction,
      forceHTTPS: this.forceHTTPS
    };
  }

  /**
   * Force redirect to HTTPS (manual trigger)
   */
  forceRedirectToHTTPS() {
    const currentUrl = window.location.href;
    const httpsUrl = currentUrl.replace(/^http:/, 'https:');
    
    if (currentUrl !== httpsUrl) {
      console.log('🔄 Manually forcing HTTPS redirect');
      window.location.replace(httpsUrl);
    } else {
      console.log('✅ Already using HTTPS');
    }
  }

  /**
   * Setup secure cookie flags
   */
  setupSecureCookies() {
    // Override document.cookie to add secure flags
    const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    
    Object.defineProperty(Document.prototype, 'cookie', {
      get: function() {
        return originalCookie.get.call(this);
      },
      set: function(value) {
        // Add secure flag if using HTTPS
        if (window.location.protocol === 'https:' && !value.includes('Secure')) {
          value += '; Secure';
        }
        
        // Add SameSite flag for better security
        if (!value.includes('SameSite')) {
          value += '; SameSite=Strict';
        }
        
        return originalCookie.set.call(this, value);
      }
    });
  }

  /**
   * Validate HTTPS certificate (basic check)
   */
  validateHTTPS() {
    return new Promise((resolve) => {
      if (!this.isSecureConnection()) {
        resolve({ valid: false, reason: 'Not using HTTPS' });
        return;
      }

      // Basic HTTPS validation
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      
      // Check if it's a valid HTTPS URL
      const isValidHTTPS = protocol === 'https:' && hostname !== 'localhost';
      
      resolve({
        valid: isValidHTTPS,
        reason: isValidHTTPS ? 'Valid HTTPS connection' : 'Invalid HTTPS configuration',
        protocol,
        hostname
      });
    });
  }
}

// Create singleton instance
export const httpsEnforcer = new HTTPSEnforcer();

// Export class for testing
export default HTTPSEnforcer;
