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

  // Note: Add row/column functionality not implemented in backend controller
  // These methods are removed to match actual backend capabilities

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

  // Note: Undo functionality not implemented in backend controller
  // This method is removed to match actual backend capabilities

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
      const formData = new FormData();
      formData.append('file', taskData.file);
      formData.append('title', taskData.title);
      formData.append('companyId', taskData.companyId);
      formData.append('uploadedBy', taskData.uploadedBy);
   

      const response = await axios.post(API_ENDPOINTS.TASKS.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to upload file' };
    }
  }

  // ✅ Assign/Unassign a task
  static async assignTask(taskId, companyId, userId = null) {
    try {
      const params = { companyId };
      if (userId) {
        params.userId = userId;
      }
      
      const response = await axios.put(
        buildUrl(API_ENDPOINTS.TASKS.ASSIGN(taskId), params)
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to assign/unassign task' };
    }
  }
}

export default TaskService;
