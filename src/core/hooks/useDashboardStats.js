import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../services/dashboard.service';

export const useDashboardStats = (companyId, userId, role) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    if (!userId || !role) {
      setLoading(false);
      return;
    }

    // Special handling for DEVELOPER role
    if (role === 'DEVELOPER') {
      setLoading(true);
      setError(null);

      try {
        // For developers, we need to get global stats across all companies
        const [companiesResult, usersResult, adminsResult, directorsResult] = await Promise.allSettled([
          DashboardService.getTotalCompaniesCount(),
          DashboardService.getTotalUsersCount(),
          DashboardService.getTotalAdminsCount(),
          DashboardService.getTotalDirectorsCount()
        ]);

        const finalStats = {
          totalCompanies: companiesResult.status === 'fulfilled' ? companiesResult.value.data || 0 : 0,
          totalUsers: usersResult.status === 'fulfilled' ? usersResult.value.data || 0 : 0,
          totalAdmins: adminsResult.status === 'fulfilled' ? adminsResult.value.data || 0 : 0,
          totalDirectors: directorsResult.status === 'fulfilled' ? directorsResult.value.data || 0 : 0,
        };

        console.log('🔍 useDashboardStats: Developer stats:', finalStats);
        setStats(finalStats);
      } catch (err) {
        console.error('❌ useDashboardStats: Developer stats failed:', err);
        setStats({
          totalCompanies: 0,
          totalUsers: 0,
          totalAdmins: 0,
          totalDirectors: 0,
        });
        setError(err.message || 'Failed to load developer stats');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!companyId) {
      setStats({
        totalLeads: 0,
        newLeads: 0,
        contactedLeads: 0,
        totalProperties: 0,
        propertyOverview: {
          totalProperties: 0,
          'available for sale': 0,
          'available for rent': 0,
          'sold out': 0,
          'rent out': 0,
        },
        dealsOverview: {
          'total close': 0,
          closed: 0,
          dropped: 0,
        },
        usersOverview: {
          totalNormalUsers: 0,
          activeAdmins: 0,
          totalUsers: 0,
          totalAdmins: 0,
          deactiveAdmins: 0,
          deactiveNormalUsers: 0,
          activeNormalUsers: 0,
        },
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let propertiesResult, propertiesOverviewResult;
      if (role === 'USER') {
        propertiesResult = await DashboardService.getPropertiesCountByUser(companyId, userId);
        // Show the same property overview as Director/Admin (company-wide)
        propertiesOverviewResult = await DashboardService.getPropertiesOverview(companyId);
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
        console.log('🔍 useDashboardStats: Calling getNewContactedLeadsCount with:', { companyId, userId });
        newContactedResult = await DashboardService.getNewContactedLeadsCount(companyId, userId);
        console.log('✅ useDashboardStats: getNewContactedLeadsCount result:', newContactedResult);
      } catch (error) {
        console.error('❌ useDashboardStats: getNewContactedLeadsCount failed, using fallback:', error);
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
        dealsCloseResult = await DashboardService.getDealsCloseCount(companyId, userId, role);
      } catch {
        dealsCloseResult = {
          data: {
            'total close': 0,
            closed: 0,
            dropped: 0,
          },
        };
      }

      // Users overview API call
      let usersOverviewResult;
      try {
        console.log('🔍 useDashboardStats: Calling getUsersAndAdminsOverview with:', { companyId, userId });
        usersOverviewResult = await DashboardService.getUsersAndAdminsOverview(companyId, userId);
        console.log('✅ useDashboardStats: getUsersAndAdminsOverview successful');
      } catch (err) {
        console.warn('❌ useDashboardStats: Users overview API failed:', err);
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

      const finalStats = {
        totalLeads: newContactedResult.data?.totalLeads || 0,
        newLeads: newContactedResult.data?.newLeads || 0,
        contactedLeads: newContactedResult.data?.contactedLeads || 0,
        closedLeads: newContactedResult.data?.closedLeads || 0,
        droppedLeads: newContactedResult.data?.droppedLeads || 0,
        totalProperties: propertiesResult.data || 0,
        propertyOverview: {
          totalProperties: propertiesOverviewResult.data?.totalProperties || 0,
          'available for sale': propertiesOverviewResult.data?.['available for sale'] || 0,
          'available for rent': propertiesOverviewResult.data?.['available for rent'] || 0,
          'sold out': propertiesOverviewResult.data?.['sold out'] || 0,
          'rent out': propertiesOverviewResult.data?.['rent out'] || 0,
        },
        dealsOverview: {
          'total close': dealsCloseResult.data?.['total close'] || 0,
          closed: dealsCloseResult.data?.closed || 0,
          dropped: dealsCloseResult.data?.dropped || 0,
        },
        usersOverview: usersOverviewResult.data,
      };
      
      console.log('🔍 useDashboardStats: Final stats object:', finalStats);
      setStats(finalStats);
    } catch (err) {
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
    if (!userId) {
      setLoading(false);
      return;
    }

    if (!companyId) {
      setTodayEvents([]);
      setLoading(false);
      return;
    }

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
