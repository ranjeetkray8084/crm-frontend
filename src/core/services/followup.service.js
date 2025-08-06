// FollowUp Service - Reusable for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class FollowUpService {
  /**
   * Get all follow-ups
   * @returns {Promise<Object>} API response
   */
  static async getAllFollowUps() {
    try {
      const response = await axios.get(API_ENDPOINTS.FOLLOWUPS.GET_ALL);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load follow-ups'
      };
    }
  }

  /**
   * Get follow-up by ID
   * @param {number} followUpId 
   * @returns {Promise<Object>} API response
   */
  static async getFollowUpById(followUpId) {
    try {
      const response = await axios.get(API_ENDPOINTS.FOLLOWUPS.GET_BY_ID(followUpId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load follow-up'
      };
    }
  }

  /**
   * Create new follow-up
   * @param {Object} followUpData 
   * @returns {Promise<Object>} API response
   */
  static async createFollowUp(followUpData) {
    try {
      const response = await axios.post(API_ENDPOINTS.FOLLOWUPS.CREATE, followUpData);
      return {
        success: true,
        data: response.data,
        message: 'Follow-up created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create follow-up'
      };
    }
  }

  /**
   * Update follow-up
   * @param {Object} followUpData 
   * @returns {Promise<Object>} API response
   */
  static async updateFollowUp(followUpData) {
    try {
      const response = await axios.put(API_ENDPOINTS.FOLLOWUPS.UPDATE, followUpData);
      return {
        success: true,
        data: response.data,
        message: 'Follow-up updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update follow-up'
      };
    }
  }

  /**
   * Delete follow-up
   * @param {number} followUpId 
   * @returns {Promise<Object>} API response
   */
  static async deleteFollowUp(followUpId) {
    try {
      await axios.delete(API_ENDPOINTS.FOLLOWUPS.DELETE(followUpId));
      return {
        success: true,
        message: 'Follow-up deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete follow-up'
      };
    }
  }
}