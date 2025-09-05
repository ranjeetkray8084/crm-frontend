// useLeads Hook - Refactored for Web & Mobile
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LeadService } from '../services/lead.service';
import { customAlert } from '../utils/alertUtils';
import axios from '../../legacy/api/axios';

export const useLeads = (companyId, userId, userRole) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const userInfo = useMemo(() => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    return {
      companyId: companyId || localUser.companyId,
      userId: userId || localUser.userId || localUser.id,
      role: userRole || localUser.role,
    };
  }, [companyId, userId, userRole]);

  const _fetchLeads = useCallback(async (page = 0, size = 10, searchParams = null) => {
    if (!userInfo.companyId) {
      setError('Company ID is missing.');
      return;
    }

    setLoading(true);
    setError(null);

    // Debug logging
    console.log('🔍 Leads API Call:', {
      page,
      size,
      searchParams,
      hasSearchParams: searchParams && Object.keys(searchParams).some(key => {
        const value = searchParams[key];
        return value && value.toString().trim() !== '';
      })
    });

    try {
      let result;
      const isSearching = searchParams && Object.keys(searchParams).length > 0;

      const backendSearchParams = {
        search: searchParams?.query,
        status: searchParams?.status,
        source: searchParams?.source,
        createdBy: searchParams?.createdBy,
        minBudget: searchParams?.budget?.split('-')[0],
        maxBudget: searchParams?.budget?.split('-')[1],
      };

      // Map assignedTo filter to action parameter
      if (searchParams?.assignedTo) {
        if (searchParams.assignedTo === 'assigned') {
          backendSearchParams.action = 'ASSIGNED';
        } else if (searchParams.assignedTo === 'unassigned') {
          backendSearchParams.action = 'UNASSIGNED';
        }
      } else if (searchParams?.action) {
        backendSearchParams.action = searchParams.action;
      }

      // Remove any undefined or null values
      Object.keys(backendSearchParams).forEach(key => {
        if (backendSearchParams[key] === undefined || backendSearchParams[key] === null || backendSearchParams[key] === '') {
          delete backendSearchParams[key];
        }
      });

      const isBackendSearching = Object.keys(backendSearchParams).length > 0;

      // SEARCH
      if (isBackendSearching) {
        if (userInfo.role === 'DIRECTOR') {
          result = await LeadService.searchLeads(userInfo.companyId, backendSearchParams, { page, size });
        } else if (userInfo.role === 'ADMIN') {
          result = await LeadService.searchLeadsVisibleToAdmin(userInfo.companyId, userInfo.userId, backendSearchParams, { page, size });
        } else {
          result = await LeadService.searchLeadsCreatedOrAssigned(userInfo.companyId, userInfo.userId, backendSearchParams, { page, size });
        }
      } 
      // GET
      else {
        if (userInfo.role === 'DIRECTOR') {
          result = await LeadService.getLeadsByCompany(userInfo.companyId, page, size);
        } else if (userInfo.role === 'ADMIN') {
          result = await LeadService.getLeadsVisibleToAdmin(userInfo.companyId, userInfo.userId, page, size);
        } else {
          result = await LeadService.getLeadsCreatedOrAssigned(userInfo.companyId, userInfo.userId, page, size);
        }
      }

      if (result.success) {
        const leadsData = result.data.content || result.data || [];

        const finalLeads = !isSearching
          ? [...leadsData.filter(l => l.status !== 'CLOSED' && l.status !== 'DROPED'), ...leadsData.filter(l => l.status === 'DROPED'), ...leadsData.filter(l => l.status === 'CLOSED')]
          : leadsData;

        setLeads(finalLeads);
        setPagination({
          page: result.data.number ?? page,
          size: result.data.size ?? size,
          totalElements: result.data.totalElements ?? finalLeads.length,
          totalPages: result.data.totalPages ?? 1,
        });
      } else {
        setError(result.error);
        customAlert('❌ ' + result.error);
      }
    } catch (err) {
      const errorMsg = `Failed to fetch leads: ${err.response?.data?.message || err.message}`;
      setError(errorMsg);
      customAlert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  }, [userInfo]);

  const loadLeads = useCallback((page = 0, size = 10) => _fetchLeads(page, size, null), [_fetchLeads]);
  const searchLeads = useCallback((searchParams, page = 0, size = 10) => _fetchLeads(page, size, searchParams), [_fetchLeads]);

  const executeApiCall = async (apiCall, successMsg, errorMsg, shouldReloadLeads = true) => {
    if (!userInfo.companyId) {
      customAlert("Company ID is missing.");
      return { success: false, error: "Company ID missing" };
    }
    try {
      const result = await apiCall();
      if (result.success) {
        if (successMsg) customAlert('✅ ' + successMsg);
        if (shouldReloadLeads) {
          // Don't show error if reload fails, just log it
          try {
            await loadLeads(0, 10);
          } catch (reloadError) {
    
          }
        }
        return { success: true, data: result.data };
      } else {
        const errText = (result.error || '').toString();
        // If backend says query didn't return a unique result but the entity was created,
        // treat it as soft-success for UX (avoid duplicate scary alert)
        const nonUnique = /Query did not return a unique result/i.test(errText) || /unique result: 2 results/i.test(errText);
        if (nonUnique) {
          // Show as warning but not blocking
          customAlert('⚠️ Created but duplicate match detected.');
          if (shouldReloadLeads) {
            try { await loadLeads(0, 10); } catch {}
          }
          return { success: true, data: result.data };
        }
        const cleaned = (errText || errorMsg || '').replace(/^([❌⚠️✅]\s*)+/, '').trim();
        customAlert('❌ ' + cleaned);
        return { success: false, error: cleaned };
      }
    } catch (err) {
      
      const serverMsg = err.response?.data?.message || err.response?.data;
      const finalErrorMsgRaw = (serverMsg || err.message || errorMsg || '').toString();
      const finalErrorMsg = finalErrorMsgRaw.replace(/^([❌⚠️✅]\s*)+/, '').trim();
      const nonUnique = /Query did not return a unique result/i.test(finalErrorMsg) || /unique result: 2 results/i.test(finalErrorMsg);
      if (nonUnique) {
        customAlert('⚠️ Created but duplicate match detected.');
        if (shouldReloadLeads) {
          try { await loadLeads(0, 10); } catch {}
        }
        return { success: true };
      }
      customAlert('❌ ' + finalErrorMsg);
      return { success: false, error: finalErrorMsg };
    }
  };

  const createLead = (leadData) =>
    executeApiCall(() => LeadService.createLead(userInfo.companyId, leadData), 'Lead created successfully', 'Failed to create lead');

  const updateLead = (leadId, leadData) =>
    executeApiCall(() => LeadService.updateLead(userInfo.companyId, leadId, leadData), 'Lead updated successfully', 'Failed to update lead');

  const deleteLead = (leadId) =>
    executeApiCall(() => LeadService.deleteLead(userInfo.companyId, leadId), 'Lead deleted successfully', 'Failed to delete lead');

  const updateLeadStatus = (leadId, status) =>
    executeApiCall(() => LeadService.updateLeadStatus(userInfo.companyId, leadId, status), 'Lead status updated successfully', 'Failed to update status', false);

  const updateBulkLeadStatus = useCallback(async (leadIds, status) => {
    if (!userInfo.companyId) {
      customAlert("Company ID is missing.");
      return { success: false, error: "Company ID missing" };
    }
    try {
      const promises = leadIds.map(leadId => LeadService.updateLeadStatus(userInfo.companyId, leadId, status));
      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.success);
      if (failed.length === 0) {
        customAlert(`✅ Updated ${leadIds.length} leads to ${status}`);
        loadLeads();
        return { success: true };
      } else {
        customAlert(`❌ Failed ${failed.length} updates`);
        return { success: false, error: 'Partial failure' };
      }
    } catch (err) {
      customAlert('❌ Bulk update failed');
      return { success: false, error: 'Bulk update failed' };
    }
  }, [userInfo, loadLeads]);

  const assignLead = useCallback(async (leadId, userId, userName) => {
    if (!userInfo.companyId || !userInfo.userId) {
      return { success: false, error: 'Missing company or assigner ID' };
    }
    try {
      const response = await axios.put(`/api/companies/${userInfo.companyId}/leads/${leadId}/assign/${userId}?assignerId=${userInfo.userId}`);
      customAlert(`✅ Lead assigned to ${userName}`);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Assignment failed';
      customAlert(`❌ ${message}`);
      return { success: false, error: message };
    }
  }, [userInfo]);

  const unassignLead = (leadId, unassignerId) =>
    executeApiCall(() => LeadService.unassignLead(userInfo.companyId, leadId, unassignerId), 'Lead unassigned', 'Unassign failed');

  const addRemark = useCallback(async (leadId, remarkData) => {
    if (!userInfo.companyId || !userInfo.userId) {
      return { success: false, error: 'Missing company or user ID' };
    }
    try {
      const data = { ...remarkData, userId: userInfo.userId };
      const result = await LeadService.addRemarkToLead(userInfo.companyId, leadId, data);
      if (result.success) {
        customAlert('✅ Remark added');
        return { success: true, data: result.data };
      } else {
        customAlert('❌ ' + (result.error || 'Failed to add remark'));
        return { success: false, error: result.error };
      }
    } catch {
      customAlert('❌ Failed to add remark');
      return { success: false, error: 'Failed to add remark' };
    }
  }, [userInfo]);

  const getRemarks = (leadId) =>
    executeApiCall(() => LeadService.getRemarksByLeadId(userInfo.companyId, leadId), '', '', false);

  useEffect(() => {
    if (userInfo.companyId) loadLeads();
  }, [userInfo.companyId]);

  return {
    leads,
    loading,
    error,
    pagination,
    loadLeads,
    searchLeads,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    updateBulkLeadStatus,
    assignLead,
    unassignLead,
    addRemark,
    getRemarks,
  };
};
