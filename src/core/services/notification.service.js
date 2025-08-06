// Notification Service - Reusable for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class NotificationService {
  /**
   * Get unread notifications by user and company
   * @param {number} userId 
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getUnreadNotificationsByUserAndCompany(userId, companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD_BY_USER_COMPANY(userId, companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load unread notifications'
      };
    }
  }

  /**
   * Get unread notifications count by user and company
   * @param {number} userId 
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getUnreadCount(userId, companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT(userId, companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load unread count'
      };
    }
  }

  /**
   * Get notifications by user and company
   * @param {number} userId 
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getNotificationsByUserAndCompany(userId, companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTIFICATIONS.GET_BY_USER_COMPANY(userId, companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load notifications'
      };
    }
  }

  /**
   * Mark all notifications as read for user and company
   * @param {number} userId 
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async markAllAsRead(userId, companyId) {
    try {
      const response = await axios.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ(userId, companyId));
      return {
        success: true,
        data: response.data,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all notifications as read'
      };
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId 
   * @returns {Promise<Object>} API response
   */
  static async markAsRead(notificationId) {
    try {
      const response = await axios.post(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId));
      return {
        success: true,
        data: response.data,
        message: 'Notification marked as read'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark notification as read'
      };
    }
  }

  /**
   * Send notification
   * @param {number} actorUserId 
   * @param {number} companyId 
   * @param {string} message 
   * @returns {Promise<Object>} API response
   */
  static async sendNotification(actorUserId, companyId, message) {
    try {
      const response = await axios.post(API_ENDPOINTS.NOTIFICATIONS.SEND, null, {
        params: { actorUserId, companyId, message }
      });
      return {
        success: true,
        data: response.data,
        message: 'Notification sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send notification'
      };
    }
  }
}