import { useState, useEffect, useCallback } from "react";
import { useLeads } from "../../../../../core/hooks/useLeads";
import { useLeadSearch } from "../../../../../core/hooks/useLeadSearch";
import { useUsers } from "../../../../../core/hooks/useUsers";
import { exportLeads } from "../../../../../core/utils/excelExport";

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
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleRefresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  useEffect(() => {
    if (!companyId) return;
    if (isSearchActive && activeSearchParams) {
      searchLeads(activeSearchParams, currentPage, pageSize);
    } else {
      loadLeads(currentPage, pageSize);
    }
  }, [companyId, currentPage, isSearchActive, activeSearchParams, refreshKey, searchLeads, loadLeads]);

  useEffect(() => {
    if (autoSearch) {
      const timeoutId = setTimeout(() => {
        applySearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [autoSearch, searchParams, applySearch]);

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

  const handleDeleteLead = (leadId) => {
    showConfirmModal(
      'Delete Lead',
      'Are you sure you want to delete this lead?',
      async () => {
        await deleteLead(leadId);
        handleRefresh();
      }
    );
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

  const handleExport = () => {
    if (!leads || leads.length === 0) {
      customAlert('❌ No leads to export');
      return;
    }
    
    const result = exportLeads(leads);
    if (result.success) {
      customAlert(`✅ ${result.message}`);
    } else {
      customAlert(`❌ ${result.message}`);
    }
  };

  const actionHandlers = {
    onStatusUpdate: handleStatusUpdate,
    onDelete: handleDeleteLead,
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
    <div className="flex justify-center items-start p-2">
      <div className="bg-white p-3 md:p-4 rounded-xl border shadow-sm w-full max-w-[1200px] min-h-[400px] max-h-[70vh] overflow-y-auto">
        <h2 className="text-center text-xl p-2 font-bold text-gray-800">Lead Management</h2>

        <LeadToolbar
          searchTerm={searchTerm}
          searchTags={searchTags}
          onSearchTermChange={setSearchTerm}
          onSearchEnter={handleSearchEnter}
          onRemoveSearchTag={removeSearchTag}
          onSearch={applySearch}
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
            onClearFilters={clearAll}
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
              onClearFilters={clearAll}
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
            onClearAll={clearAll}
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
