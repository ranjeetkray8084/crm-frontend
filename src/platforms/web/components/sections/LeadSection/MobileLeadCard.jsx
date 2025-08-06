import {
    Phone,
    IndianRupee,
    UserPlus,
    UserMinus,
    MessageSquare,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Target,
    Calendar,
    GitBranch
  } from 'lucide-react';
  
  const MobileLeadCard = ({
    lead,
    isSelected,
    isActive,
    onSelect,
    onToggleActions,
    onStatusUpdate,
    onDelete,
    onAddRemark,
    onViewRemarks,
    onAssign,
    onUnassign,
    onUpdate
  }) => {
    if (!lead) return null;
  
    const leadId = lead?.leadId ?? lead?.id;
    if (!leadId) return null;
  
    const isAssigned =
      lead.assignedToSummary?.name || lead.assignToName === 'Assigned';
  
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };
  
    const formatBudget = (budget) => {
      if (!budget) return 'N/A';
      return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
      }).format(budget);
    };
  
    const statusStyles = {
      NEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONTACTED: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      CLOSED: 'bg-green-100 text-green-800 border-green-300',
      DROPED: 'bg-red-100 text-red-800 border-red-300'
    };
    const statusColorClass =
      statusStyles[lead.status] ??
      'bg-gray-100 text-gray-800 border-gray-300';
  
    return (
      <div
        className={`bg-white border rounded-lg transition-all ${
          isSelected
            ? 'ring-2 ring-blue-500 border-blue-500'
            : 'border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(leadId)}
              className="w-5 h-5 mt-1"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {lead.name || 'Unnamed Lead'}
              </h3>
              <div className="text-sm text-gray-600">
                {lead.assignedToSummary?.name || 'Unassigned'}
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => onToggleActions(leadId)}
              className={`p-1 rounded-full ${
                isActive
                  ? 'bg-gray-200 text-gray-800'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MoreVertical size={20} />
            </button>
            {isActive && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => onUpdate(lead)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Edit size={14} /> Update Lead
                  </button>
                  <button
                    onClick={() => onAddRemark(lead)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <MessageSquare size={14} /> Add Remark
                  </button>
                  <button
                    onClick={() => onViewRemarks(lead)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Eye size={14} /> View Remarks
                  </button>
                  {isAssigned ? (
                    <button
                      onClick={() => onUnassign(leadId)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full"
                    >
                      <UserMinus size={14} /> Unassign
                    </button>
                  ) : (
                    <button
                      onClick={() => onAssign(leadId)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full"
                    >
                      <UserPlus size={14} /> Assign
                    </button>
                  )}
                  <div className="my-1 h-px bg-gray-100" />
                  <button
                    onClick={() => onDelete(leadId)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* Status + Detail */}
        <div className="px-4 pb-4 space-y-2.5">
          <select
            value={lead.status}
            onChange={(e) => onStatusUpdate(leadId, e.target.value)}
            className={`w-full p-1.5 text-xs font-semibold rounded-md border text-center appearance-none focus:ring-2 ${statusColorClass}`}
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CLOSED">Closed</option>
            <option value="DROPED">Dropped</option>
          </select>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone size={14} /> <span>{lead.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <IndianRupee size={14} />
            <span className="font-medium">{formatBudget(lead.budget)}</span>
          </div>
          {lead.requirement && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Target size={14} /> <span>{lead.requirement}</span>
            </div>
          )}
        </div>
  
        {/* Footer */}
        <div className="px-4 py-2 border-t text-xs flex justify-between text-gray-500">
          <div className="flex items-center gap-1.5">
            <GitBranch size={12} /> {lead.source || 'N/A'}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} /> {formatDate(lead.createdAt)}
          </div>
        </div>
      </div>
    );
  };
  
  export default MobileLeadCard;
  