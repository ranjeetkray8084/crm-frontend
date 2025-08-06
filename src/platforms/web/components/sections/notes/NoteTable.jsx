import React, { useState } from 'react';
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
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
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

    // Sorting logic
    const sortedNotes = [...notes].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'createdBy') {
            aValue = a.createdBy?.name || 'Unknown';
            bValue = b.createdBy?.name || 'Unknown';
        }

        if (sortField === 'createdAt' || sortField === 'dateTime') {
            aValue = new Date(aValue || 0);
            bValue = new Date(bValue || 0);
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="text-gray-400">↕</span>;
        return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
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

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'PRIORITY_A': return 'text-white';
            case 'PRIORITY_B': return 'text-white';
            case 'PRIORITY_C': return 'text-white';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBg = (priority) => {
        switch (priority) {
            case 'PRIORITY_A': return '#f44336'; // Red
            case 'PRIORITY_B': return '#ff9800'; // Orange
            case 'PRIORITY_C': return '#4caf50'; // Green
            default: return '#777';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'NEW': return 'text-white';
            case 'PROCESSING': return 'text-white';
            case 'COMPLETED': return 'text-white';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'NEW': return '#f0ad4e'; // Yellow/Orange
            case 'PROCESSING': return '#5bc0de'; // Light Blue
            case 'COMPLETED': return '#d9534f'; // Red
            default: return '#ccc';
        }
    };

    const getRowBg = (status) => {
        switch (status) {
            case 'NEW': return '#fff8e1'; // Light yellow
            case 'PROCESSING': return '#e0f7fa'; // Light cyan
            case 'COMPLETED': return '#f8d7da'; // Light red
            default: return 'transparent';
        }
    };

    const formatDateTime = (datetime) => {
        if (!datetime) return 'N/A';
        const date = new Date(datetime);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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

    return (
        <div className="bg-white rounded-lg shadow relative z-10 h-[600px] w-[1200px] border">
            <div className="h-full overflow-auto">
                <table className="w-full border-collapse table-fixed">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="border-b border-gray-200">
                            <th
                                className="w-[200px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                                onClick={() => handleSort('content')}
                            >
                                <div className="flex items-center gap-1">
                                    Content <SortIcon field="content" />
                                </div>
                            </th>
                            <th
                                className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-1">
                                    Status <SortIcon field="status" />
                                </div>
                            </th>
                            <th
                                className="w-[140px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                                onClick={() => handleSort('priority')}
                            >
                                <div className="flex items-center gap-1">
                                    Priority <SortIcon field="priority" />
                                </div>
                            </th>
                            <th
                                className="w-[70px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                                onClick={() => handleSort('typeStr')}
                            >
                                <div className="flex items-center gap-1">
                                    Type <SortIcon field="typeStr" />
                                </div>
                            </th>
                            <th
                                className="w-[160px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                                onClick={() => handleSort('createdBy')}
                            >
                                <div className="flex items-center gap-1">
                                    Created By <SortIcon field="createdBy" />
                                </div>
                            </th>
                            <th className="w-[140px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">Created For</th>
                            <th
                                className="w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                                onClick={() => handleSort('createdAt')}
                            >
                                <div className="flex items-center gap-1">
                                    Created At <SortIcon field="createdAt" />
                                </div>
                            </th>
                            <th
                                className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                                onClick={() => handleSort('dateTime')}
                            >
                                <div className="flex items-center gap-1">
                                    Scheduled <SortIcon field="dateTime" />
                                </div>
                            </th>
                            <th className="w-[114px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {sortedNotes.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-6 text-gray-400">No notes found.</td>
                            </tr>
                        ) : (
                            sortedNotes.map((note) => (
                                <tr key={note.id} className="border-b border-gray-200 hover:bg-gray-50" style={{ backgroundColor: getRowBg(note.status) }}>
                                    <td className="w-[200px] px-4 py-4 whitespace-nowrap border-r border-gray-200">
                                        <div
                                            className="text-sm text-gray-900 break-words cursor-pointer hover:text-blue-600 hover:underline overflow-hidden text-ellipsis"
                                            onClick={() => handleContentClick(note.content)}
                                            title="Click to view full content"
                                        >
                                            {truncateContent(note.content)}
                                        </div>
                                    </td>
                                    <td className="w-[120px] px-4 py-4 whitespace-nowrap border-r border-gray-200">
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
                                                            // Reset select to previous value
                                                            e.target.value = note.status || 'NEW';
                                                        }
                                                    });
                                                } else {
                                                    onUpdateStatus(note.id, newStatus);
                                                }
                                            }}
                                            className={`w-full p-2 rounded text-sm border-none ${getStatusClass(note.status)}`}
                                            style={{ backgroundColor: getStatusBg(note.status) }}
                                        >
                                            <option value="NEW">NEW</option>
                                            <option value="PROCESSING">PROCESSING</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                        </select>
                                    </td>
                                    <td className="w-[140px] px-4 py-4 whitespace-nowrap border-r border-gray-200">
                                        <select
                                            value={note.priority || 'PRIORITY_C'}
                                            onChange={(e) => onUpdatePriority(note.id, e.target.value)}
                                            className={`w-full p-2 rounded text-sm border-none ${getPriorityClass(note.priority)}`}
                                            style={{ backgroundColor: getPriorityBg(note.priority) }}
                                        >
                                            <option value="PRIORITY_A">Priority A</option>
                                            <option value="PRIORITY_B">Priority B</option>
                                            <option value="PRIORITY_C">Priority C</option>
                                        </select>
                                    </td>
                                    <td className="w-[70px] px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{note.typeStr || 'Note'}</td>
                                    <td className="w-[160px] px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                        {note.createdBy?.name || note.createdBy?.username || 'Unknown'}
                                    </td>
                                    <td className="w-[140px] px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                        {formatCreatedFor(note)}
                                    </td>
                                    <td className="w-[150px] px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                        {formatDateTime(note.createdAt)}
                                    </td>
                                    <td className="w-[120px] px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                        {formatDateTime(note.dateTime)}
                                    </td>
                                    <td className="w-[114px] px-4 py-4 whitespace-nowrap text-sm font-medium">
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
            </div>

            {/* Content Modal */}
            <ContentModal />

            {/* Custom Alert Modal */}
            <CustomAlert />
        </div>
    );
};

export default NoteTable;
