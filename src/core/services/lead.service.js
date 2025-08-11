// Lead Service - Reusable for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class LeadService {
  /**
   * Get leads by company with pagination
   * @param {number} companyId 
   * @param {number} page 
   * @param {number} size 
   * @returns {Promise<Object>} API response
   */
  static async getLeadsByCompany(companyId, page = 0, size = 10) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_ALL(companyId), {
        params: { page, size }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load leads'
      };
    }
  }

  /**
   * Get lead by ID
   * @param {number} companyId 
   * @param {number} leadId 
   * @returns {Promise<Object>} API response
   */
  static async getLeadById(companyId, leadId) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_BY_ID(companyId, leadId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load lead'
      };
    }
  }

  /**
   * Create new lead
   * @param {number} companyId 
   * @param {Object} leadData 
   * @returns {Promise<Object>} API response
   */
  static async createLead(companyId, leadData) {
    try {
      const response = await axios.post(API_ENDPOINTS.LEADS.CREATE(companyId), leadData);
      
      // Check if response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          message: 'Lead created successfully'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Failed to create lead'
        };
      }
    } catch (error) {

      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                            error.response.data || 
                            `Server error: ${error.response.status}`;
        return {
          success: false,
          error: errorMessage
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'Network error. Please check your connection.'
        };
      } else {
        // Other error
        return {
          success: false,
          error: error.message || 'Failed to create lead'
        };
      }
    }
  }

  /**
   * Update lead
   * @param {number} companyId 
   * @param {number} leadId 
   * @param {Object} leadData 
   * @returns {Promise<Object>} API response
   */
  static async updateLead(companyId, leadId, leadData) {
    try {
      const response = await axios.put(API_ENDPOINTS.LEADS.UPDATE(companyId, leadId), leadData);
      return {
        success: true,
        data: response.data,
        message: 'Lead updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update lead'
      };
    }
  }

  /**
   * Delete lead
   * @param {number} companyId 
   * @param {number} leadId 
   * @returns {Promise<Object>} API response
   */
  static async deleteLead(companyId, leadId) {
    try {
      await axios.delete(API_ENDPOINTS.LEADS.DELETE(companyId, leadId));
      return {
        success: true,
        message: 'Lead deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete lead'
      };
    }
  }

  /**
   * Update lead status
   * @param {number} companyId 
   * @param {number} leadId 
   * @param {string} status 
   * @returns {Promise<Object>} API response
   */
  static async updateLeadStatus(companyId, leadId, status) {
    try {
      const response = await axios.put(API_ENDPOINTS.LEADS.UPDATE_STATUS(companyId, leadId), null, {
        params: { status }
      });
      return {
        success: true,
        data: response.data,
        message: 'Lead status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update lead status'
      };
    }
  }

  /**
   * Get leads by source
   * @param {number} companyId 
   * @param {string} source 
   * @returns {Promise<Object>} API response
   */
  static async getLeadsBySource(companyId, source) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_BY_SOURCE(companyId, source));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load leads by source'
      };
    }
  }

  /**
   * Get leads by assigned user
   * @param {number} companyId 
   * @param {number} userId 
   * @param {Object} pageable 
   * @returns {Promise<Object>} API response
   */
  static async getLeadsByAssignedUser(companyId, userId, pageable = {}) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_BY_ASSIGNED_USER(companyId, userId), {
        params: pageable
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load assigned leads'
      };
    }
  }

  /**
   * Add remark to lead
   * @param {number} companyId 
   * @param {number} leadId 
   * @param {Object} remarkData 
   * @returns {Promise<Object>} API response
   */
  static async addRemarkToLead(companyId, leadId, remarkData) {
    try {
      const endpoint = `/api/companies/${companyId}/leads/${leadId}/remarks`;

      const response = await axios.post(endpoint, remarkData);
      return {
        success: true,
        data: response.data,
        message: 'Remark added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || 'Failed to add remark'
      };
    }
  }

  /**
   * Get remarks by lead ID
   * @param {number} companyId 
   * @param {number} leadId 
   * @returns {Promise<Object>} API response
   */
  static async getRemarksByLeadId(companyId, leadId) {
    try {
      const endpoint = `/api/companies/${companyId}/leads/${leadId}/remarks`;
      const response = await axios.get(endpoint);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load remarks'
      };
    }
  }

  /**
   * Assign lead to user
   * @param {number} companyId 
   * @param {number} leadId 
   * @param {number} userId 
   * @param {number} assignerId 
   * @returns {Promise<Object>} API response
   */
  static async assignLead(companyId, leadId, userId, assignerId) {
    try {
      const response = await axios.put(API_ENDPOINTS.LEADS.ASSIGN(companyId, leadId, userId), null, {
        params: { assignerId }
      });
      return {
        success: true,
        data: response.data,
        message: 'Lead assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign lead'
      };
    }
  }

  /**
   * Unassign lead
   * @param {number} companyId 
   * @param {number} leadId 
   * @param {number} unassignerId 
   * @returns {Promise<Object>} API response
   */
  static async unassignLead(companyId, leadId, unassignerId) {
    try {
      const response = await axios.put(API_ENDPOINTS.LEADS.UNASSIGN(companyId, leadId), null, {
        params: { unassignerId }
      });
      return {
        success: true,
        data: response.data,
        message: 'Lead unassigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unassign lead'
      };
    }
  }

  /**
   * Get leads created by user
   * @param {number} companyId 
   * @param {number} userId 
   * @param {Object} pageable 
   * @returns {Promise<Object>} API response
   */
  static async getLeadsByCreatedBy(companyId, userId, pageable = {}) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_BY_CREATED_BY(companyId, userId), {
        params: pageable
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load created leads'
      };
    }
  }

  /**
   * Get lead name by ID
   * @param {number} companyId 
   * @param {number} leadId 
   * @returns {Promise<Object>} API response
   */
  static async getLeadName(companyId, leadId) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_NAME(companyId, leadId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get lead name'
      };
    }
  }

  /**
   * Get total lead count
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getTotalLeadCount(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_COUNT(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get lead count'
      };
    }
  }

  /**
   * Get closed lead count
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getClosedLeadCount(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_CLOSED_COUNT(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get closed lead count'
      };
    }
  }

  /**
   * Get leads created or assigned to user
   * @param {number} companyId 
   * @param {number} userId 
   * @param {number} page 
   * @param {number} size 
   * @returns {Promise<Object>} API response
   */
  static async getLeadsCreatedOrAssigned(companyId, userId, page = 0, size = 10) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_CREATED_OR_ASSIGNED(companyId, userId), {
        params: { page, size }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load user leads'
      };
    }
  }

  /**
   * Count leads for user
   * @param {number} companyId 
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async countLeadsForUser(companyId, userId) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.COUNT_FOR_USER(companyId, userId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to count user leads'
      };
    }
  }

  /**
   * Search leads
   * @param {number} companyId 
   * @param {Object} searchParams 
   * @param {Object} pageable 
   * @returns {Promise<Object>} API response
   */
  static async searchLeads(companyId, searchParams, pageable = {}) {
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please login again.'
        };
      }

      const params = {
        // Add pagination
        page: pageable.page || 0,
        size: pageable.size || 10
      };
      
      // Handle multiple keywords - send each keyword as a separate parameter
      if (searchParams.search && searchParams.search.trim()) {
        const keywords = searchParams.search.trim().split(/\s+/);
        keywords.forEach(keyword => {
          if (keyword.trim()) {
            // Add each keyword as a separate parameter using URLSearchParams
            if (!params.keywords) {
              params.keywords = [];
            }
            params.keywords.push(keyword.trim());
          }
        });
      }
      
      // Handle budget range - improved parsing
      if (searchParams.minBudget) {
        params.minBudget = searchParams.minBudget;
      }
      
      if (searchParams.maxBudget) {
        params.maxBudget = searchParams.maxBudget;
      }
      
      // Add other filters with proper validation
      if (searchParams.status && searchParams.status.trim()) {
        params.status = searchParams.status.trim();
      }
      
      if (searchParams.source && searchParams.source.trim()) {
        params.source = searchParams.source.trim();
      }
      
      if (searchParams.createdBy && searchParams.createdBy.trim()) {
        params.createdBy = searchParams.createdBy.trim();
      }
      
      if (searchParams.action && searchParams.action.trim()) {
        params.action = searchParams.action.trim();
      }

      // Remove any undefined or null values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      // Build URL with multiple keywords as separate parameters
      let url = API_ENDPOINTS.LEADS.SEARCH(companyId);
      const urlParams = new URLSearchParams();
      
      // Add all parameters except keywords
      Object.keys(params).forEach(key => {
        if (key !== 'keywords') {
          urlParams.append(key, params[key]);
        }
      });
      
      // Add keywords as separate parameters
      if (params.keywords && Array.isArray(params.keywords)) {
        params.keywords.forEach(keyword => {
          urlParams.append('keywords', keyword);
        });
      }
      
      // Construct final URL
      const finalUrl = `${url}?${urlParams.toString()}`;
      
      // Debug: Log the final URL to verify format
  
      
      // Use the constructed URL directly
      const response = await axios.get(finalUrl);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search leads'
      };
    }
  }

  /**
   * Search leads created or assigned to user
   * @param {number} companyId 
   * @param {number} userId 
   * @param {Object} searchParams 
   * @param {Object} pageable 
   * @returns {Promise<Object>} API response
   */
  static async searchLeadsCreatedOrAssigned(companyId, userId, searchParams, pageable = {}) {
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please login again.'
        };
      }

      const params = {
        // Add pagination
        page: pageable.page || 0,
        size: pageable.size || 10
      };
      
      // Handle multiple keywords - send each keyword as a separate parameter
      if (searchParams.search && searchParams.search.trim()) {
        const keywords = searchParams.search.trim().split(/\s+/);
        keywords.forEach(keyword => {
          if (keyword.trim()) {
            // Add each keyword as a separate parameter using URLSearchParams
            if (!params.keywords) {
              params.keywords = [];
            }
            params.keywords.push(keyword.trim());
          }
        });
      }
      
      // Handle budget range - improved parsing
      if (searchParams.minBudget) {
        params.minBudget = searchParams.minBudget;
      }
      
      if (searchParams.maxBudget) {
        params.maxBudget = searchParams.maxBudget;
      }
      
      // Add other filters with proper validation
      if (searchParams.status && searchParams.status.trim()) {
        params.status = searchParams.status.trim();
      }
      
      if (searchParams.source && searchParams.source.trim()) {
        params.source = searchParams.source.trim();
      }
      
      if (searchParams.action && searchParams.action.trim()) {
        params.action = searchParams.action.trim();
      }

      // Remove any undefined or null values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      // Build URL with multiple keywords as separate parameters
      let url = API_ENDPOINTS.LEADS.SEARCH_CREATED_OR_ASSIGNED(companyId, userId);
      const urlParams = new URLSearchParams();
      
      // Add all parameters except keywords
      Object.keys(params).forEach(key => {
        if (key !== 'keywords') {
          urlParams.append(key, params[key]);
        }
      });
      
      // Add keywords as separate parameters
      if (params.keywords && Array.isArray(params.keywords)) {
        params.keywords.forEach(keyword => {
          urlParams.append('keywords', keyword);
        });
      }
      
      // Construct final URL
      const finalUrl = `${url}?${urlParams.toString()}`;
      
      // Debug: Log the final URL to verify format
  
      
      // Use the constructed URL directly
      const response = await axios.get(finalUrl);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search user leads'
      };
    }
  }

  /**
   * Search leads visible to admin
   * @param {number} companyId 
   * @param {number} adminId 
   * @param {Object} searchParams 
   * @param {Object} pageable 
   * @returns {Promise<Object>} API response
   */
  static async searchLeadsVisibleToAdmin(companyId, adminId, searchParams, pageable = {}) {
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please login again.'
        };
      }

      const params = {
        // Add pagination
        page: pageable.page || 0,
        size: pageable.size || 10
      };
      
      // Handle multiple keywords - send each keyword as a separate parameter
      if (searchParams.search && searchParams.search.trim()) {
        const keywords = searchParams.search.trim().split(/\s+/);
        keywords.forEach(keyword => {
          if (keyword.trim()) {
            // Add each keyword as a separate parameter using URLSearchParams
            if (!params.keywords) {
              params.keywords = [];
            }
            params.keywords.push(keyword.trim());
          }
        });
      }
      
      // Handle budget range - improved parsing
      if (searchParams.minBudget) {
        params.minBudget = searchParams.minBudget;
      }
      
      if (searchParams.maxBudget) {
        params.maxBudget = searchParams.maxBudget;
      }
      
      // Add other filters with proper validation
      if (searchParams.status && searchParams.status.trim()) {
        params.status = searchParams.status.trim();
      }
      
      if (searchParams.source && searchParams.source.trim()) {
        params.source = searchParams.source.trim();
      }
      
      if (searchParams.createdBy && searchParams.createdBy.trim()) {
        params.createdBy = searchParams.createdBy.trim();
      }
      
      if (searchParams.action && searchParams.action.trim()) {
        params.action = searchParams.action.trim();
      }

      // Remove any undefined or null values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      // Build URL with multiple keywords as separate parameters
      let url = API_ENDPOINTS.LEADS.SEARCH_VISIBLE_TO_ADMIN(companyId, adminId);
      const urlParams = new URLSearchParams();
      
      // Add all parameters except keywords
      Object.keys(params).forEach(key => {
        if (key !== 'keywords') {
          urlParams.append(key, params[key]);
        }
      });
      
      // Add keywords as separate parameters
      if (params.keywords && Array.isArray(params.keywords)) {
        params.keywords.forEach(keyword => {
          urlParams.append('keywords', keyword);
        });
      }
      
      // Construct final URL
      const finalUrl = `${url}?${urlParams.toString()}`;
      
      // Debug: Log the final URL to verify format
  
      
      // Use the constructed URL directly
      const response = await axios.get(finalUrl);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search admin leads'
      };
    }
  }

  /**
   * Get leads visible to admin
   * @param {number} companyId 
   * @param {number} adminId 
   * @param {number} page 
   * @param {number} size 
   * @returns {Promise<Object>} API response
   */
  static async getLeadsVisibleToAdmin(companyId, adminId, page = 0, size = 10) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.GET_ADMIN_VISIBLE(companyId, adminId), {
        params: { page, size }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load admin visible leads'
      };
    }
  }

  /**
   * Count leads visible to admin
   * @param {number} companyId 
   * @param {number} adminId 
   * @returns {Promise<Object>} API response
   */
  static async countLeadsVisibleToAdmin(companyId, adminId) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.COUNT_VISIBLE_TO_ADMIN(companyId, adminId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to count admin visible leads'
      };
    }
  }

  /**
   * Count closed leads by admin
   * @param {number} companyId 
   * @param {number} adminId 
   * @returns {Promise<Object>} API response
   */
  static async countClosedLeadsByAdmin(companyId, adminId) {
    try {
      const response = await axios.get(API_ENDPOINTS.LEADS.COUNT_CLOSED_BY_ADMIN, {
        params: { companyId, adminId }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to count closed leads by admin'
      };
    }
  }
}