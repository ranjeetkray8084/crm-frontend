// User Service - Reusable for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class UserService {
  /**
   * Get username by user ID
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async getUsernameById(userId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_USERNAME(userId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load username'
      };
    }
  }

  /**
   * Get all users with USER role
   * @returns {Promise<Object>} API response
   */
  static async getUsersWithUserRole() {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_USER_ROLE);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load users'
      };
    }
  }

  /**
   * Get all users with DIRECTOR role
   * @returns {Promise<Object>} API response
   */
  static async getUsersWithDirectorRole() {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_DIRECTOR_ROLE);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load directors'
      };
    }
  }

  /**
   * Get all users with ADMIN role
   * @returns {Promise<Object>} API response
   */
  static async getUsersWithAdminRole() {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_ADMIN_ROLE);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load admins'
      };
    }
  }

  /**
   * Get users by role
   * @param {string} role 
   * @returns {Promise<Object>} API response
   */
  static async getUsersByRole(role) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_BY_ROLE(role));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load users by role'
      };
    }
  }

  /**
   * Get all users by company ID
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getAllUsersByCompany(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_ALL_BY_COMPANY(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load company users'
      };
    }
  }

  /**
   * Get users with USER role by company
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getUserRoleByCompany(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_USER_ROLE_BY_COMPANY(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load company users'
      };
    }
  }

  /**
   * Get users with ADMIN role by company
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getAdminRoleByCompany(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_ADMIN_ROLE_BY_COMPANY(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load company admins'
      };
    }
  }

  /**
   * Get users by role and company
   * @param {number} companyId 
   * @param {string} role 
   * @returns {Promise<Object>} API response
   */
  static async getUsersByRoleAndCompany(companyId, role) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_BY_ROLE_AND_COMPANY(companyId, role));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load users by role and company'
      };
    }
  }

  /**
   * Get user by ID
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async getUserById(userId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_BY_ID(userId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load user'
      };
    }
  }

  /**
   * Create new user
   * @param {Object} userData 
   * @returns {Promise<Object>} API response
   */
  static async createUser(userData) {
    try {
      const response = await axios.post(API_ENDPOINTS.USERS.CREATE, userData);
      return {
        success: true,
        data: response.data,
        message: 'User created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create user'
      };
    }
  }

  /**
   * Update user profile
   * @param {number} userId 
   * @param {Object} userData 
   * @returns {Promise<Object>} API response
   */
  static async updateProfile(userId, userData) {
    try {
      const response = await axios.put(API_ENDPOINTS.USERS.UPDATE_PROFILE(userId), userData);
      
      // If backend returned a new token (email was changed), update it
      if (response.data.newToken && response.data.tokenUpdated) {

        localStorage.setItem('token', response.data.newToken);
        // Update axios default header with new token
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.newToken}`;
      }
      
      return {
        success: true,
        data: response.data,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || 'Failed to update user'
      };
    }
  }

  /**
   * Delete user
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async deleteUser(userId) {
    try {
      await axios.delete(API_ENDPOINTS.USERS.DELETE(userId));
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      };
    }
  }

  /**
   * Upload user avatar
   * @param {number} userId 
   * @param {File} file 
   * @param {string} avatarName 
   * @returns {Promise<Object>} API response
   */
  static async uploadAvatar(userId, file, avatarName) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('avatarName', avatarName);

      const response = await axios.post(API_ENDPOINTS.USERS.UPLOAD_AVATAR(userId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data,
        message: 'Avatar uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload avatar'
      };
    }
  }

  /**
   * Get user avatar
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async getUserAvatar(userId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_AVATAR(userId), {
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      return {
        success: true,
        data: imageUrl
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load avatar'
      };
    }
  }

  /**
   * Get avatar (alias for getUserAvatar)
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async getAvatar(userId) {
    return this.getUserAvatar(userId);
  }

  /**
   * Get users by company
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getUsersByCompany(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_BY_COMPANY(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load company users'
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} API response
   */
  static async logout() {
    try {
      const response = await axios.post(API_ENDPOINTS.USERS.LOGOUT);
      return {
        success: true,
        data: response.data,
        message: 'Logged out successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to logout'
      };
    }
  }

  /**
   * Revoke user (deactivate)
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async revokeUser(userId) {
    try {
      const response = await axios.put(API_ENDPOINTS.USERS.REVOKE(userId));
      return {
        success: true,
        data: response.data,
        message: 'User revoked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to revoke user'
      };
    }
  }

  /**
   * Unrevoke user (activate)
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async unrevokeUser(userId) {
    try {
      const response = await axios.put(API_ENDPOINTS.USERS.UNREVOKE(userId));
      return {
        success: true,
        data: response.data,
        message: 'User unrevoked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unrevoke user'
      };
    }
  }

  /**
   * Get users by admin ID
   * @param {number} adminId 
   * @returns {Promise<Object>} API response
   */
  static async getUsersByAdmin(adminId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_BY_ADMIN(adminId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load admin users'
      };
    }
  }

  /**
   * Get user by admin if belongs to admin
   * @param {number} adminId 
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async getUserByAdmin(adminId, userId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_USER_BY_ADMIN(adminId, userId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load user'
      };
    }
  }

  /**
   * Get admins by company
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getAdminsByCompany(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_ADMINS_BY_COMPANY(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load company admins'
      };
    }
  }

  /**
   * Get users by company
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getUsersByCompanyId(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.GET_USERS_BY_COMPANY(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load company users'
      };
    }
  }

  /**
   * Assign admin to user
   * @param {number} userId 
   * @param {number} adminId 
   * @returns {Promise<Object>} API response
   */
  static async assignAdmin(userId, adminId) {
    try {
      const response = await axios.put(API_ENDPOINTS.USERS.ASSIGN_ADMIN(userId), { adminId });
      return {
        success: true,
        data: response.data,
        message: 'Admin assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign admin'
      };
    }
  }

  /**
   * Unassign admin from user
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async unassignAdmin(userId) {
    try {
      const response = await axios.put(API_ENDPOINTS.USERS.UNASSIGN_ADMIN(userId));
      return {
        success: true,
        data: response.data,
        message: 'Admin unassigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unassign admin'
      };
    }
  }

  /**
   * Count users by admin
   * @param {number} adminId 
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async countUsersByAdmin(adminId, companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.COUNT_BY_ADMIN(adminId), {
        params: { companyId }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to count users'
      };
    }
  }

  /**
   * Check session validity
   * @returns {Promise<Object>} API response
   */
  static async checkSession() {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.CHECK_SESSION);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Session expired'
      };
    }
  }
}