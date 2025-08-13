import {
    Phone,
    IndianRupee,
    UserPlus,
    UserMinus,
    MessageSquare,
    Eye,
    Edit,
    Trash2,
    Target,
    Calendar,
    GitBranch,
    Clock
  } from 'lucide-react';
  import ThreeDotMenu from '../../common/ThreeDotMenu';
  
  const MobileLeadCard = ({
    lead,
    onStatusUpdate,
    onDelete,
    onAddRemark,
    onViewRemarks,
    onAssign,
    onUnassign,
    onUpdate,
    onAddFollowUp,
    onViewFollowUps
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
  
    const getStatusColor = (status) => {
      switch (status) {
        case 'NEW':
          return 'bg-yellow-100 text-yellow-800';
        case 'CONTACTED':
          return 'bg-cyan-100 text-cyan-800';
        case 'CLOSED':
          return 'bg-green-100 text-green-800';
        case 'DROPED':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusLabel = (status) => {
      switch (status) {
        case 'NEW':
          return 'New';
        case 'CONTACTED':
          return 'Contacted';
        case 'CLOSED':
          return 'Closed';
        case 'DROPED':
          return 'Dropped';
        default:
          return status || 'N/A';
      }
    };

    const actions = [
      {
        label: 'Update Lead',
        icon: <Edit size={14} />,
        onClick: () => onUpdate(lead)
      },
      {
        label: 'Add Remark',
        icon: <MessageSquare size={14} />,
        onClick: () => onAddRemark(lead)
      },
      {
        label: 'Add Follow-Up',
        icon: <Calendar size={14} />,
        onClick: () => onAddFollowUp(lead)
      },
      {
        label: 'View Follow-ups',
        icon: <Clock size={14} />,
        onClick: () => onViewFollowUps(lead)
      },
      {
        label: 'View Remarks',
        icon: <Eye size={14} />,
        onClick: () => onViewRemarks(lead)
      },
      ...(isAssigned ? [{
        label: 'Unassign',
        icon: <UserMinus size={14} />,
        onClick: () => onUnassign(leadId)
      }] : [{
        label: 'Assign',
        icon: <UserPlus size={14} />,
        onClick: () => onAssign(leadId)
      }]),
      {
        label: 'Delete Lead',
        icon: <Trash2 size={14} />,
        onClick: () => onDelete(leadId),
        danger: true
      }
    ];
  
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {lead.name || 'Unnamed Lead'}
            </h3>
            <p className="text-gray-600 text-sm">
              {lead.assignedToSummary?.name || 'Unassigned'}
            </p>
          </div>
          
          {/* Three Dot Menu */}
          <ThreeDotMenu
            item={lead}
            actions={actions}
            position="right-0"
          />
        </div>

        {/* Lead Details */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-xs text-gray-500">Phone</span>
            <p className="text-sm font-medium">{lead.phone || 'N/A'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Budget</span>
            <p className="text-sm font-medium">₹{formatBudget(lead.budget)}</p>
          </div>
          {lead.requirement && (
            <>
              <div className="col-span-2">
                <span className="text-xs text-gray-500">Requirement</span>
                <p className="text-sm font-medium">{lead.requirement}</p>
              </div>
            </>
          )}
          <div>
            <span className="text-xs text-gray-500">Source</span>
            <p className="text-sm font-medium">{lead.source || 'N/A'}</p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-3">
          <select
            value={lead.status}
            onChange={(e) => onStatusUpdate(leadId, e.target.value)}
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(lead.status)}`}
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CLOSED">Closed</option>
            <option value="DROPED">Dropped</option>
          </select>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div className="font-medium text-gray-700">Created {formatDate(lead.createdAt)}</div>
          <div className="text-xs text-gray-500">
            by {lead.createdBy?.name || lead.createdByName || 'Unknown'}
          </div>
        </div>
      </div>
    );
  };
  
  export default MobileLeadCard;
  