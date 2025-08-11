import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import MobileLeadCard from './MobileLeadCard'; // Make sure this path is correct

/**
 * Main component to render a list of leads as cards for mobile view.
 * Includes bulk action capabilities.
 */
const MobileLeadList = ({
  leads = [],
  onStatusUpdate,
  onBulkStatusUpdate,
  onDelete,
  onAddRemark,
  onGetRemarks,
  onAssign,
  onUnassign,
  onUpdate,
  onAddFollowUp,
  onViewFollowUps
}) => {
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const bulkActionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bulkActionsRef.current &&
        !bulkActionsRef.current.contains(event.target)
      ) {
        setShowBulkActions(false);
      }

      const isActionMenuClick = event.target.closest('[data-role="action-menu"]');
      if (!isActionMenuClick) {
        setActiveLeadId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getValidLeadId = (lead) => lead?.leadId ?? lead?.id;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(new Set(leads.map(getValidLeadId).filter(Boolean)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId) => {
    if (!leadId) return;
    const newSelected = new Set(selectedLeads);
    newSelected.has(leadId)
      ? newSelected.delete(leadId)
      : newSelected.add(leadId);
    setSelectedLeads(newSelected);
  };

  const handleToggleActions = (leadId) => {
    setActiveLeadId((prevId) => (prevId === leadId ? null : leadId));
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    const selectedArray = Array.from(selectedLeads);
    if (selectedArray.length === 0) return;
    await onBulkStatusUpdate(selectedArray, newStatus);
    setSelectedLeads(new Set());
    setShowBulkActions(false);
  };

  const statusOptions = [
    { value: 'NEW', label: 'New', color: 'text-yellow-600' },
    { value: 'CONTACTED', label: 'Contacted', color: 'text-blue-600' },
    { value: 'CLOSED', label: 'Closed', color: 'text-green-600' },
    { value: 'DROPED', label: 'Dropped', color: 'text-red-600' }
  ];

  const validLeads = leads.filter((lead) => getValidLeadId(lead));
  const isAllSelected =
    selectedLeads.size === validLeads.length && validLeads.length > 0;
  const isIndeterminate = selectedLeads.size > 0 && !isAllSelected;

  return (
    <div className="md:hidden space-y-4 max-h-[60vh] overflow-y-auto pb-4">
      {/* Bulk Selection Header */}
      <div className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onChange={handleSelectAll}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedLeads.size > 0
              ? `${selectedLeads.size} selected`
              : 'Select All'}
          </span>
        </label>

        {selectedLeads.size > 0 && (
          <div className="relative" ref={bulkActionsRef}>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Actions{' '}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showBulkActions ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showBulkActions && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-md shadow-lg border z-20">
                <div className="p-2 font-semibold text-xs text-gray-500">
                  CHANGE STATUS TO:
                </div>
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleBulkStatusUpdate(status.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${status.color}`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lead Cards List */}
      {validLeads.map((lead) => {
        const leadId = getValidLeadId(lead);
        return (
          <div key={leadId} data-role="action-menu">
            <MobileLeadCard
              lead={lead}
              isSelected={selectedLeads.has(leadId)}
              isActive={activeLeadId === leadId}
              onSelect={handleSelectLead}
              onToggleActions={handleToggleActions}
              onStatusUpdate={onStatusUpdate}
              onDelete={onDelete}
              onAddRemark={onAddRemark}
              onViewRemarks={onGetRemarks}
              onAssign={onAssign}
              onUnassign={onUnassign}
              onUpdate={onUpdate}
              onAddFollowUp={onAddFollowUp}
              onViewFollowUps={onViewFollowUps}
            />
          </div>
        );
      })}
    </div>
  );
};

export default MobileLeadList;
