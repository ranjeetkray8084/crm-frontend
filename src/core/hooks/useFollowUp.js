// FollowUp Hook - Reusable for Web & Mobile
import { useState, useEffect, useCallback } from 'react';
import { FollowUpService } from '../services/followup.service';

export const useFollowUp = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all follow-ups
  const loadFollowUps = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await FollowUpService.getAllFollowUps();
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
  }, []);

  // Get follow-up by ID
  const getFollowUpById = async (followUpId) => {
    setLoading(true);
    try {
      const result = await FollowUpService.getFollowUpById(followUpId);
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
  };

  // Create new follow-up
  const createFollowUp = async (followUpData) => {
    setLoading(true);
    try {
      const result = await FollowUpService.createFollowUp(followUpData);
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
  };

  // Update follow-up
  const updateFollowUp = async (followUpData) => {
    setLoading(true);
    try {
      const result = await FollowUpService.updateFollowUp(followUpData);
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
  };

  // Delete follow-up
  const deleteFollowUp = async (followUpId) => {
    setLoading(true);
    try {
      const result = await FollowUpService.deleteFollowUp(followUpId);
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
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Load follow-ups on mount
  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  return {
    followUps,
    loading,
    error,
    loadFollowUps,
    getFollowUpById,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    clearError
  };
};