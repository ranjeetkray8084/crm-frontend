/**
 * Environment Configuration
 * Handles different configurations for development and production
 */

export const ENV_CONFIG = {
  // Detect environment
  isDevelopment: import.meta.env.NODE_ENV === 'development',
  isProduction: import.meta.env.NODE_ENV === 'production',
  isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // API Configuration - ALWAYS USE PRODUCTION
  apiBaseUrl: 'https://backend.leadstracker.in',
  
  // Security Configuration
  enableSecurity: import.meta.env.VITE_ENABLE_SECURITY !== 'false',
  forceHttps: import.meta.env.VITE_FORCE_HTTPS !== 'false',
  securityAlerts: import.meta.env.VITE_SECURITY_ALERTS !== 'false',
  
  // Get current environment
  getCurrentEnv() {
    if (this.isLocalhost) return 'localhost';
    if (this.isDevelopment) return 'development';
    if (this.isProduction) return 'production';
    return 'unknown';
  },
  
  // Get security configuration for current environment
  getSecurityConfig() {
    const env = this.getCurrentEnv();
    
    switch (env) {
      case 'localhost':
        return {
          enableSecurity: false,
          forceHttps: false,
          securityAlerts: false,
          skipSecurityHeaders: true,
          skipInputSanitization: true
        };
        
      case 'development':
        return {
          enableSecurity: true,
          forceHttps: false,
          securityAlerts: true,
          skipSecurityHeaders: false,
          skipInputSanitization: false
        };
        
      case 'production':
        return {
          enableSecurity: true,
          forceHttps: true,
          securityAlerts: true,
          skipSecurityHeaders: false,
          skipInputSanitization: false
        };
        
      default:
        return {
          enableSecurity: true,
          forceHttps: true,
          securityAlerts: true,
          skipSecurityHeaders: false,
          skipInputSanitization: false
        };
    }
  },
  
  // Get current configuration (no logging in production)
  getConfigInfo() {
    const env = this.getCurrentEnv();
    const securityConfig = this.getSecurityConfig();
    
    return {
      environment: env,
      apiBaseUrl: this.apiBaseUrl,
      securityEnabled: securityConfig.enableSecurity,
      forceHttps: securityConfig.forceHttps,
      securityAlerts: securityConfig.securityAlerts,
      skipSecurityHeaders: securityConfig.skipSecurityHeaders,
      skipInputSanitization: securityConfig.skipInputSanitization
    };
  }
};

export default ENV_CONFIG;
