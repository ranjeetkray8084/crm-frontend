import { useState, useEffect, useCallback } from "react";
import { useLeads } from "../../../../../core/hooks/useLeads";
import { useLeadSearch } from "../../../../../core/hooks/useLeadSearch";
import { useUsers } from "../../../../../core/hooks/useUsers";
import { exportLeads } from "../../../../../core/utils/excelExport";
import { customAlert } from "../../../../../core/utils/alertUtils";

// Import all necessary components
import LeadToolbar from './LeadToolbar';
import LeadFilters from './LeadFilters';
import LeadsTable from './LeadsTable';
import MobileLeadList from './MobileLeadList';
import Pagination from './Pagination';
import LeadsFeedback from './LeadsFeedback';
import SearchResultsSummary from './SearchResultsSummary';
import ConfirmModal from '../../common/ConfirmModal';
import AssignLeadModal from './action/AssignLeadModal';
import UpdateLeadModal from './action/UpdateLeadModal';
import AddRemarkModal from './action/AddRemarkModal';
import LeadRemarksModal from './action/LeadRemarksModal';
import AddFollowUpModal from './action/AddFollowUpModal';
import ViewFollowUpsModal from './action/ViewFollowUpsModal';


const LeadsSection = ({ userRole, userId, companyId }) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [autoSearch] = useState(true);

  const [editingLead, setEditingLead] = useState(null);
  const [remarkingLead, setRemarkingLead] = useState(null);
  const [viewingRemarksLead, setViewingRemarksLead] = useState(null);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [viewFollowUpsLead, setViewFollowUpsLead] = useState(null);

  const [assignModal, setAssignModal] = useState({ isOpen: false, leadId: null });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const pageSize = 10;

  const {
    searchTerm, searchTags, filters, isSearchActive, activeSearchParams,
    hasActiveFilters, searchParams, getActiveFiltersSummary, setSearchTerm,
    removeSearchTag, handleSearchEnter, updateFilter,
    clearAll, clearSearch, applySearch
  } = useLeadSearch();

  const {
    leads, loading, error, pagination, loadLeads, searchLeads,
    updateLeadStatus, updateLead, deleteLead, addRemark,
    assignLead, unassignLead, getRemarks
  } = useLeads(companyId, userId, userRole);

  const { users: filterUsers } = useUsers(companyId);

  const handleClearAll = useCallback(() => {
    clearAll();
    setCurrentPage(0);
    // Force reload of original data after clearing
    setTimeout(() => {
      loadLeads(0, pageSize);
    }, 0);
  }, [clearAll, loadLeads, pageSize]);

  const handleManualSearch = useCallback(() => {
    if (companyId && (searchTags.length > 0 || hasActiveFilters || searchTerm.trim())) {
      // Reset to first page when manually searching
      setCurrentPage(0);
      applySearch();
    }
  }, [companyId, searchTags.length, hasActiveFilters, searchTerm, applySearch]);

  const handleRefresh = useCallback(() => {
    // Maintain current page position when refreshing
    if (isSearchActive && activeSearchParams) {
      searchLeads(activeSearchParams, currentPage, pageSize);
    } else {
      loadLeads(currentPage, pageSize);
    }
  }, [isSearchActive, activeSearchParams, currentPage, pageSize, searchLeads, loadLeads]);

  // Main data loading effect - handles both search and regular loading
  useEffect(() => {
    if (!companyId) return;
    
    if (isSearchActive && activeSearchParams) {
      searchLeads(activeSearchParams, currentPage, pageSize);
    } else {
      loadLeads(currentPage, pageSize);
    }
  }, [companyId, currentPage, isSearchActive, activeSearchParams, searchLeads, loadLeads, pageSize]);

  // Auto-search when filters change (if autoSearch is enabled)
  useEffect(() => {
    if (autoSearch && companyId && hasActiveFilters) {
      const timeoutId = setTimeout(() => {
        // Reset to first page when filters change
        setCurrentPage(0);
        applySearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [autoSearch, companyId, filters, hasActiveFilters, applySearch]);

  const handleUpdateLead = (lead) => setEditingLead(lead);

  const handleConfirmUpdate = async (updatedLeadData) => {
    if (!editingLead) return;
    await updateLead(editingLead.id || editingLead.leadId, updatedLeadData);
    setEditingLead(null);
    handleRefresh();
  };

  const handleAddRemark = (lead) => setRemarkingLead(lead);

  const handleConfirmAddRemark = async (remarkData) => {
    if (!remarkingLead) return;
    const leadId = remarkingLead.id || remarkingLead.leadId;
    await addRemark(leadId, remarkData);
    setRemarkingLead(null);
    handleRefresh();
  };

  const handleGetRemarks = (lead) => setViewingRemarksLead(lead);

  const handleAddFollowUp = (lead) => setFollowUpLead(lead);

  const handleViewFollowUps = (lead) => setViewFollowUpsLead(lead);



  const handleConfirmAddFollowUp = async (followUpData) => {
    if (!followUpLead) return;
    const leadId = followUpLead.id || followUpLead.leadId;
    
    try {
      // The follow-up is already created by the modal using useFollowUp hook
      setFollowUpLead(null);
      handleRefresh();
    } catch (error) {
      
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    await updateLeadStatus(leadId, newStatus);
    handleRefresh();
  };

 

  const handleAssignLead = (leadId) => {
    setAssignModal({ isOpen: true, leadId });
  };

  const handleUnassignLead = (leadId) => {
    showConfirmModal(
      'Unassign Lead',
      'Are you sure you want to unassign this lead?',
      async () => {
        await unassignLead(leadId, userId);
        handleRefresh();
      }
    );
  };

  const showConfirmModal = (title, message, onConfirm) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const handleExport = async () => {
    try {
      customAlert('🔄 Fetching all leads for export...');
      
      // Fetch all leads for export by calling the API directly with a large size
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      const companyIdToUse = companyId || localUser.companyId;
      
      if (!companyIdToUse) {
        customAlert('❌ Company ID not found');
        return;
      }
      
      // Import LeadService to fetch all data
      const { LeadService } = await import('../../../../../core/services/lead.service');
      
      let result;
      
      // Check if we have active search/filter parameters
      if (isSearchActive && activeSearchParams && Object.keys(activeSearchParams).length > 0) {
        // Use search API to get all filtered data
        console.log('🔍 Exporting filtered leads with params:', activeSearchParams);
        
        // Prepare search parameters for the API
        const backendSearchParams = {
          search: activeSearchParams?.search,
          status: activeSearchParams?.status,
          source: activeSearchParams?.source,
          createdBy: activeSearchParams?.createdBy,
          minBudget: activeSearchParams?.budget?.split('-')[0],
          maxBudget: activeSearchParams?.budget?.split('-')[1],
        };
        
        // Map assignedTo filter to action parameter
        if (activeSearchParams?.assignedTo) {
          if (activeSearchParams.assignedTo === 'assigned') {
            backendSearchParams.action = 'ASSIGNED';
          } else if (activeSearchParams.assignedTo === 'unassigned') {
            backendSearchParams.action = 'UNASSIGNED';
          }
        } else if (activeSearchParams?.action) {
          backendSearchParams.action = activeSearchParams.action;
        }
        
        // Remove any undefined or null values
        Object.keys(backendSearchParams).forEach(key => {
          if (backendSearchParams[key] === undefined || backendSearchParams[key] === null || backendSearchParams[key] === '') {
            delete backendSearchParams[key];
          }
        });
        
        result = await LeadService.searchLeads(companyIdToUse, backendSearchParams, { page: 0, size: 10000 });
      } else {
        // Use regular API to get all data
        result = await LeadService.getLeadsByCompany(companyIdToUse, 0, 10000);
      }
      
      if (!result.success || !result.data?.content || result.data.content.length === 0) {
        customAlert('❌ No leads to export');
        return;
      }
      
      customAlert('🔄 Exporting leads...');
      
      const exportResult = exportLeads(result.data.content);
      
      if (exportResult.success) {
        customAlert(`✅ ${exportResult.message}`);
      } else {
        customAlert(`❌ ${exportResult.message}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      customAlert(`❌ Failed to export leads: ${error.message}`);
    }
  };

  const actionHandlers = {
    onStatusUpdate: handleStatusUpdate,
    onAssign: handleAssignLead,
    onUnassign: handleUnassignLead,
    onUpdate: handleUpdateLead,
    onAddRemark: handleAddRemark,
    onGetRemarks: handleGetRemarks,
    onAddFollowUp: handleAddFollowUp,
    onViewFollowUps: handleViewFollowUps,
    companyId: companyId
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-2 sm:p-4">
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border shadow-sm w-full max-w-[1200px] h-fit">
        <h2 className="text-center text-xl p-2 font-bold text-gray-800">Lead Management</h2>

        <LeadToolbar
          searchTerm={searchTerm}
          searchTags={searchTags}
          onSearchTermChange={setSearchTerm}
          onSearchEnter={handleSearchEnter}
          onRemoveSearchTag={removeSearchTag}
          onSearch={handleManualSearch}
          onExport={handleExport}
          onRefresh={handleRefresh}
          onClearSearch={clearSearch}
          onToggleMobileFilters={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          isSearchActive={isSearchActive}
          isLoading={loading}
          autoSearch={autoSearch}
        />

        {/* Desktop Filters */}
        <div className="hidden md:block">
          <LeadFilters
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={handleClearAll}
            isMobile={false}
            hasActiveFilters={hasActiveFilters}
            activeFiltersSummary={getActiveFiltersSummary()}
            autoApply={autoSearch}
            userRole={userRole}
            userId={userId}
            companyId={companyId}
            availableUsers={filterUsers}
          />
        </div>

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <div className="md:hidden">
            <LeadFilters
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={handleClearAll}
              isMobile={true}
              hasActiveFilters={hasActiveFilters}
              activeFiltersSummary={getActiveFiltersSummary()}
              autoApply={autoSearch}
              userRole={userRole}
              userId={userId}
              companyId={companyId}
              availableUsers={filterUsers}
            />
          </div>
        )}

        {isSearchActive && (
          <SearchResultsSummary
            isSearchActive={isSearchActive}
            totalResults={pagination?.totalElements || 0}
            currentPage={currentPage}
            pageSize={pageSize}
            hasActiveFilters={hasActiveFilters}
            activeFiltersSummary={getActiveFiltersSummary()}
            onClearAll={handleClearAll}
          />
        )}

        <LeadsFeedback loading={loading} error={error} isEmpty={!loading && leads.length === 0} />

        {!loading && !error && leads.length > 0 && (
          <>
            <LeadsTable leads={leads} searchTerm={searchTerm} {...actionHandlers} />
            <MobileLeadList leads={leads} {...actionHandlers} />
          </>
        )}

        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* MODALS */}
      <UpdateLeadModal
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        lead={editingLead}
        onUpdate={handleConfirmUpdate}
      />

      <AddRemarkModal
        isOpen={!!remarkingLead}
        onClose={() => setRemarkingLead(null)}
        onAddRemark={handleConfirmAddRemark}
        lead={remarkingLead}
      />

      <LeadRemarksModal
        isOpen={!!viewingRemarksLead}
        onClose={() => setViewingRemarksLead(null)}
        lead={viewingRemarksLead}
        companyId={companyId}
        onGetRemarks={getRemarks}
      />

      <AddFollowUpModal
        isOpen={!!followUpLead}
        onClose={() => setFollowUpLead(null)}
        onAddFollowUp={handleConfirmAddFollowUp}
        lead={followUpLead}
      />

      <ViewFollowUpsModal
        isOpen={!!viewFollowUpsLead}
        onClose={() => setViewFollowUpsLead(null)}
        lead={viewFollowUpsLead}
        companyId={companyId}
      />

      <AssignLeadModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, leadId: null })}
        onAssign={async (leadId, userId, userName) => {
          await assignLead(leadId, userId, userName);
          handleRefresh();
        }}
        leadId={assignModal.leadId}
        companyId={companyId}
        userRole={userRole}
        currentUserId={userId}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
};

export default LeadsSection;
