// FollowUp Hook - Updated for Backend Controller API
import { useState, useCallback, useMemo } from 'react';
import { FollowUpService } from '../services/followup.service';

export const useFollowUp = (companyId) => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize companyId to prevent unnecessary re-renders
  const currentCompanyId = useMemo(() => {
    if (companyId) return companyId;
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    return user.companyId;
  }, [companyId]);

  // Load all follow-ups
  const loadFollowUps = useCallback(async () => {
    if (!currentCompanyId) {
      setError('Company ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await FollowUpService.getAllFollowUps(currentCompanyId);
      if (result.success) {
        setFollowUps(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  // Get follow-up by ID
  const getFollowUpById = useCallback(async (followUpId) => {
    if (!currentCompanyId) {
      return { success: false, error: 'Company ID is required' };
    }

    setLoading(true);
    try {
      const result = await FollowUpService.getFollowUpById(currentCompanyId, followUpId);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to load follow-up';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  // Get today's follow-ups
  const getTodaysFollowUps = useCallback(async () => {
    if (!currentCompanyId) {
      return { success: false, error: 'Company ID is required' };
    }

    setLoading(true);
    try {
      const result = await FollowUpService.getTodayFollowUps(currentCompanyId);
      if (result.success) {
        setFollowUps(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to load today\'s follow-ups';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  // Create new follow-up
  const createFollowUp = useCallback(async (followUpData) => {
    if (!currentCompanyId) {
      return { success: false, error: 'Company ID is required' };
    }

    setLoading(true);
    try {
      const result = await FollowUpService.createFollowUp(currentCompanyId, followUpData);
      if (result.success) {
        await loadFollowUps(); // Reload follow-ups
        return { success: true, message: result.message, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to create follow-up';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId, loadFollowUps]);

  // Update follow-up
  const updateFollowUp = useCallback(async (followUpData) => {
    if (!currentCompanyId) {
      return { success: false, error: 'Company ID is required' };
    }

    setLoading(true);
    try {
      const result = await FollowUpService.updateFollowUp(currentCompanyId, followUpData);
      if (result.success) {
        await loadFollowUps(); // Reload follow-ups
        return { success: true, message: result.message, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to update follow-up';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId, loadFollowUps]);

  // Delete follow-up
  const deleteFollowUp = useCallback(async (followUpId) => {
    if (!currentCompanyId) {
      return { success: false, error: 'Company ID is required' };
    }

    setLoading(true);
    try {
      const result = await FollowUpService.deleteFollowUp(currentCompanyId, followUpId);
      if (result.success) {
        await loadFollowUps(); // Reload follow-ups
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to delete follow-up';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId, loadFollowUps]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    followUps,
    loading,
    error,
    loadFollowUps,
    getFollowUpById,
    getTodaysFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    clearError
  };
};