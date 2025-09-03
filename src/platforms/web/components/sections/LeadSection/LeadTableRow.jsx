import React, { useState, useEffect, useRef } from 'react';
import {
    MoreVertical, Edit, Trash2, MessageSquare, Eye,
    UserPlus, UserMinus, ChevronDown, Calendar, Clock
} from 'lucide-react';
import ThreeDotMenu from '../../common/ThreeDotMenu';

const LeadTableRow = ({
    lead,
    searchTerm,
    onStatusUpdate,

    onAddRemark,
    onGetRemarks,
    onAssign,
    onUnassign,
    onUpdate,
    onAddFollowUp,
    onViewFollowUps,
    companyId
}) => {
    if (!lead) return null;

    const [showActions, setShowActions] = useState(false);
    const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);

    const actionsRef = useRef(null);
    const statusRef = useRef(null);
    const leadId = lead.leadId || lead.id;

    const highlightText = (text, searchTerm) => {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.toString().split(regex);
        return parts.map((part, index) =>
            regex.test(part)
                ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
                : part
        );
    };

    const formatBudget = (budget) => {
        if (!budget) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(budget);
    };

      const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatSource = (source) => {
    if (!source) return '';
    const sourceMap = {
      "INSTAGRAM": "Instagram",
      "FACEBOOK": "Facebook",
      "YOUTUBE": "YouTube", 
      "REFERENCE": "Reference",
      "NINETY_NINE_ACRES": "99acres",
      "MAGIC_BRICKS": "MagicBricks"
    };
    return sourceMap[source] || source;
  };

    const getStatusColor = (status, type = 'badge') => {
        const colors = {
            NEW: { badge: 'bg-yellow-100 text-yellow-800', button: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
            CONTACTED: { badge: 'bg-blue-100 text-blue-800', button: 'bg-blue-500 hover:bg-blue-600 text-white' },
            CLOSED: { badge: 'bg-green-100 text-green-800', button: 'bg-green-500 hover:bg-green-600 text-white' },
            DROPED: { badge: 'bg-red-100 text-red-800', button: 'bg-red-500 hover:bg-red-600 text-white' },
            DEFAULT: { badge: 'bg-gray-100 text-gray-800', button: 'bg-gray-500 hover:bg-gray-600 text-white' }
        };
        return (colors[status] || colors.DEFAULT)[type];
    };

    const statusOptions = ['NEW', 'CONTACTED', 'CLOSED', 'DROPED'];

    const handleUpdateClick = () => {
        onUpdate(lead);
        setShowActions(false);
    };

    const handleAddRemarkClick = () => {
        onAddRemark(lead);
        setShowActions(false);
    };

    const handleViewRemarksClick = () => {
        onGetRemarks(lead);
        setShowActions(false);
    };

    const handleAddFollowUpClick = () => {
        onAddFollowUp(lead);
        setShowActions(false);
    };

    const handleViewFollowUpsClick = () => {
        onViewFollowUps(lead);
        setShowActions(false);
    };

    const handleStatusChange = (newStatus) => {
        onStatusUpdate(leadId, newStatus);
        setStatusDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target)) {
                setShowActions(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isAssigned = lead.assignedToSummary?.name || lead.assignToName === 'Assigned';

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{highlightText(lead.name, searchTerm)}</div>
                <div className="text-sm text-gray-500">{lead.source && `Source: ${formatSource(lead.source)}`}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {highlightText(lead.phone, searchTerm) || 'N/A'}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
                <div className="relative" ref={statusRef}>
                    <button
                        onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
                        className={`w-28 flex items-center justify-between px-2.5 py-1 rounded text-xs font-medium transition-colors ${getStatusColor(lead.status, 'button')}`}
                    >
                        <span>{lead.status || 'N/A'}</span>
                        <ChevronDown size={14} />
                    </button>
                    {isStatusDropdownOpen && (
                        <div className="absolute w-28 bg-white rounded-md shadow-lg border border-gray-200 z-20 top-full mt-1 flex flex-col">
                            {statusOptions.map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${lead.status === status ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatBudget(lead.budget)}</td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {highlightText(lead.requirement, searchTerm) || 'N/A'}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {highlightText(lead.location, searchTerm) || 'N/A'}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(lead.createdAt)}
                {lead.createdBy?.name && <div className="text-xs text-gray-400">by {lead.createdBy.name}</div>}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {isAssigned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {lead.assignedToSummary?.name || 'Assigned'}
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Unassigned
                    </span>
                )}
            </td>
            <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                <ThreeDotMenu
                    item={lead}
                    actions={[
                        { label: 'Update Lead', icon: <Edit size={14} />, onClick: () => onUpdate(lead) },
                        { label: 'Add Remark', icon: <MessageSquare size={14} />, onClick: () => onAddRemark(lead) },
                        { label: 'Add Follow-Up', icon: <Calendar size={14} />, onClick: () => onAddFollowUp(lead) },
                        { label: 'View Follow-ups', icon: <Clock size={14} />, onClick: () => onViewFollowUps(lead) },
                        { label: 'View Remarks', icon: <Eye size={14} />, onClick: () => onGetRemarks(lead) },
                        isAssigned 
                            ? { label: 'Unassign Lead', icon: <UserMinus size={14} />, onClick: () => onUnassign(leadId) }
                            : { label: 'Assign Lead', icon: <UserPlus size={14} />, onClick: () => onAssign(leadId) },
                    ]}
                />
            </td>
        </tr>
    );
};

export default LeadTableRow;
