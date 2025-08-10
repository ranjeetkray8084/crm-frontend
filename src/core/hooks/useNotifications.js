// Notifications Hook - Refactored for Web & Mobile
import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/notification.service';
import { customAlert } from '../utils/alertUtils'; // Assuming this utility exists

export const useNotifications = (userId, companyId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Primary Data Loading Functions ---

  const loadNotifications = useCallback(async () => {
    if (!userId || !companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await NotificationService.getNotificationsByUserAndCompany(userId, companyId);
      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.error);
        customAlert(`❌ ${result.error || 'Failed to load notifications'}`);
      }
    } catch (err) {
      setError('Failed to load notifications');
      customAlert('❌ Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId, companyId]);

  const loadUnreadCount = useCallback(async () => {
    if (!userId || !companyId) return;
    
    try {
      const result = await NotificationService.getUnreadCount(userId, companyId);
      if (result.success) {
        setUnreadCount(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load unread count');
    }
  }, [userId, companyId]);

  // --- Helper Functions for Actions ---

  // Helper for actions that MODIFY data and then refresh the state.
  const executeNotificationAction = useCallback(async (apiCall, successMsg, errorMsg) => {
    if (!userId || !companyId) {
      console.error('User and Company ID are required');
      return { success: false, error: 'User and Company ID are required' };
    }
    
    try {
      const result = await apiCall();
      if (result.success) {
        console.log(`✅ ${successMsg}`);
        // After a successful action, reload both notifications and the unread count.
        await Promise.all([loadNotifications(), loadUnreadCount()]);
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        console.error(`❌ ${result.error || errorMsg}`);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(errorMsg);
      console.error(`❌ ${errorMsg}`, err);
      return { success: false, error: errorMsg };
    }
  }, [userId, companyId, loadNotifications, loadUnreadCount]);

  // Helper for actions that only FETCH data and do not affect the hook's state.
  const fetchNotificationData = useCallback(async (apiCall, errorMsg) => {
    if (!userId || !companyId) {
      return { success: false, error: 'User and Company ID are required' };
    }
    try {
      return await apiCall();
    } catch (err) {
      return { success: false, error: errorMsg };
    }
  }, [userId, companyId]);

  // --- Exported Functions ---

  const markAsRead = (notificationId) =>
    executeNotificationAction(
      () => NotificationService.markAsRead(notificationId),
      'Notification marked as read',
      'Failed to mark notification as read'
    );

  const markAllAsRead = () =>
    executeNotificationAction(
      () => NotificationService.markAllAsRead(userId, companyId),
      'All notifications marked as read',
      'Failed to mark all as read'
    );
  
  const sendNotification = (actorUserId, message) =>
    fetchNotificationData(
      () => NotificationService.sendNotification(actorUserId, companyId, message),
      'Failed to send notification'
    );

  const loadUnreadNotifications = () =>
    fetchNotificationData(
      () => NotificationService.getUnreadNotificationsByUserAndCompany(userId, companyId),
      'Failed to load unread notifications'
    );

  const refreshNotifications = useCallback(() => {
    return Promise.all([loadNotifications(), loadUnreadCount()]);
  }, [loadNotifications, loadUnreadCount]);

  const clearError = () => setError(null);

  // --- Effects ---

  // Initial load when the component mounts or IDs change.
  useEffect(() => {
    if (userId && companyId) {
      refreshNotifications();
    }
  }, [userId, companyId, refreshNotifications]);

  // Auto-refresh the unread count every 5 seconds.
  useEffect(() => {
    if (!userId || !companyId) return;

    const intervalId = setInterval(loadUnreadCount, 5000); // 5 seconds
    return () => clearInterval(intervalId);
  }, [userId, companyId, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    refreshNotifications,
    clearError
  };
};
