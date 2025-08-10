import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import NoteActions from './NoteActions';

const NoteTable = ({
    notes = [],
    onEdit,
    onDelete,
    onUpdateStatus,
    onUpdatePriority,
    onAddRemark,
    onViewRemarks
}) => {
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [showContentModal, setShowContentModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info', // 'success', 'error', 'warning', 'info'
        onConfirm: null,
        onCancel: null,
        showCancel: false
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sorting logic
    const sortedNotes = [...notes].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'createdBy') {
            aValue = a.createdBy?.name || 'Unknown';
            bValue = b.createdBy?.name || 'Unknown';
        }

        if (sortConfig.key === 'createdAt' || sortConfig.key === 'dateTime') {
            aValue = new Date(aValue || 0);
            bValue = new Date(bValue || 0);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="h-4 w-4 ml-1 inline" />
            : <ArrowDown className="h-4 w-4 ml-1 inline" />;
    };

    const truncateContent = (content, wordLimit = 10) => {
        if (!content) return 'No content';
        const words = content.split(' ');
        if (words.length <= wordLimit) return content;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    const handleContentClick = (content) => {
        setSelectedContent(content || 'No content');
        setShowContentModal(true);
    };

    // Custom Alert Function
    const customAlert = (config) => {
        setAlertConfig({
            title: config.title || 'Alert',
            message: config.message || '',
            type: config.type || 'info',
            onConfirm: config.onConfirm || null,
            onCancel: config.onCancel || null,
            showCancel: config.showCancel || false
        });
        setShowAlert(true);
    };

    const handleAlertConfirm = () => {
        if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
        }
        setShowAlert(false);
    };

    const handleAlertCancel = () => {
        if (alertConfig.onCancel) {
            alertConfig.onCancel();
        }
        setShowAlert(false);
    };

    const ContentModal = () => {
        if (!showContentModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Note Content</h3>
                        <button
                            onClick={() => setShowContentModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap break-words">
                        {selectedContent}
                    </div>
                </div>
            </div>
        );
    };

    // Custom Alert Modal Component
    const CustomAlert = () => {
        if (!showAlert) return null;

        const getAlertColor = () => {
            switch (alertConfig.type) {
                case 'success': return 'text-green-600 bg-green-50 border-green-200';
                case 'error': return 'text-red-600 bg-red-50 border-red-200';
                case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                default: return 'text-blue-600 bg-blue-50 border-blue-200';
            }
        };

        const getIconColor = () => {
            switch (alertConfig.type) {
                case 'success': return 'text-green-500';
                case 'error': return 'text-red-500';
                case 'warning': return 'text-yellow-500';
                default: return 'text-blue-500';
            }
        };

        const getIcon = () => {
            switch (alertConfig.type) {
                case 'success':
                    return (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    );
                case 'error':
                    return (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    );
                case 'warning':
                    return (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    );
                default:
                    return (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    );
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
                <div className={`bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 border-2 ${getAlertColor()}`}>
                    <div className="flex items-center mb-4">
                        <div className={`mr-3 ${getIconColor()}`}>
                            {getIcon()}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{alertConfig.title}</h3>
                    </div>
                    <div className="text-gray-700 mb-6">
                        {alertConfig.message}
                    </div>
                    <div className="flex justify-end space-x-3">
                        {alertConfig.showCancel && (
                            <button
                                onClick={handleAlertCancel}
                                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleAlertConfirm}
                            className={`px-4 py-2 text-white rounded-md transition-colors ${alertConfig.type === 'error'
                                ? 'bg-red-600 hover:bg-red-700'
                                : alertConfig.type === 'success'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : alertConfig.type === 'warning'
                                        ? 'bg-yellow-600 hover:bg-yellow-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'NEW':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 focus:ring-yellow-500';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800 border-blue-200 focus:ring-blue-500';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200 focus:ring-green-500';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 focus:ring-gray-500';
        }
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'PRIORITY_A':
                return 'bg-red-100 text-red-800 border-red-200 focus:ring-red-500';
            case 'PRIORITY_B':
                return 'bg-orange-100 text-orange-800 border-orange-200 focus:ring-orange-500';
            case 'PRIORITY_C':
                return 'bg-green-100 text-green-800 border-green-200 focus:ring-green-500';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 focus:ring-gray-500';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatCreatedFor = (note) => {
        if (!note.visibility) return 'Unknown';

        switch (note.visibility) {
            case 'ONLY_ME':
                return 'Only Me';
            case 'ALL_USERS':
                return 'All Users';
            case 'ALL_ADMIN':
                return 'All Admins';
            case 'SPECIFIC_USERS':
            case 'SPECIFIC_ADMIN':
                if (note.visibleUserNames && note.visibleUserNames.length > 0) {
                    return note.visibleUserNames.join(', ');
                } else if (note.visibleUserIds && note.visibleUserIds.length > 0) {
                    return `${note.visibleUserIds.length} user(s)`;
                }
                return 'Specific Users';
            default:
                return note.visibility;
        }
    };

    const SortableHeader = ({ columnKey, title, className = "" }) => (
        <th
            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap ${className}`}
            onClick={() => handleSort(columnKey)}
        >
            {title}
            {getSortIcon(columnKey)}
        </th>
    );

    return (
        <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-[1200px] w-full table-auto text-sm text-left text-gray-700">
                <thead className="bg-gray-50">
                    <tr>
                        <SortableHeader columnKey="content" title="Content" />
                        <SortableHeader columnKey="status" title="Status" />
                        <SortableHeader columnKey="priority" title="Priority" />
                        <SortableHeader columnKey="typeStr" title="Type" />
                        <SortableHeader columnKey="createdBy" title="Created By" />
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created For
                        </th>
                        <SortableHeader columnKey="createdAt" title="Created At" />
                        <SortableHeader columnKey="dateTime" title="Scheduled" />
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedNotes.length === 0 ? (
                        <tr>
                            <td colSpan="9" className="text-center py-6 text-gray-400">No notes found.</td>
                        </tr>
                    ) : (
                        sortedNotes.map((note) => (
                            <tr key={note.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div
                                        className="text-sm text-gray-900 cursor-pointer hover:text-blue-600 hover:underline max-w-xs truncate"
                                        onClick={() => handleContentClick(note.content)}
                                        title="Click to view full content"
                                    >
                                        {truncateContent(note.content)}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <select
                                        value={note.status || 'NEW'}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            if (newStatus === 'COMPLETED') {
                                                customAlert({
                                                    title: 'Confirm Status Change',
                                                    message: `Are you sure you want to mark this note as ${newStatus}?`,
                                                    type: 'warning',
                                                    showCancel: true,
                                                    onConfirm: () => {
                                                        onUpdateStatus(note.id, newStatus);
                                                        customAlert({
                                                            title: 'Success',
                                                            message: 'Note status updated successfully!',
                                                            type: 'success'
                                                        });
                                                    },
                                                    onCancel: () => {
                                                        e.target.value = note.status || 'NEW';
                                                    }
                                                });
                                            } else {
                                                onUpdateStatus(note.id, newStatus);
                                            }
                                        }}
                                        className={`px-2 py-1 border rounded-full text-xs font-semibold appearance-none focus:outline-none focus:ring-2 ${getStatusStyles(note.status)}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="NEW">NEW</option>
                                        <option value="PROCESSING">PROCESSING</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <select
                                        value={note.priority || 'PRIORITY_C'}
                                        onChange={(e) => onUpdatePriority(note.id, e.target.value)}
                                        className={`px-2 py-1 border rounded-full text-xs font-semibold appearance-none focus:outline-none focus:ring-2 ${getPriorityStyles(note.priority)}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="PRIORITY_A">Priority A</option>
                                        <option value="PRIORITY_B">Priority B</option>
                                        <option value="PRIORITY_C">Priority C</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {note.typeStr || 'Note'}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {note.createdBy?.name || note.createdBy?.username || 'Unknown'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatCreatedFor(note)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="text-sm text-gray-900">{formatDate(note.createdAt)}</div>
                                    {note.createdBy?.name && <div className="text-xs text-gray-400">by {note.createdBy.name}</div>}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(note.dateTime)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {note.id && (
                                        <NoteActions
                                            note={note}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            onAddRemark={onAddRemark}
                                            onViewRemarks={onViewRemarks}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Content Modal */}
            <ContentModal />

            {/* Custom Alert Modal */}
            <CustomAlert />
        </div>
    );
};

export default NoteTable;
