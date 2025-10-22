import { generateSessionId } from '../utils/cryptoUtils.js';

/**
 * Secure Token Management Service
 * Handles JWT token storage, refresh, and validation
 */
class TokenManager {
  constructor() {
    this.tokenKey = 'crm_auth_token';
    this.refreshTokenKey = 'crm_refresh_token';
    this.userKey = 'crm_user_data';
    this.tokenExpiryKey = 'crm_token_expiry';
    
    // Token refresh threshold (refresh 5 minutes before expiry)
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutes
    
    // Maximum refresh attempts
    this.maxRefreshAttempts = 3;
    this.refreshAttempts = 0;
  }

  /**
   * Store authentication token securely
   * @param {string} token - JWT token
   * @param {string} refreshToken - Refresh token
   * @param {Object} userData - User data
   * @param {number} expiryTime - Token expiry time
   */
  storeTokens(token, refreshToken, userData, expiryTime) {
    try {
      // Store in sessionStorage for better security (cleared on tab close)
      sessionStorage.setItem(this.tokenKey, token);
      sessionStorage.setItem(this.refreshTokenKey, refreshToken);
      sessionStorage.setItem(this.userKey, JSON.stringify(userData));
      sessionStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
      
      // Reset refresh attempts
      this.refreshAttempts = 0;
      
      console.log('Tokens stored securely');
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Get stored authentication token
   * @returns {string|null} JWT token or null
   */
  getToken() {
    try {
      const token = sessionStorage.getItem(this.tokenKey);
      
      if (!token) {
        return null;
      }
      
      // Check if token is expired
      if (this.isTokenExpired()) {
        console.warn('Token is expired, attempting refresh...');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken() {
    try {
      return sessionStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data or null
   */
  getUserData() {
    try {
      const userData = sessionStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * @returns {boolean} True if token is expired
   */
  isTokenExpired() {
    try {
      const expiryTime = sessionStorage.getItem(this.tokenExpiryKey);
      
      if (!expiryTime) {
        return true;
      }
      
      const now = Date.now();
      const expiry = parseInt(expiryTime);
      
      return now >= expiry;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  /**
   * Check if token needs refresh
   * @returns {boolean} True if token needs refresh
   */
  needsRefresh() {
    try {
      const expiryTime = sessionStorage.getItem(this.tokenExpiryKey);
      
      if (!expiryTime) {
        return false;
      }
      
      const now = Date.now();
      const expiry = parseInt(expiryTime);
      const timeUntilExpiry = expiry - now;
      
      return timeUntilExpiry <= this.refreshThreshold;
    } catch (error) {
      console.error('Error checking refresh need:', error);
      return false;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<string|null>} New token or null
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        console.warn('No refresh token available');
        return null;
      }
      
      if (this.refreshAttempts >= this.maxRefreshAttempts) {
        console.error('Maximum refresh attempts exceeded');
        this.clearTokens();
        return null;
      }
      
      this.refreshAttempts++;
      
      // Make refresh request to backend
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store new tokens
      this.storeTokens(
        data.token,
        data.refreshToken || refreshToken,
        data.user || this.getUserData(),
        data.expiresIn ? Date.now() + (data.expiresIn * 1000) : Date.now() + (60 * 60 * 1000)
      );
      
      console.log('Token refreshed successfully');
      return data.token;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, clear all tokens
      if (this.refreshAttempts >= this.maxRefreshAttempts) {
        this.clearTokens();
      }
      
      return null;
    }
  }

  /**
   * Get valid token (refresh if needed)
   * @returns {Promise<string|null>} Valid token or null
   */
  async getValidToken() {
    try {
      let token = this.getToken();
      
      // If no token or token needs refresh, try to refresh
      if (!token || this.needsRefresh()) {
        token = await this.refreshToken();
      }
      
      return token;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  }

  /**
   * Clear all stored tokens
   */
  clearTokens() {
    try {
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.refreshTokenKey);
      sessionStorage.removeItem(this.userKey);
      sessionStorage.removeItem(this.tokenExpiryKey);
      
      // Also clear from localStorage as backup
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenExpiryKey);
      
      this.refreshAttempts = 0;
      
      console.log('All tokens cleared');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Validate token format
   * @param {string} token - Token to validate
   * @returns {boolean} True if token format is valid
   */
  validateTokenFormat(token) {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }
      
      // JWT format: header.payload.signature
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        return false;
      }
      
      // Try to decode header and payload
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      // Basic validation
      return !!(header && payload && payload.exp);
      
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Decode token payload
   * @param {string} token - Token to decode
   * @returns {Object|null} Decoded payload or null
   */
  decodeToken(token) {
    try {
      if (!this.validateTokenFormat(token)) {
        return null;
      }
      
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      
      return payload;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has role
   */
  hasRole(role) {
    try {
      const userData = this.getUserData();
      
      if (!userData || !userData.role) {
        return false;
      }
      
      return userData.role === role;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Get user ID from token
   * @returns {string|null} User ID or null
   */
  getUserId() {
    try {
      const token = this.getToken();
      
      if (!token) {
        return null;
      }
      
      const payload = this.decodeToken(token);
      
      return payload ? payload.userId || payload.sub : null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Initialize token management
   * Sets up automatic token refresh
   */
  initialize() {
    try {
      // Check token status every 5 minutes
      setInterval(() => {
        if (this.needsRefresh() && this.getRefreshToken()) {
          this.refreshToken();
        }
      }, 5 * 60 * 1000);
      
      // Clean up expired tokens on page load
      if (this.isTokenExpired()) {
        this.clearTokens();
      }
      
      console.log('Token manager initialized');
    } catch (error) {
      console.error('Error initializing token manager:', error);
    }
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
export default TokenManager;
