import { useState, useEffect, useCallback } from "react";
import { useProperties } from "../../../../../core/hooks/useProperties";
import { usePropertySearch } from "../../../../../core/hooks/usePropertySearch";
import { useUsers } from "../../../../../core/hooks/useUsers";
import { customAlert } from "../../../../../core/utils/alertUtils";
import { exportProperties } from "../../../../../core/utils/excelExport";

// Import all necessary components
import PropertyToolbar from './PropertyToolbar';
import PropertyFilters from './PropertyFilters';
import PropertiesTable from './PropertiesTable';
import MobilePropertyList from './MobilePropertyList';
import Pagination from './Pagination';
import PropertiesFeedback from './PropertiesFeedback';
import SearchResultsSummary from './SearchResultsSummary';
import ConfirmModal from '../../common/ConfirmModal';
import AddRemarkModal from './action/AddRemarkModal';
import PropertyRemarksModal from './action/PropertyRemarksModal';
import UpdatePropertyModal from './action/UpdatePropertyModal';

const PropertiesSection = ({ userRole, userId, companyId }) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [autoSearch] = useState(true);

  const [editingProperty, setEditingProperty] = useState(null);
  const [remarkingProperty, setRemarkingProperty] = useState(null);
  const [viewingRemarksProperty, setViewingRemarksProperty] = useState(null);
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
    removeSearchTag, handleSearchEnter, updateFilter, searchTrigger,
    clearAll, clearSearch, applySearch
  } = usePropertySearch();

  const {
    properties, loading, error, pagination, loadProperties, searchProperties,
    updateProperty, deleteProperty, addRemark, getRemarks
  } = useProperties(companyId, userId, userRole);

  const { users: filterUsers } = useUsers(companyId);

  const handleRefresh = useCallback(() => {
    // Maintain current page position when refreshing
    if (isSearchActive && activeSearchParams) {
      searchProperties(activeSearchParams, currentPage, pageSize);
    } else {
      loadProperties(currentPage, pageSize);
    }
  }, [isSearchActive, activeSearchParams, currentPage, pageSize, searchProperties, loadProperties]);

  const handleClearAll = useCallback(() => {
    clearAll();
    setCurrentPage(0);
    // Force reload of original data after clearing
    setTimeout(() => {
      loadProperties(0, pageSize);
    }, 0);
  }, [clearAll, loadProperties, pageSize]);

  // Main data loading effect - handles both search and regular loading
  useEffect(() => {
    if (!companyId) return;
    
    if (isSearchActive && activeSearchParams) {
      searchProperties(activeSearchParams, currentPage, pageSize);
    } else {
      loadProperties(currentPage, pageSize);
    }
  }, [companyId, currentPage, isSearchActive, activeSearchParams, searchProperties, loadProperties, pageSize]);

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

  // Manual search trigger
  const handleManualSearch = useCallback(() => {
    if (companyId && (searchTags.length > 0 || hasActiveFilters || searchTerm.trim())) {
      // Reset to first page when manually searching
      setCurrentPage(0);
      applySearch();
    }
  }, [companyId, searchTags.length, hasActiveFilters, searchTerm, applySearch]);

  const handleUpdateProperty = (property) => setEditingProperty(property);

  const handleConfirmUpdate = async (updatedPropertyData) => {
    if (!editingProperty) return;
    await updateProperty(editingProperty.id || editingProperty.propertyId, updatedPropertyData);
    setEditingProperty(null);
    handleRefresh();
  };

  const handleAddRemark = (property) => setRemarkingProperty(property);

  const handleConfirmAddRemark = async (remarkData) => {
    if (!remarkingProperty) return;
    const propertyId = remarkingProperty.id || remarkingProperty.propertyId;
    await addRemark(propertyId, remarkData);
    setRemarkingProperty(null);
    handleRefresh();
  };

  const handleGetRemarks = (property) => setViewingRemarksProperty(property);

  const handleStatusUpdate = async (propertyId, newStatus) => {
    try {
      const result = await updateProperty(propertyId, { status: newStatus });
      if (result.success) {
        customAlert(`✅ Property status updated to: ${newStatus}`);
      } else {
        customAlert(`❌ Failed to update property status: ${result.error}`);
      }
      handleRefresh();
    } catch (error) {
      customAlert(`❌ Failed to update property status: ${error.message}`);
    }
  };



  const handleOutOfBox = (property) => {
    // Handle Out of Box action
    
    // You can implement any custom logic here
    // For example, show a modal, navigate to a special page, etc.
    customAlert(`🚀 Out of Box action triggered for: ${property.propertyName || property.name}`);
  };

  const showConfirmModal = (title, message, onConfirm) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const handleExport = () => {
    if (!properties || properties.length === 0) {
      customAlert('❌ No properties to export');
      return;
    }
    
    const result = exportProperties(properties);
    if (result.success) {
      customAlert(`✅ ${result.message}`);
    } else {
      customAlert(`❌ ${result.message}`);
    }
  };

  const actionHandlers = {
    onStatusChange: handleStatusUpdate,
    onUpdate: handleUpdateProperty,
    onAddRemark: handleAddRemark,
    onViewRemarks: handleGetRemarks,
    onOutOfBox: handleOutOfBox,
    companyId: companyId
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-2 sm:p-4">
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border shadow-sm w-full max-w-[1200px] h-fit">
        <h2 className="text-center text-xl p-2 font-bold text-gray-800">Property Management</h2>

        <PropertyToolbar
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
          <PropertyFilters
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={handleClearAll}
            isMobile={false}
            hasActiveFilters={hasActiveFilters}
            activeFiltersSummary={getActiveFiltersSummary(userId, filterUsers)}
            autoApply={autoSearch}
            companyId={companyId}
            userId={userId}
            availableUsers={filterUsers}
          />
        </div>

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <div className="md:hidden">
            <PropertyFilters
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={handleClearAll}
              isMobile={true}
              hasActiveFilters={hasActiveFilters}
              activeFiltersSummary={getActiveFiltersSummary(userId, filterUsers)}
              autoApply={autoSearch}
              companyId={companyId}
              userId={userId}
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

        <PropertiesFeedback loading={loading} error={error} isEmpty={!loading && properties.length === 0} />

        {!loading && !error && properties.length > 0 && (
          <>
            <PropertiesTable properties={properties} searchTerm={searchTerm} {...actionHandlers} />
            <MobilePropertyList properties={properties} {...actionHandlers} />
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
      <UpdatePropertyModal
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        propertyToUpdate={editingProperty}
        onUpdate={handleConfirmUpdate}
      />

      <AddRemarkModal
        isOpen={!!remarkingProperty}
        onClose={() => setRemarkingProperty(null)}
        onAddRemark={handleConfirmAddRemark}
        property={remarkingProperty}
      />

      <PropertyRemarksModal
        isOpen={!!viewingRemarksProperty}
        onClose={() => setViewingRemarksProperty(null)}
        property={viewingRemarksProperty}
        companyId={companyId}
        onGetRemarks={getRemarks}
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

export default PropertiesSection;
