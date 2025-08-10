// Dashboard Service - Modern implementation
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class DashboardService {
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
   * Get leads count for user.
   */
  static getLeadsCountForUser(companyId, userId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.LEADS.COUNT_FOR_USER(companyId, userId)),
      'Failed to load leads count'
    );
  }

  /**
   * Get total leads count for company.
   */
  static getLeadsCount(companyId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.LEADS.GET_COUNT(companyId)),
      'Failed to load leads count'
    );
  }

  /**
   * Get closed leads count for company.
   */
  static getClosedLeadsCount(companyId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.LEADS.GET_CLOSED_COUNT(companyId)),
      'Failed to load closed leads count'
    );
  }

  /**
   * Get closed leads count for admin.
   */
  static getClosedLeadsCountByAdmin(companyId, adminId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.LEADS.COUNT_CLOSED_BY_ADMIN(companyId, adminId)),
      'Failed to load closed leads count for admin'
    );
  }

  /**
   * Get new and contacted leads count using COUNT_SUMMARY endpoint.
   */
  static async getNewContactedLeadsCount(companyId, userId) {
    try {
      console.log('🔍 DashboardService: getNewContactedLeadsCount called with:', { companyId, userId });
      const apiUrl = API_ENDPOINTS.LEADS.COUNT_SUMMARY(companyId, userId);
      console.log('🔍 DashboardService: API URL:', apiUrl);
      
      const response = await axios.get(apiUrl);
      console.log('✅ DashboardService: getNewContactedLeadsCount successful:', response?.data);
      
      return {
        success: true,
        data: response?.data,
        message: response?.data?.message || 'Operation successful'
      };
    } catch (error) {
      console.error('❌ DashboardService: getNewContactedLeadsCount failed:', error);
      // Return fallback data instead of throwing error
      return {
        success: true,
        data: {
          totalLeads: 0,
          newLeads: 0,
          contactedLeads: 0
        },
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Get deals close count with breakdown using closed leads count.
   */
  static async getDealsCloseCount(companyId, userId, role) {
    try {
      let closedCount = 0;
      let droppedCount = 0;
      
      // Try to get the breakdown from count summary first
      try {
        const summaryResponse = await this.getNewContactedLeadsCount(companyId, userId);
        if (summaryResponse.success) {
          closedCount = summaryResponse.data?.closedLeads || 0;
          droppedCount = summaryResponse.data?.droppedLeads || 0;
        } else {
          // Fallback to individual counts based on role
          if (role === 'ADMIN') {
            const response = await this.getClosedLeadsCountByAdmin(companyId, userId);
            closedCount = response.success ? response.data : 0;
          } else if (role === 'USER') {
            const response = await this.getLeadsCountForUser(companyId, userId);
            closedCount = response.success ? (response.data?.closedCount || 0) : 0;
          } else {
            // For DIRECTOR, use the combined count
            const response = await this.getClosedLeadsCount(companyId);
            closedCount = response.success ? response.data : 0;
          }
        }
      } catch (error) {
        // Fallback to individual counts based on role
        if (role === 'ADMIN') {
          const response = await this.getClosedLeadsCountByAdmin(companyId, userId);
          closedCount = response.success ? response.data : 0;
        } else if (role === 'USER') {
          const response = await this.getLeadsCountForUser(companyId, userId);
          closedCount = response.success ? (response.data?.closedCount || 0) : 0;
        } else {
          // For DIRECTOR, use the combined count
          const response = await this.getClosedLeadsCount(companyId);
          closedCount = response.success ? response.data : 0;
        }
      }
      
      const totalClose = closedCount + droppedCount;
      
      return {
        success: true,
        data: {
          "total close": totalClose,
          "closed": closedCount,
          "dropped": droppedCount
        },
        message: 'Operation successful'
      };
    } catch (error) {
      // Return fallback data instead of throwing error
      return {
        success: true,
        data: {
          "total close": 0,
          "closed": 0,
          "dropped": 0
        },
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Get properties count for company.
   */
  static getPropertiesCount(companyId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.PROPERTIES.GET_COUNT(companyId)),
      'Failed to load properties count'
    );
  }

  /**
   * Get properties overview with detailed stats.
   */
  static async getPropertiesOverview(companyId) {
    try {
      const apiUrl = API_ENDPOINTS.PROPERTIES.COUNT_PROPERTY_OVERVIEW(companyId);
      const response = await axios.get(apiUrl);
      return {
        success: true,
        data: response?.data,
        message: response?.data?.message || 'Operation successful'
      };
    } catch (error) {
      // Return fallback data instead of throwing error
      return {
        success: true,
        data: {
          totalProperties: 0,
          "available for sale": 0,
          "available for rent": 0,
          "sold out": 0,
          "rent out": 0
        },
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Get properties count for user.
   */
  static getPropertiesCountByUser(companyId, userId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.PROPERTIES.COUNT_BY_USER(companyId, userId)),
      'Failed to load properties count for user'
    );
  }

  /**
   * Get user notes.
   */
  static getUserNotes(companyId, userId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.NOTES.GET_BY_USER(companyId, userId)),
      'Failed to load user notes'
    );
  }

  /**
   * Get public notes.
   */
  static getPublicNotes(companyId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.NOTES.GET_PUBLIC(companyId)),
      'Failed to load public notes'
    );
  }

  /**
   * Get notes visible to user.
   */
  static getNotesVisibleToUser(companyId, userId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.NOTES.GET_VISIBLE_TO_USER(companyId, userId)),
      'Failed to load visible notes'
    );
  }

  /**
   * Get username by user ID.
   */
  static getUsernameById(userId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.USERS.GET_USERNAME(userId)),
      'Failed to load username'
    );
  }

  /**
   * Get leads visible to admin.
   */
  static getLeadsVisibleToAdmin(companyId, adminId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.LEADS.GET_ADMIN_VISIBLE(companyId, adminId)),
      'Failed to load admin visible leads'
    );
  }

  /**
   * Get users and admins overview.
   */
  static async getUsersAndAdminsOverview(companyId, userId) {
    try {
      console.log('🔍 DashboardService: Function called with companyId:', companyId, 'userId:', userId);
      
      // Temporary fix: Hardcode the URL to bypass cache issues
      const apiUrl = `/api/users/count-summary/${companyId}/${userId}`;
      console.log('🔍 DashboardService: Generated API URL:', apiUrl);
      console.log('🔍 DashboardService: Making API call to:', apiUrl);
      
      const response = await axios.get(apiUrl);
      console.log('✅ DashboardService: API call successful');
      return {
        success: true,
        data: response?.data,
        message: response?.data?.message || 'Operation successful'
      };
    } catch (error) {
      console.error('❌ DashboardService: API call failed:', error);
      // Don't throw error - return fallback data to prevent logout
      return {
        success: true,
        data: {
          totalNormalUsers: 0,
          activeAdmins: 0,
          totalUsers: 0,
          totalAdmins: 0,
          deactiveAdmins: 0,
          deactiveNormalUsers: 0,
          activeNormalUsers: 0
        },
        message: 'API not available - using fallback data'
      };
    }
  }
  

  /**
   * Get leads count visible to admin.
   */
  static getLeadsCountVisibleToAdmin(companyId, adminId) {
    return this._request(
      () => axios.get(API_ENDPOINTS.LEADS.COUNT_VISIBLE_TO_ADMIN(companyId, adminId)),
      'Failed to load admin visible leads count'
    );
  }
}