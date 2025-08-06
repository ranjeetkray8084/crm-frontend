// useDashboard Hook - Reusable for Web & Mobile
import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../services';

export const useDashboard = (companyId, userId) => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    dealsClosed: 0,
    totalProperties: 0
  });
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load dashboard statistics
  const loadDashboardStats = useCallback(async () => {
    if (!companyId || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await DashboardService.getDashboardStats(companyId, userId);
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
        setStats({
          totalLeads: 0,
          dealsClosed: 0,
          totalProperties: 0
        });
      }
    } catch (err) {
      const errorMsg = 'Failed to load dashboard stats';
      setError(errorMsg);
      setStats({
        totalLeads: 0,
        dealsClosed: 0,
        totalProperties: 0
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  // Load today's events
  const loadTodayEvents = useCallback(async () => {
    if (!companyId || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await DashboardService.getTodayEvents(companyId, userId);
      if (result.success) {
        setTodayEvents(result.data);
      } else {
        setError(result.error);
        setTodayEvents([]);
      }
    } catch (err) {
      const errorMsg = 'Failed to load today events';
      setError(errorMsg);
      setTodayEvents([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    await Promise.all([
      loadDashboardStats(),
      loadTodayEvents()
    ]);
  }, [loadDashboardStats, loadTodayEvents]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    todayEvents,
    loading,
    error,
    refreshDashboard,
    loadDashboardStats,
    loadTodayEvents
  };
};