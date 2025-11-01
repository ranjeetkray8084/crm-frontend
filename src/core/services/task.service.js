import axios from '../../legacy/api/axios';
import { API_ENDPOINTS, buildUrl } from './api.endpoints';

export class TaskService {
  // ✅ Get all tasks by company
  static async getAllTasksByCompany(companyId) {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.TASKS.GET_ALL, { companyId }));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch tasks' };
    }
  }

  // ✅ Admin task list
  static async getAllTasksForAdmin(adminId, companyId) {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.TASKS.GET_ADMIN_ALL, { adminId, companyId }));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch admin tasks' };
    }
  }

  // ✅ Assigned tasks to a user
  static async getAssignedTasks(companyId, userId) {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.TASKS.GET_ASSIGNED, { companyId, userId }));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch assigned tasks' };
    }
  }

  // ✅ Tasks uploaded by a user
  static async getTasksUploadedByUser(userId, companyId) {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.TASKS.GET_UPLOADED, { uploadedById: userId, companyId }));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch uploaded tasks' };
    }
  }

  // ✅ Delete a task
  static async deleteTask(taskId, companyId) {
    try {
      const response = await axios.delete(buildUrl(API_ENDPOINTS.TASKS.DELETE(taskId), { companyId }));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete task' };
    }
  }

  // ✅ Delete single column (matching backend implementation)
  static async deleteColumn(taskId, companyId, colIndex) {
    try {
      const response = await axios.delete(
        buildUrl(API_ENDPOINTS.TASKS.DELETE_COLUMN(taskId), { companyId, colIndex })
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete column' };
    }
  }

  // ✅ Update a specific Excel cell
  static async updateCell(taskId, companyId, row, col, newValue) {
    try {
      // Backend expects query parameters only
      const response = await axios.patch(
        buildUrl(API_ENDPOINTS.TASKS.UPDATE_CELL(taskId), {
          companyId,
          row,
          col,
          newValue
        })
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update cell' };
    }
  }

  // ✅ Preview Excel
  static async previewExcel(taskId, companyId) {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.TASKS.PREVIEW(taskId), { companyId }));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to preview Excel' };
    }
  }

  // ✅ Download Excel file
  static async downloadFile(taskId, companyId) {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.TASKS.DOWNLOAD(taskId), { companyId }), {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to download file' };
    }
  }

  // ✅ Upload Excel file
  static async uploadExcelFile(taskData) {
    try {
      if (!taskData.file) {
        return { success: false, error: 'No file provided' };
      }

      if (!taskData.companyId) {
        return { success: false, error: 'Company ID is required' };
      }

      if (!taskData.uploadedBy) {
        return { success: false, error: 'Uploader ID is required' };
      }

      const formData = new FormData();
      formData.append('file', taskData.file);
      formData.append('title', taskData.title);
      formData.append('purpose', taskData.purpose);
      formData.append('companyId', taskData.companyId.toString());
      formData.append('uploadedBy', taskData.uploadedBy.toString());

      const response = await axios.post(API_ENDPOINTS.TASKS.UPLOAD, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout for file uploads
      });

      return { success: true, data: response.data };
    } catch (error) {
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                           error.response.data || 
                           `Server error: ${error.response.status}`;
        return { success: false, error: errorMessage };
      } else if (error.request) {
        // Request was made but no response received
        return { success: false, error: 'Network error: Unable to reach server' };
      } else {
        // Something else happened
        return { success: false, error: error.message || 'Upload failed' };
      }
    }
  }

  // ✅ Assign/Unassign a task
  static async assignTask(taskId, companyId, userId = null) {
    try {
      const endpoint = API_ENDPOINTS.TASKS.ASSIGN(taskId);
      const params = { companyId };
      
      if (userId !== null && userId !== undefined) {
        params.userId = userId;
      }
      
      const url = buildUrl(endpoint, params);
      const response = await axios.put(url);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Failed to assign/unassign task' };
    }
  }

  // ✅ Update task status
  static async updateTaskStatus(taskId, companyId, status) {
    try {
      const endpoint = API_ENDPOINTS.TASKS.UPDATE_STATUS(taskId);
      const params = { companyId, status };
      const fullUrl = buildUrl(endpoint, params);

      const response = await axios.put(fullUrl);
      
      // Check if the response indicates success
      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: `Backend returned status ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update task status' };
    }
  }
}

export default TaskService;