import { useState, useEffect, useCallback } from "react";
import { useProperties } from "../../../../../core/hooks/useProperties";
import { usePropertySearch } from "../../../../../core/hooks/usePropertySearch";
import { useUsers } from "../../../../../core/hooks/useUsers";

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
  const [autoSearch] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleClearAll = useCallback(() => {
    clearAll();
    setCurrentPage(0);
    // Force reload of original data after clearing
    setTimeout(() => {
      loadProperties(0, pageSize);
    }, 0);
  }, [clearAll, loadProperties, pageSize]);

  // Initial load and page changes
  useEffect(() => {
    if (!companyId) {
      console.log('No companyId provided');
      return;
    }
    
    console.log('Loading properties - Page:', currentPage, 'RefreshKey:', refreshKey);
    loadProperties(currentPage, pageSize);
  }, [companyId, currentPage, refreshKey, loadProperties]);

  // Handle search when search params change or search is triggered
  useEffect(() => {
    if (!companyId) return;
    
    if (isSearchActive && activeSearchParams) {
      console.log('Search active, calling searchProperties with:', activeSearchParams);
      searchProperties(activeSearchParams, currentPage, pageSize);
    } else if (!isSearchActive) {
      // When search becomes inactive (cleared), reload original data
      console.log('Search cleared, loading original properties');
      loadProperties(currentPage, pageSize);
    }
  }, [companyId, isSearchActive, activeSearchParams, currentPage, searchProperties, searchTrigger, loadProperties, pageSize]);

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
    await updateProperty(propertyId, { status: newStatus });
    handleRefresh();
  };

  const handleDeleteProperty = (propertyId) => {
    showConfirmModal(
      'Delete Property',
      'Are you sure you want to delete this property?',
      async () => {
        await deleteProperty(propertyId);
        handleRefresh();
      }
    );
  };

  const showConfirmModal = (title, message, onConfirm) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const handleExport = () => {
    console.log('Export functionality to be implemented');
  };

  const actionHandlers = {
    onStatusUpdate: handleStatusUpdate,
    onDelete: handleDeleteProperty,
    onUpdate: handleUpdateProperty,
    onAddRemark: handleAddRemark,
    onViewRemarks: handleGetRemarks,
    companyId: companyId
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-4">
      <div className="bg-white p-4 md:p-6 rounded-xl border shadow-sm w-full max-w-[1200px] h-fit">
        <h2 className="text-center text-xl p-2 font-bold text-gray-800">Property Management</h2>

        <PropertyToolbar
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
          <PropertyFilters
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={handleClearAll}
            isMobile={false}
            hasActiveFilters={hasActiveFilters}
            activeFiltersSummary={getActiveFiltersSummary()}
            autoApply={autoSearch}
            companyId={companyId}
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
              activeFiltersSummary={getActiveFiltersSummary()}
              autoApply={autoSearch}
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

        <PropertiesFeedback loading={loading} error={error} isEmpty={!loading && properties.length === 0} />

        {!loading && !error && properties.length > 0 && (
          <>
            <PropertiesTable properties={properties} searchTerm={searchTerm} {...actionHandlers} />
            <MobilePropertyList properties={properties} {...actionHandlers} />
          </>
        )}

        {!loading && !error && pagination && (
          <div>
            <div className="text-xs text-gray-500 mb-2">
              Debug: totalPages={pagination.totalPages}, totalElements={pagination.totalElements}, page={pagination.page}, size={pagination.size}
            </div>
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                pagination={pagination}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
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
