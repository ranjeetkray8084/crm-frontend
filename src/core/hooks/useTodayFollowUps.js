import { useState, useEffect, useCallback } from 'react';
import { FollowUpService } from '../services/followup.service';

export const useTodayFollowUps = (companyId) => {
  const [todayFollowUps, setTodayFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get companyId from localStorage if not provided
  const getCompanyId = useCallback(() => {
    if (companyId) return companyId;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.companyId;
  }, [companyId]);

  const loadTodayFollowUps = useCallback(async () => {
    const currentCompanyId = getCompanyId();
    if (!currentCompanyId) {
      setError('Company ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await FollowUpService.getTodayFollowUps(currentCompanyId);
      if (result.success) {
        setTodayFollowUps(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load today\'s follow-ups');
    } finally {
      setLoading(false);
    }
  }, [getCompanyId]);

  // Load follow-ups on mount
  useEffect(() => {
    loadTodayFollowUps();
  }, [loadTodayFollowUps]);

  return {
    todayFollowUps,
    loading,
    error,
    loadTodayFollowUps
  };
}; 