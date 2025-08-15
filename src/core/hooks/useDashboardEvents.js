import { useState, useEffect, useCallback } from 'react';
import { NoteService } from '../services/note.service';
import { DashboardService } from '../services/dashboard.service';

export const useDashboardEvents = (companyId, userId, role) => {
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTodayEvents = useCallback(async () => {
    if (!companyId || !userId || !role) {
      setTodayEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the new dashboard-optimized endpoint
      const result = await NoteService.getTodayEventsForDashboard(companyId, userId, role);
      
      if (result.success) {
        // Enrich events with username information
        const enrichedEvents = await Promise.all(
          result.data.map(async (event) => {
            try {
              const res = await DashboardService.getUsernameById(event.userId);
              return { 
                ...event, 
                username: res.success ? res.data : 'Unknown',
                content: event.content || 'No content',
                dateTime: event.dateTime
              };
            } catch {
              return { 
                ...event, 
                username: 'Unknown',
                content: event.content || 'No content',
                dateTime: event.dateTime
              };
            }
          })
        );

        setTodayEvents(enrichedEvents);
      } else {
        setError(result.error || 'Failed to load today\'s events');
        setTodayEvents([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load today\'s events');
      setTodayEvents([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, role]);

  useEffect(() => {
    loadTodayEvents();
  }, [loadTodayEvents]);

  return { todayEvents, loading, error, refreshEvents: loadTodayEvents };
};