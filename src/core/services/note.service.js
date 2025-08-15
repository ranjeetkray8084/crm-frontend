// Note Service - Reusable for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class NoteService {

  /**
   * Create new note
   * @param {number} companyId 
   * @param {Object} noteData 
   * @returns {Promise<Object>} API response
   */
  static async createNote(companyId, noteData) {
    try {
      const response = await axios.post(API_ENDPOINTS.NOTES.CREATE(companyId), noteData);
      return {
        success: true,
        data: response.data,
        message: 'Note created successfully'
      };
    } catch (error) {
      let errorMessage = 'Failed to create note';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get notes visible to user
   * @param {number} companyId 
   * @param {number} userId 
   * @param {boolean} isAdmin 
   * @param {boolean} isDirector 
   * @returns {Promise<Object>} API response
   */
  static async getNotesVisibleToUser(companyId, userId, isAdmin = false, isDirector = false) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_VISIBLE_TO_USER(companyId, userId), {
        params: { isAdmin, isDirector }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load visible notes'
      };
    }
  }

  /**
   * Get note by ID
   * @param {number} companyId 
   * @param {number} noteId 
   * @returns {Promise<Object>} API response
   */
  static async getNoteById(companyId, noteId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_ID(companyId, noteId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load note'
      };
    }
  }

  /**
   * Get notes by user
   * @param {number} companyId 
   * @param {number} userId 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByUser(companyId, userId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_USER(companyId, userId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load user notes'
      };
    }
  }

  /**
   * Get public notes
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getPublicNotes(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_PUBLIC(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load public notes'
      };
    }
  }

  /**
   * Get notes visible to admin (public and admin notes)
   * @param {number} companyId 
   * @param {number} adminId 
   * @returns {Promise<Object>} API response
   */
  static async getNotesVisibleToAdmin(companyId, adminId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_PUBLIC_AND_ADMIN(companyId), {
        params: { adminId }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load admin notes'
      };
    }
  }

  /**
   * Get notes visible to director
   * @param {number} companyId 
   * @param {number} directorId 
   * @returns {Promise<Object>} API response
   */
  static async getNotesVisibleToDirector(companyId, directorId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_DIRECTOR_VISIBLE(companyId, directorId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load director notes'
      };
    }
  }

  /**
   * Update note
   * @param {number} companyId 
   * @param {number} noteId 
   * @param {Object} noteData 
   * @returns {Promise<Object>} API response
   */
  static async updateNote(companyId, noteId, noteData) {
    try {
      const response = await axios.put(API_ENDPOINTS.NOTES.UPDATE(companyId, noteId), noteData);
      return {
        success: true,
        data: response.data,
        message: 'Note updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update note'
      };
    }
  }

  /**
   * Delete note
   * @param {number} companyId 
   * @param {number} noteId 
   * @returns {Promise<Object>} API response
   */
  static async deleteNote(companyId, noteId) {
    try {
      await axios.delete(API_ENDPOINTS.NOTES.DELETE(companyId, noteId));
      return {
        success: true,
        message: 'Note deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete note'
      };
    }
  }

  /**
   * Update note status
   * @param {number} companyId 
   * @param {number} noteId 
   * @param {string} status 
   * @returns {Promise<Object>} API response
   */
  static async updateNoteStatus(companyId, noteId, status) {
    try {
      const response = await axios.patch(API_ENDPOINTS.NOTES.UPDATE_STATUS(companyId, noteId), null, {
        params: { status }
      });
      return {
        success: true,
        data: response.data,
        message: 'Note status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update note status'
      };
    }
  }

  /**
   * Get notes by status
   * @param {number} companyId 
   * @param {string} status 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByStatus(companyId, status) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_STATUS(companyId, status));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load notes by status'
      };
    }
  }

  /**
   * Get notes by user and status
   * @param {number} companyId 
   * @param {number} userId 
   * @param {string} status 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByUserAndStatus(companyId, userId, status) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_USER_AND_STATUS(companyId, userId, status));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load user notes by status'
      };
    }
  }

  /**
   * Get notes by status only (across all companies)
   * @param {string} status 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByStatusOnly(status) {
    try {
      const endpoint = API_ENDPOINTS.NOTES.GET_BY_STATUS_ONLY(status).replace('{companyId}', '0');
      const response = await axios.get(endpoint);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load notes by status'
      };
    }
  }

  /**
   * Get notes by priority
   * @param {number} companyId 
   * @param {string} priority 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByPriority(companyId, priority) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_PRIORITY(companyId, priority));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load notes by priority'
      };
    }
  }

  /**
   * Get notes by user and priority
   * @param {number} companyId 
   * @param {number} userId 
   * @param {string} priority 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByUserAndPriority(companyId, userId, priority) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_USER_AND_PRIORITY(companyId, userId, priority));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load user notes by priority'
      };
    }
  }

  /**
   * Get notes by priority and status
   * @param {number} companyId 
   * @param {string} priority 
   * @param {string} status 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByPriorityAndStatus(companyId, priority, status) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_PRIORITY_AND_STATUS(companyId, priority, status));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load notes by priority and status'
      };
    }
  }

  /**
   * Get notes by user, priority and status
   * @param {number} companyId 
   * @param {number} userId 
   * @param {string} priority 
   * @param {string} status 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByUserPriorityStatus(companyId, userId, priority, status) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_USER_PRIORITY_STATUS(companyId, userId, priority, status));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load user notes by priority and status'
      };
    }
  }

  /**
   * Get notes sorted by priority (ascending)
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getNotesSortedByPriorityAsc(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_SORTED_BY_PRIORITY_ASC(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load sorted notes'
      };
    }
  }

  /**
   * Get notes sorted by priority (descending)
   * @param {number} companyId 
   * @returns {Promise<Object>} API response
   */
  static async getNotesSortedByPriorityDesc(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_SORTED_BY_PRIORITY_DESC(companyId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load sorted notes'
      };
    }
  }

  /**
   * Update note priority
   * @param {number} companyId 
   * @param {number} noteId 
   * @param {string} priority 
   * @returns {Promise<Object>} API response
   */
  static async updateNotePriority(companyId, noteId, priority) {
    try {
      const response = await axios.patch(API_ENDPOINTS.NOTES.UPDATE_PRIORITY(companyId, noteId), null, {
        params: { priority }
      });
      return {
        success: true,
        data: response.data,
        message: 'Note priority updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update note priority'
      };
    }
  }

  /**
   * Add remark to note
   * @param {number} companyId 
   * @param {number} noteId 
   * @param {Object} remarkData 
   * @returns {Promise<Object>} API response
   */
  static async addRemarkToNote(companyId, noteId, remarkData) {
    try {
      const response = await axios.post(API_ENDPOINTS.NOTES.ADD_REMARK(companyId, noteId), remarkData);
      return {
        success: true,
        data: response.data,
        message: 'Remark added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add remark'
      };
    }
  }

  /**
   * Get remarks by note ID
   * @param {number} companyId 
   * @param {number} noteId 
   * @returns {Promise<Object>} API response
   */
  static async getRemarksByNoteId(companyId, noteId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_REMARKS(companyId, noteId));
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
   * Get visible user IDs for note
   * @param {number} companyId 
   * @param {number} noteId 
   * @returns {Promise<Object>} API response
   */
  static async getVisibleUserIdsForNote(companyId, noteId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_VISIBLE_USERS(companyId, noteId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load visible users'
      };
    }
  }

  /**
   * Get all notes for user with pagination
   * @param {number} companyId 
   * @param {number} userId 
   * @param {boolean} isAdmin 
   * @param {number} page 
   * @param {number} size 
   * @returns {Promise<Object>} API response
   */
  static async getAllNotesForUser(companyId, userId, isAdmin = false, page = 0, size = 10) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_ALL_FOR_USER(companyId, userId), {
        params: { isAdmin, page, size }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load notes'
      };
    }
  }

  /**
   * Get today's events for dashboard - optimized for dashboard loading
   * @param {number} companyId 
   * @param {number} userId 
   * @param {string} role 
   * @returns {Promise<Object>} API response
   */
  static async getTodayEventsForDashboard(companyId, userId, role) {
    try {
      const response = await axios.get(`/api/companies/${companyId}/notes/dashboard/today-events`, {
        params: { userId, role }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load today\'s events'
      };
    }
  }
}