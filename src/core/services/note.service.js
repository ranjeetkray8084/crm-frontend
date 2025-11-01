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
      // Log FULL payload in production to debug issues - check if userId was removed
      if (window.location.hostname.includes('.leadstracker.in')) {
        console.log('📝 Note creation payload received by service:', JSON.stringify(noteData, null, 2));
        console.log('📝 Payload check - has top-level userId?', {
          hasUserId: 'userId' in noteData,
          userId: noteData.userId,
          createdBy: noteData.createdBy,
          message: 'userId' in noteData ? '❌ userId should NOT be in payload!' : '✅ userId correctly removed'
        });
      }
      
      // CRITICAL: Ensure noteData is always an object, never a string
      // Axios.post() expects an object which it will JSON.stringify automatically
      let payload = noteData;
      
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
          console.warn('⚠️ noteData was string, parsed to object');
        } catch (e) {
          console.error('❌ Failed to parse noteData string:', e);
          return {
            success: false,
            error: 'Invalid note data format'
          };
        }
      }
      
      // Double-check it's an object
      if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
        console.error('❌ Invalid payload type:', typeof payload, payload);
        return {
          success: false,
          error: 'Invalid note data format - must be an object'
        };
      }
      
      // Log final payload before sending
      if (window.location.hostname.includes('.leadstracker.in') || process.env.NODE_ENV === 'development') {
        console.log('📤 Sending note payload to backend (ensured object):', {
          payloadType: typeof payload,
          isArray: Array.isArray(payload),
          payload: payload,
          payloadKeys: Object.keys(payload)
        });
      }
      
      const response = await axios.post(API_ENDPOINTS.NOTES.CREATE(companyId), payload);
      
      // Check if response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          message: 'Note created successfully'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Failed to create note'
        };
      }
    } catch (error) {
      // Handle different types of errors - same pattern as lead service
      if (error.response) {
        // Log detailed error for debugging
        console.error('❌ Note creation failed:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          message: error.response.data?.message,
          error: error.response.data?.error,
          fullResponse: error.response.data
        });
        
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error ||
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
          error: error.message || 'Failed to create note'
        };
      }
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
   * Get notes created by admin (including SPECIFIC_USERS notes)
   * @param {number} companyId 
   * @param {number} adminId 
   * @returns {Promise<Object>} API response
   */
  static async getNotesByAdmin(companyId, adminId) {
    try {
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_USER(companyId, adminId));
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