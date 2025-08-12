import React, { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { useTasks } from '../../../../../core/hooks/useTasks';
import { useUsers } from '../../../../../core/hooks/useUsers';
import TaskTable from './TaskTable';
import UserAssignmentModal from './UserAssignmentModal';
import TaskToolbar from './TaskToolbar';

const TaskSection = () => {
    const [userInfo, setUserInfo] = useState({
        companyId: null,
        userId: null,
        role: null,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [initError, setInitError] = useState(null);

    // Initialize user info from localStorage
    useEffect(() => {
        try {
            const userRaw = localStorage.getItem('user');
            if (!userRaw) {
                throw new Error('No user data found');
            }

            const user = JSON.parse(userRaw);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Get all possible company ID sources
            const companyIdRaw = localStorage.getItem('companyId');
            const companyIdAlt = localStorage.getItem('company_id');
            
            if (!token) {
                return;
            }

            const userData = JSON.parse(userRaw || '{}');

            // Find the first valid company ID from various sources
            let companyId = null;
            if (companyIdRaw) {
                companyId = parseInt(companyIdRaw, 10);
            } else if (user.companyId) {
                companyId = parseInt(user.companyId, 10);
            } else if (companyIdAlt) {
                companyId = parseInt(companyIdAlt, 10);
            } else {
                alert('❌ No companyId found anywhere');
            }

            const userId = user.id || user.userId;
            const userRole = user.role || 'USER';

            if (!companyId || !userId) {
                // Missing required data
            }

            setUserInfo({ companyId, userId, role: userRole });

        } catch (error) {
            // Error reading localStorage
        }
    }, []);

    const {
        // Data
        tasks,
        assignedTasks,
        uploadedTasks,
        loading,
        error,

        // Task Operations
        loadTasksByRole,
        deleteTask,
        assignTask,
        unassignTask,
        
        // Excel Operations
        previewExcel,
        downloadFile,
        updateCell,
        deleteColumn,

        // File Operations
        uploadExcelFile,

        // Utilities
        canManageTask,
        isTaskAssignedToUser,
        refreshTasks,
        clearError
    } = useTasks(userInfo.companyId, userInfo.userId, userInfo.role);

    // Load users for filters based on role
    const { users: companyUsers, loadUsers: loadCompanyUsers } = useUsers(
        userInfo.companyId,
        userInfo.role,
        userInfo.userId
    );

    // Handle global task error
    useEffect(() => {
        if (error) {
            customAlert({
                title: 'Error',
                message: error,
                type: 'error'
            });
            clearError();
        }
    }, [error, clearError]);

    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        onCancel: null,
        showCancel: false
    });

    // Assignment modal state
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);


    useEffect(() => {
        if (loadTasksByRole && userInfo.companyId && userInfo.userId) {
            loadTasksByRole();
        }
    }, [loadTasksByRole, userInfo.companyId, userInfo.userId]);

    useEffect(() => {
        if ((userInfo.role === 'ADMIN' || userInfo.role === 'DIRECTOR') && userInfo.companyId) {
            loadCompanyUsers?.();
        }
    }, [userInfo.role, userInfo.companyId, loadCompanyUsers]);

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

    const handleOpen = async (taskId) => {
        // Get user info from localStorage
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!user || !token) {
            customAlert({
                title: 'Error',
                message: 'Please login first to access Excel data.',
                type: 'error'
            });
            return;
        }

        try {
            const userData = JSON.parse(user);
            const userId = userData.userId || userData.id;
            const companyId = userData.companyId;
            const userRole = userData.role;

            // Build the URL for excel-preview.html with parameters
            const baseUrl = window.location.origin;
            const excelPreviewUrl = `${baseUrl}/excel-preview.html?taskId=${taskId}&companyId=${companyId}&userId=${userId}&userRole=${userRole}`;
            
            // Open in new tab
            window.open(excelPreviewUrl, '_blank');
            
        } catch (error) {
            customAlert({
                title: 'Error',
                message: 'Failed to open Excel preview. Please try again.',
                type: 'error'
            });
        }
    };

    const handleDownload = async (taskId) => {
        try {
            await downloadFile(taskId);
            customAlert({
                title: 'Success',
                message: 'Task file downloaded successfully!',
                type: 'success'
            });
        } catch (error) {
            customAlert({
                title: 'Error',
                message: 'Failed to download task file. Please try again.',
                type: 'error'
            });
        }
    };

    const handleDelete = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            customAlert({
                title: 'Error',
                message: 'Task not found',
                type: 'error'
            });
            return;
        }

        if (!canManageTask(task.uploadedBy?.userId)) {
            customAlert({
                title: 'Permission Denied',
                message: 'You do not have permission to delete this task',
                type: 'error'
            });
            return;
        }

        customAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this task? This action cannot be undone.',
            type: 'warning',
            showCancel: true,
            onConfirm: async () => {
                try {
                    const result = await deleteTask(taskId);
                    if (result.success) {
                        await refreshTasks();
                        customAlert({
                            title: 'Success',
                            message: 'Task deleted successfully!',
                            type: 'success'
                        });
                    } else {
                        throw new Error(result.error || 'Failed to delete task');
                    }
                } catch (error) {
                    customAlert({
                        title: 'Error',
                        message: error.message || 'Failed to delete task. Please try again.',
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleAssign = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            customAlert({
                title: 'Error',
                message: 'Task not found',
                type: 'error'
            });
            return;
        }

        if (!(userInfo.role === 'ADMIN' || userInfo.role === 'DIRECTOR')) {
            customAlert({
                title: 'Permission Denied',
                message: 'Only ADMIN or DIRECTOR can assign tasks',
                type: 'error'
            });
            return;
        }

        // Open assignment modal
        setSelectedTaskId(taskId);
        setShowAssignmentModal(true);
    };

    const handleAssignmentConfirm = async (taskId, userId) => {
        try {
            const result = await assignTask(taskId, userId);
            if (result.success) {
                await refreshTasks();
                customAlert({
                    title: 'Success',
                    message: 'Task assigned successfully!',
                    type: 'success'
                });
            } else {
                throw new Error(result.error || 'Failed to assign task');
            }
        } catch (error) {
            customAlert({
                title: 'Error',
                message: error.message || 'Failed to assign task. Please try again.',
                type: 'error'
            });
        }
    };

    const handleUnassign = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            customAlert({
                title: 'Error',
                message: 'Task not found',
                type: 'error'
            });
            return;
        }

        if (!(userInfo.role === 'ADMIN' || userInfo.role === 'DIRECTOR')) {
            customAlert({
                title: 'Permission Denied',
                message: 'Only ADMIN or DIRECTOR can unassign tasks',
                type: 'error'
            });
            return;
        }

        customAlert({
            title: 'Confirm Unassign',
            message: 'Are you sure you want to unassign this task?',
            type: 'warning',
            showCancel: true,
            onConfirm: async () => {
                try {
                    const result = await unassignTask(taskId);
                    if (result.success) {
                        await refreshTasks();
                        customAlert({
                            title: 'Success',
                            message: 'Task unassigned successfully!',
                            type: 'success'
                        });
                    } else {
                        throw new Error(result.error || 'Failed to unassign task');
                    }
                } catch (error) {
                    customAlert({
                        title: 'Error',
                        message: error.message || 'Failed to unassign task. Please try again.',
                        type: 'error'
                    });
                }
            }
        });
    };

    // --- Search & Filters ---
    const [searchTerm, setSearchTerm] = useState('');
    const [createdById, setCreatedById] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [assignmentStatus, setAssignmentStatus] = useState('ALL'); // ALL | ASSIGNED | UNASSIGNED
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const isAdminOrDirector = userInfo.role === 'ADMIN' || userInfo.role === 'DIRECTOR';

    const clearAllFilters = () => {
        setSearchTerm('');
        setCreatedById('');
        setAssignedToId('');
        setAssignmentStatus('ALL');
    };

    const hasActiveFilters = useMemo(() => {
        return (
            (searchTerm && searchTerm.trim() !== '') ||
            (createdById && createdById !== '') ||
            (assignedToId && assignedToId !== '') ||
            assignmentStatus !== 'ALL'
        );
    }, [searchTerm, createdById, assignedToId, assignmentStatus]);

    const displayUsers = useMemo(() => {
        if (!isAdminOrDirector) return [];
        return (companyUsers || []).map(u => ({ id: u.id || u.userId, name: u.name || u.username || u.email }));
    }, [companyUsers, isAdminOrDirector]);

    const normalizedIncludes = (text, query) => (text || '').toLowerCase().includes((query || '').toLowerCase());

    const filteredTasks = useMemo(() => {
        let list = tasks || [];

        // Search by title (and also by creator/assignee names for convenience)
        if (searchTerm.trim()) {
            list = list.filter(t => {
                const titleMatch = normalizedIncludes(t.title, searchTerm);
                const creatorName = t.uploadedByName || '';
                const assigneeName = t.assignedTo?.name || '';
                return titleMatch || normalizedIncludes(creatorName, searchTerm) || normalizedIncludes(assigneeName, searchTerm);
            });
        }

        // Created By filter - we need to match by name since backend returns uploadedByName as string
        if (createdById) {
            const selectedUser = displayUsers.find(u => String(u.id) === String(createdById));
            if (selectedUser) {
                list = list.filter(t => t.uploadedByName === selectedUser.name);
            }
        }

        // Assigned To filter
        if (assignedToId) {
            list = list.filter(t => String(t.assignedTo?.userId || t.assignedTo?.id) === String(assignedToId));
        }

        // Assignment Status filter
        if (assignmentStatus === 'ASSIGNED') {
            list = list.filter(t => !!t.assignedTo);
        } else if (assignmentStatus === 'UNASSIGNED') {
            list = list.filter(t => !t.assignedTo);
        }

        return list;
    }, [tasks, searchTerm, createdById, assignedToId, assignmentStatus]);

    return (
        <div className="flex justify-center items-start p-2">
            <div className="bg-white p-3 md:p-4 rounded-xl border shadow-sm w-full max-w-[1200px] h-fit">
                <h2 className="text-center text-xl p-2 font-bold text-gray-800">Task Management</h2>

                {/* Toolbar Section */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <TaskToolbar
                                onRefresh={refreshTasks}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                loading={loading}
                                taskCount={filteredTasks.length}
                            />
                        </div>
                        {/* Mobile Filter Toggle */}
                        {isAdminOrDirector && (
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="md:hidden ml-3 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors relative"
                                title="Toggle Filters"
                            >
                                <Filter className="h-5 w-5" />
                                {hasActiveFilters && (
                                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"></div>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters Section */}
                {isAdminOrDirector && (
                    <div className={`mb-4 p-4 bg-gray-50 rounded-lg transition-all duration-300 ${
                        showMobileFilters ? 'block' : 'hidden md:block'
                    }`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                                    Created By
                                </label>
                                <select
                                    value={createdById}
                                    onChange={(e) => setCreatedById(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Created By</option>
                                    {displayUsers.map(u => (
                                        <option key={`creator-${u.id}`} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                                    Assigned To
                                </label>
                                <select
                                    value={assignedToId}
                                    onChange={(e) => setAssignedToId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Assigned To</option>
                                    {displayUsers.map(u => (
                                        <option key={`assignee-${u.id}`} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 md:hidden">
                                    Status
                                </label>
                                <select
                                    value={assignmentStatus}
                                    onChange={(e) => setAssignmentStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ASSIGNED">Assigned</option>
                                    <option value="UNASSIGNED">Unassigned</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Summary */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-3 pt-3 border-t border-gray-200 gap-3">
                            <div className="text-sm text-gray-600 flex flex-col md:flex-row gap-2 md:gap-4">
                                <span>Showing {filteredTasks.length} of {tasks?.length || 0} tasks</span>
                                <div className="flex gap-4">
                                    <span className="text-blue-600">Assigned: {filteredTasks.filter(t => t.assignedTo).length}</span>
                                    <span className="text-yellow-600">Pending: {filteredTasks.filter(t => !t.assignedTo).length}</span>
                                </div>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors self-start md:self-auto"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <div className="ml-3 text-gray-600">Loading tasks...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">
                        Error: {error}
                    </div>
                )}

                {/* Session Error */}
                {(!userInfo.companyId || !userInfo.userId) && !loading && (
                    <div className="text-center p-4 text-yellow-600 bg-yellow-100 rounded-lg">
                        <div className="font-semibold">User session expired or not found. Please log in again.</div>
                        <div className="mt-2 text-sm">
                            Missing: {!userInfo.companyId && 'Company ID'} {!userInfo.userId && 'User ID'}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && userInfo.companyId && userInfo.userId && filteredTasks.length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                        <div className="text-lg font-medium">No tasks found</div>
                        <div className="text-sm mt-1">
                            {(tasks?.length || 0) === 0 ? 'Upload your first task to get started' : 'Try adjusting your filters'}
                        </div>
                    </div>
                )}

                {/* Task Table */}
                {!loading && !error && userInfo.companyId && userInfo.userId && filteredTasks.length > 0 && (
                    <TaskTable
                        tasks={filteredTasks}
                        onOpen={handleOpen}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onAssign={handleAssign}
                        onUnassign={handleUnassign}
                        role={userInfo.role}
                        canManageTask={canManageTask}
                        isTaskAssignedToUser={isTaskAssignedToUser}
                        loading={loading}
                    />
                )}
            </div>

            {/* User Assignment Modal */}
            <UserAssignmentModal
                isOpen={showAssignmentModal}
                onClose={() => setShowAssignmentModal(false)}
                onAssign={handleAssignmentConfirm}
                taskId={selectedTaskId}
                companyId={userInfo.companyId}
                currentUserRole={userInfo.role}
                currentUserId={userInfo.userId}
                loading={loading}
            />

            {/* Custom Alert Modal */}
            <CustomAlert />
        </div>
    );
};

export default TaskSection;
