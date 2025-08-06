import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../services/dashboard.service';

export const useDashboardStats = (companyId, userId, role) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    if (!companyId || !userId || !role) return;

    setLoading(true);
    setError(null);

    try {
      let propertiesResult, propertiesOverviewResult;
      if (role === 'USER') {
        propertiesResult = await DashboardService.getPropertiesCountByUser(companyId, userId);
        propertiesOverviewResult = { data: {} };
      } else {
        propertiesResult = await DashboardService.getPropertiesCount(companyId);
        propertiesOverviewResult = await DashboardService.getPropertiesOverview(companyId);
      }

      let closedLeadsResult;
      if (role === 'ADMIN') {
        closedLeadsResult = await DashboardService.getClosedLeadsCountByAdmin(companyId, userId);
      } else if (role === 'USER') {
        const res = await DashboardService.getLeadsCountForUser(companyId, userId);
        closedLeadsResult = { data: res.data?.closedCount || 0 };
      } else {
        closedLeadsResult = await DashboardService.getClosedLeadsCount(companyId);
      }

      let newContactedResult;
      try {
        newContactedResult = await DashboardService.getNewContactedLeadsCount(companyId);
      } catch {
        const fallback = await DashboardService.getLeadsCount(companyId);
        newContactedResult = {
          data: {
            totalLeads: fallback.data || 0,
            newLeads: 0,
            contactedLeads: 0,
          },
        };
      }

      let dealsCloseResult;
      try {
        dealsCloseResult = await DashboardService.getDealsCloseCount(companyId);
      } catch {
        dealsCloseResult = {
          data: {
            'total close': 0,
            closed: 0,
            dropped: 0,
          },
        };
      }

      let usersOverviewResult;
      try {
        usersOverviewResult = await DashboardService.getUsersAndAdminsOverview(companyId);
      } catch {
        usersOverviewResult = {
          data: {
            totalNormalUsers: 0,
            activeAdmins: 0,
            totalUsers: 0,
            totalAdmins: 0,
            deactiveAdmins: 0,
            deactiveNormalUsers: 0,
            activeNormalUsers: 0,
          },
        };
      }

      setStats({
        totalLeads: newContactedResult.data?.totalLeads || 0,
        newLeads: newContactedResult.data?.newLeads || 0,
        contactedLeads: newContactedResult.data?.contactedLeads || 0,
        totalProperties: propertiesResult.data || 0,
        propertyOverview: {
          totalProperties: propertiesOverviewResult.data?.totalProperties || 0,
          'available for sale': propertiesOverviewResult.data?.['available for sale'] || 0,
          'available for rent': propertiesOverviewResult.data?.['available for rent'] || 0,
          'sold out': propertiesOverviewResult.data?.['sold out'] || 0,
          'rent out': propertiesOverviewResult.data?.['rent out'] || 0,
        },
        dealsOverview: {
          'total close': dealsCloseResult.data?.['total close'] || closedLeadsResult.data || 0,
          closed: dealsCloseResult.data?.closed || 0,
          dropped: dealsCloseResult.data?.dropped || 0,
        },
        usersOverview: usersOverviewResult.data,
      });
    } catch (err) {
      console.error('❌ Dashboard stats fetch failed:', err);
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, role]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error };
};

export const useTodayEvents = (companyId, userId) => {
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTodayEvents = useCallback(async () => {
    if (!companyId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      const [userNotes, publicNotes, visibleNotes] = await Promise.all([
        DashboardService.getUserNotes(companyId, userId),
        DashboardService.getPublicNotes(companyId),
        DashboardService.getNotesVisibleToUser(companyId, userId),
      ]);

      const combinedNotes = [
        ...(userNotes.data || []),
        ...(publicNotes.data || []),
        ...(visibleNotes.data || []),
      ];

      const todayMap = new Map();
      combinedNotes.forEach((note) => {
        const noteDate = new Date(note.dateTime).toISOString().split('T')[0];
        if (note.status !== 'CLOSED' && noteDate === today) {
          todayMap.set(note.id, note);
        }
      });

      const enrichedEvents = await Promise.all(
        Array.from(todayMap.values()).map(async (note) => {
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
      console.error('❌ Today events fetch failed:', err);
      setError(err.message || 'Failed to load today events');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  useEffect(() => {
    loadTodayEvents();
  }, [loadTodayEvents]);

  return { todayEvents, loading, error };
};
