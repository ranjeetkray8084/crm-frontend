// Admin Service - Refactored for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class AdminService {
  /**
   * Centralized error handler.
   * @param {Error} error - The error object from the catch block.
   * @param {string} fallbackMessage - A message to use if the API provides no error message.
   * @returns {{success: false, error: string}}
   */
  static handleError(error, fallbackMessage) {
    return {
      success: false,
      error: error?.response?.data?.message || fallbackMessage
    };
  }

  /**
   * A private helper method to execute API requests and handle responses/errors.
   * @param {Function} apiCall - A function that returns an Axios promise.
   * @param {string} fallbackErrorMessage - The fallback error message for this call.
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  static async _request(apiCall, fallbackErrorMessage) {
    try {
      const response = await apiCall();
      // Assumes that a successful response will have a `data` property.
      // For PUT/DELETE calls with no body, response might be undefined but not an error.
      return {
        success: true,
        data: response?.data,
        message: response?.data?.message || 'Operation successful'
      };
    } catch (error) {
      return this.handleError(error, fallbackErrorMessage);
    }
  }

  /**
   * Get all admins across all companies (for DEVELOPER role).
   */
  static getAllAdmins() {
    return this._request(
      () => axios.get(API_ENDPOINTS.USERS.GET_ADMIN_ROLE),
      'Failed to load all admins'
    );
  }

  /**
   * Get all admins by company.
   */
  static getAdminRoleByCompany(companyId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.USERS.GET_ADMIN_ROLE_BY_COMPANY(companyId)),
      'Failed to load admins'
    );
  }

  /**
   * Create a new admin.
   */
  static createAdmin(adminData) {
    return this._request(
      () => axios.post(API_ENDPOINTS.USERS.CREATE, { ...adminData, role: 'ADMIN' }),
      'Failed to create admin'
    );
  }

  /**
   * Update an admin's profile.
   */
  static updateAdmin(adminId, adminData) {
    return this._request(
      () => axios.put(API_ENDPOINTS.USERS.UPDATE_PROFILE(adminId), adminData),
      'Failed to update admin'
    );
  }

  /**
   * Delete an admin.
   */
  static deleteAdmin(adminId) {
    return this._request(
      () => axios.delete(API_ENDPOINTS.USERS.DELETE(adminId)),
      'Failed to delete admin'
    );
  }

  /**
   * Activate an admin's account.
   */
  static activateAdmin(adminId) {
    return this._request(
      () => axios.put(API_ENDPOINTS.USERS.UNREVOKE(adminId)),
      'Failed to activate admin'
    );
  }

  /**
   * Revoke an admin's access (deactivate).
   */
  static revokeAdmin(adminId) {
    return this._request(
      () => axios.put(API_ENDPOINTS.USERS.REVOKE(adminId)),
      'Failed to revoke admin'
    );
  }

  /**
   * Assign an admin role to a user.
   */
  static assignAdmin(userId, adminId) {
    return this._request(
      () => axios.put(API_ENDPOINTS.USERS.ASSIGN_ADMIN(userId), { adminId }),
      'Failed to assign admin'
    );
  }

  /**
   * Unassign the admin role from a user.
   */
  static unassignAdmin(userId) {
    return this._request(
      () => axios.put(API_ENDPOINTS.USERS.UNASSIGN_ADMIN(userId)),
      'Failed to unassign admin'
    );
  }
  
  /**
   * Get all users assigned to a specific admin.
   */
  static getUsersByAdmin(adminId) {
    return this._request(
        () => axios.get(`/users/admin/${adminId}/users`),
        'Failed to load users for admin'
    );
  }

  /**
   * Get the count of users assigned to a specific admin.
   */
  static getUserCountByAdmin(adminId, companyId) {
    return this._request(
        () => axios.get(`/users/count-by-admin/${adminId}?companyId=${companyId}`),
        'Failed to get user count'
    );
  }
}
