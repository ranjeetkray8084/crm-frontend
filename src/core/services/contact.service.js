// Contact Service - Reusable for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class ContactService {
  /**
   * Send contact message
   * @param {Object} contactData - { name, email, message }
   * @returns {Promise<Object>} API response
   */
  static async sendContactMessage(contactData) {
    try {
      const response = await axios.post(API_ENDPOINTS.CONTACT.SEND_MESSAGE, contactData);
      return {
        success: true,
        data: response.data,
        message: 'Message sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send message'
      };
    }
  }
}