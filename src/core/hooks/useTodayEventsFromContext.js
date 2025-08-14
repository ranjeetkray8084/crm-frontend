import { useState, useEffect, useCallback } from 'react';
import { useNotesContext } from '../../shared/contexts/NotesContext';
import { DashboardService } from '../services/dashboard.service';

export const useTodayEventsFromContext = (companyId, userId, role) => {
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { getTodayEvents, allNotes, notesLoading } = useNotesContext();

  const loadTodayEvents = useCallback(async () => {
    if (!userId || !companyId) {
      setTodayEvents([]);
      setLoading(false);
      return;
    }

    // Wait for notes to be loaded first
    if (notesLoading) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get today's events from the shared notes context
      const events = getTodayEvents();
      
      // Enrich events with username information
      const enrichedEvents = await Promise.all(
        events.map(async (note) => {
          try {
            const res = await DashboardService.getUsernameById(note.userId);
            return { ...note, username: res.success ? res.data : 'Unknown' };
          } catch {
            return { ...note, username: 'Unknown' };
          }
        })
      );

      setTodayEvents(enrichedEvents);
    } catch (err) {
      setError(err.message || 'Failed to load today events');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, role, getTodayEvents, notesLoading]);

  useEffect(() => {
    loadTodayEvents();
  }, [loadTodayEvents]);

  // Also reload when notes data changes
  useEffect(() => {
    if (!notesLoading && allNotes.length > 0) {
      loadTodayEvents();
    }
  }, [allNotes, notesLoading, loadTodayEvents]);

  return { todayEvents, loading, error };
};
