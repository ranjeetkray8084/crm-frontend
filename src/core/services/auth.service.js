// Authentication Service - Reusable for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class AuthService {
  static SESSION_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    CURRENT_TASK: 'currentTaskId',
    EXCEL_STATE: 'excelEditorState',
    LAST_ROUTE: 'lastRoute'
  };
  /**
   * Login user with credentials
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} User data and token
   */
  static async login(credentials) {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

      // Extract token and user data
      const token = response.data.accessToken || response.data.token;
      const user = {
        userId: response.data.userId,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
        companyName: response.data.companyName,
        companyId: response.data.companyId,
        img: response.data.avatar,
      };

      if (!token) {
        return {
          success: false,
          error: 'No authentication token received from server'
        };
      }

      // Validate essential user data
      if (!user.userId || !user.role) {
        return {
          success: false,
          error: 'Incomplete user data received from server'
        };
      }

      // For non-DEVELOPER roles, companyId should be present
      if (user.role !== 'DEVELOPER' && !user.companyId) {
        return {
          success: false,
          error: 'Company information missing for user'
        };
      }

      // Save session
      this.saveSession(user, token);

      // Configure axios with new token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify data was saved
      const savedUser = localStorage.getItem(this.SESSION_KEYS.USER);
      const savedToken = localStorage.getItem(this.SESSION_KEYS.TOKEN);

      // Return success response
      return {
        success: true,
        data: response.data,
        user,
        token,
        redirectTo: '/dashboard' // Explicitly set redirect to dashboard
      };
    } catch (error) {
      let errorMessage = 'Login failed';

      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.msg ||
          errorData.detail ||
          errorData.description ||
          (typeof errorData === 'string' ? errorData : 'Login failed');
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check if user is deactivated
      if (error.response?.status === 403) {
        const errorData = error.response.data;
        if (errorData.message && errorData.message.includes('deactivated')) {
          return {
            success: false,
            error: errorMessage,
            isDeactivated: true,
            userEmail: credentials.email
          };
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Send OTP for password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Result
   */
  static async sendOtp(email) {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.SEND_OTP, null, {
        params: { email }
      });

      return {
        success: true,
        data: response.data,
        message: 'OTP sent to your email'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} Result
   */
  static async verifyOtp(email, otp) {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.VERIFY_OTP, null, {
        params: { email, otp }
      });

      return {
        success: true,
        data: response.data,
        valid: response.data.valid
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'OTP verification failed'
      };
    }
  }

  /**
   * Reset password with OTP
   * @param {string} email - User email
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result
   */
  static async resetPasswordWithOtp(email, newPassword) {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD_WITH_OTP, null, {
        params: { email, newPassword }
      });

      return {
        success: true,
        data: response.data,
        message: 'Password reset successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Password reset failed'
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Result
   */
  static async logout() {
    try {
      const response = await axios.get(API_ENDPOINTS.AUTH.LOGOUT);
      this.clearSession();
      return {
        success: true,
        data: response.data,
        message: 'Logged out successfully'
      };
    } catch (error) {
      this.clearSession();
      return {
        success: false,
        error: error.response?.data?.message || 'Logout failed'
      };
    }
  }

  /**
   * Clear all session data
   */
  static clearSession() {
    Object.values(this.SESSION_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * Check session validity
   * @returns {Promise<Object>} Result
   */
  static async checkSession() {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.CHECK_SESSION);
      return {
        success: true,
        data: response.data,
        message: 'Session active'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Session expired'
      };
    }
  }

  /**
   * Validate current token
   * @returns {Promise<Object>} Result
   */
  static async validateToken() {
    try {
      const response = await axios.get('/api/auth/validate-token');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token validation failed'
      };
    }
  }

  /**
   * Get current user from storage
   * @returns {Object|null} User data
   */
  static getCurrentUser() {
    try {
      const user = sessionStorage.getItem(this.SESSION_KEYS.USER) || localStorage.getItem(this.SESSION_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get current user token
   * @returns {string|null} JWT token
   */
  static getToken() {
    return sessionStorage.getItem(this.SESSION_KEYS.TOKEN) || localStorage.getItem(this.SESSION_KEYS.TOKEN);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  static isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Save user session
   * @param {Object} userData - User data
   * @param {string} token - JWT token
   */
  static saveSession(userData, token) {
    try {
      if (!userData) {
        return;
      }

      if (!token) {
        return;
      }

      sessionStorage.setItem(this.SESSION_KEYS.USER, JSON.stringify(userData));
      sessionStorage.setItem(this.SESSION_KEYS.TOKEN, token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    } catch (error) {
      
    }
  }
}