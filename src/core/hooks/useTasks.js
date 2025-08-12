import { useState, useEffect, useCallback } from 'react';
import TaskService from '../services/task.service';

export const useTasks = (companyId, userId, role) => {
  const [tasks, setTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [uploadedTasks, setUploadedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Role-based Tasks Loader ---
  const loadTasksByRole = useCallback(async () => {
    if (!companyId || !role) {
      console.warn('loadTasksByRole: Missing companyId or role', { companyId, role });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (role === 'DIRECTOR') {
        response = await TaskService.getAllTasksByCompany(companyId);
      } else if (role === 'ADMIN') {
        response = await TaskService.getAllTasksForAdmin(userId, companyId);
      } else if (role === 'USER') {
        response = await TaskService.getAssignedTasks(companyId, userId);
      } else {
        response = await TaskService.getAllTasksByCompany(companyId);
      }

      if (response?.success) {
        setTasks(response.data || []);
      } else {
        setError(response?.error || 'Failed to load tasks');
      }
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, role]);

  const loadAssignedTasks = useCallback(async () => {
    if (!companyId || !userId) {
      console.warn('loadAssignedTasks: Missing companyId or userId', { companyId, userId });
      return;
    }

    setLoading(true);
    try {
      const result = await TaskService.getAssignedTasks(companyId, userId);
      if (result.success) setAssignedTasks(result.data || []);
      else setError(result.error);
    } catch (err) {
      setError('Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  const loadUploadedTasks = useCallback(async () => {
    if (!companyId || !userId) {
      console.warn('loadUploadedTasks: Missing companyId or userId', { companyId, userId });
      return;
    }

    setLoading(true);
    try {
      const result = await TaskService.getTasksUploadedByUser(userId, companyId);
      if (result.success) setUploadedTasks(result.data || []);
      else setError(result.error);
    } catch (err) {
      setError('Failed to load uploaded tasks');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  const refreshTasks = useCallback(() => {
    return Promise.all([
      loadTasksByRole(),
      loadAssignedTasks(),
      loadUploadedTasks()
    ]);
  }, [loadTasksByRole, loadAssignedTasks, loadUploadedTasks]);

  // --- Updated uploadExcelFile without assignedTo ---
  const uploadExcelFile = useCallback(async (taskData) => {
    if (!companyId) return { success: false, error: 'Company ID is required' };
    setLoading(true);
    try {
      const result = await TaskService.uploadExcelFile({
        ...taskData,
        companyId,
      });
      if (result.success) await refreshTasks();
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to upload file' };
    } finally {
      setLoading(false);
    }
  }, [companyId, refreshTasks]);

  const assignTask = useCallback(async (taskId, assignedUserId) => {
    if (!companyId) return { success: false, error: 'Company ID is required' };
    setLoading(true);
    try {
      const result = await TaskService.assignTask(taskId, companyId, assignedUserId);
      if (result.success) await refreshTasks();
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to assign task' };
    } finally {
      setLoading(false);
    }
  }, [companyId, refreshTasks]);

  const unassignTask = useCallback(async (taskId) => {
    return assignTask(taskId, null);
  }, [assignTask]);

  const deleteTask = useCallback(async (taskId) => {
    if (!companyId) return { success: false, error: 'Company ID is required' };
    setLoading(true);
    try {
      const result = await TaskService.deleteTask(taskId, companyId);
      if (result.success) await refreshTasks();
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to delete task' };
    } finally {
      setLoading(false);
    }
  }, [companyId, refreshTasks]);

  const updateCell = useCallback((taskId, row, col, newValue) => {
    if (!companyId) return { success: false, error: 'Company ID required' };
    return TaskService.updateCell(taskId, companyId, row, col, newValue);
  }, [companyId]);

  const deleteColumn = useCallback((taskId, colIndex) => {
    if (!companyId) return { success: false, error: 'Company ID required' };
    return TaskService.deleteColumn(taskId, companyId, colIndex);
  }, [companyId]);

  const previewExcel = useCallback((taskId) => {
    if (!companyId) return { success: false, error: 'Company ID required' };
    return TaskService.previewExcel(taskId, companyId);
  }, [companyId]);

  const downloadFile = useCallback(async (taskId) => {
    if (!companyId) return { success: false, error: 'Company ID required' };
    try {
      const result = await TaskService.downloadFile(taskId, companyId);
      if (result.success) {
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'task-file.xlsx';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return { success: true };
      }
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to download file' };
    }
  }, [companyId]);

  const clearError = useCallback(() => setError(null), []);

  const canManageTask = useCallback((taskOwnerId) => {
    if (!role || !userId) return false;
    return role === 'DIRECTOR' || role === 'ADMIN' || userId === taskOwnerId;
  }, [role, userId]);

  const isTaskAssignedToUser = useCallback((taskAssignedUserId) => {
    return userId === taskAssignedUserId;
  }, [userId]);

  useEffect(() => {
    if (companyId && role) {
      loadTasksByRole();
    }
  }, [companyId, role, loadTasksByRole]);

  return {
    tasks,
    assignedTasks,
    uploadedTasks,
    loading,
    error,
    loadTasksByRole,
    loadAssignedTasks,
    loadUploadedTasks,
    refreshTasks,
    uploadExcelFile,
    assignTask,
    unassignTask,
    deleteTask,
    updateCell,
    deleteColumn,
    previewExcel,
    downloadFile,
    clearError,
    canManageTask,
    isTaskAssignedToUser
  };
};
