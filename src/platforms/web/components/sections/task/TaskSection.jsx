import React, { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { useTasks } from '../../../../../core/hooks/useTasks';
import { UserService } from '../../../../../core/services/user.service';

import TaskTable from './TaskTable';

const TaskSection = () => {
    const [userInfo, setUserInfo] = useState({
        companyId: null,
        userId: null,
        role: null,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [initError, setInitError] = useState(null);
    const [userDataLoaded, setUserDataLoaded] = useState(false);

    // Filter states
    const [availableCreators, setAvailableCreators] = useState([]);
    const [availableAssignees, setAvailableAssignees] = useState([]);

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

            // Find the first valid company ID from various sources
            let companyId = null;
            if (companyIdRaw) {
                companyId = parseInt(companyIdRaw, 10);
            } else if (user.companyId) {
                companyId = parseInt(user.companyId, 10);
            } else if (companyIdAlt) {
                companyId = parseInt(companyIdAlt, 10);
            }

            const userId = user.id || user.userId;
            const userRole = user.role || 'USER';

            setUserInfo({ companyId, userId, role: userRole });
            setUserDataLoaded(true);

        } catch (error) {
            setInitError('Failed to load user data. Please log in again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const {
        // Data
        tasks,
        loading,
        error,

        // Task Operations
        loadTasksByRole,
        deleteTask,
        assignTask,
        unassignTask,
        updateTaskStatus,

        // Excel Operations
        downloadExcelFile,

        // Utilities
        canManageTask,
        isTaskAssignedToUser,
        refreshTasks,
        clearError,
        createdByFilter,
        setCreatedByFilter,
        assignedToFilter,
        setAssignedToFilter
    } = useTasks(
        userDataLoaded ? userInfo.companyId : null,
        userDataLoaded ? userInfo.userId : null,
        userDataLoaded ? userInfo.role : null
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

    // User selection modal state
    const [showUserModal, setShowUserModal] = useState(false);
    const [userModalConfig, setUserModalConfig] = useState({
        users: [],
        taskId: null,
        action: 'assign'
    });
    const [assigningUser, setAssigningUser] = useState(null);

    useEffect(() => {
        if (loadTasksByRole && userInfo.companyId && userInfo.userId && userInfo.role) {
            loadTasksByRole();
        }
    }, [loadTasksByRole, userInfo.companyId, userInfo.userId, userInfo.role]);

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

    // User selection modal functions
    const showUserSelectionModal = (users, taskId, action) => {
        setUserModalConfig({
            users,
            taskId,
            action
        });
        setShowUserModal(true);
    };

    const handleUserSelection = async (userId) => {
        if (assigningUser === userId) return; // Prevent double click
        
        setAssigningUser(userId);
        
        try {
            const result = await assignTask(userModalConfig.taskId, userId);
            
            if (result.success) {
                // Close modal first
                setShowUserModal(false);
                setAssigningUser(null);
                
                // Then refresh tasks
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
            setAssigningUser(null);
            customAlert({
                title: 'Error',
                message: error.message || 'Failed to assign task. Please try again.',
                type: 'error'
            });
        }
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

    // User Selection Modal Component
    const UserSelectionModal = () => {
        if (!showUserModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Select User to Assign</h3>
                        <button
                            onClick={() => setShowUserModal(false)}
                            disabled={assigningUser !== null}
                            className={`${
                                assigningUser !== null
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                        {userModalConfig.users.map(user => {
                            const userId = user.userId || user.id; // Handle both userId and id
                            const isAssigning = assigningUser === userId;

                            return (
                                <div
                                    key={userId}
                                    onClick={() => !isAssigning && handleUserSelection(userId)}
                                    className={`flex items-center p-3 rounded-md border-b border-gray-100 last:border-b-0 ${
                                        isAssigning 
                                            ? 'bg-blue-50 cursor-not-allowed opacity-75' 
                                            : 'hover:bg-gray-50 cursor-pointer'
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{user.name || user.username}</div>
                                        <div className="text-sm text-gray-500">USER</div>
                                    </div>
                                    <div className="text-blue-600">
                                        {isAssigning ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setShowUserModal(false)}
                            disabled={assigningUser !== null}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                assigningUser !== null
                                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            Cancel
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
            const result = await downloadExcelFile(taskId);
            if (result.success) {
                // Create a blob URL and trigger download
                const blob = new Blob([result.data], { 
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `task-${taskId}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                customAlert({
                    title: 'Success',
                    message: 'Task file downloaded successfully!',
                    type: 'success'
                });
            } else {
                throw new Error(result.error || 'Failed to download file');
            }
        } catch (error) {
            console.error('Download error:', error);
            customAlert({
                title: 'Error',
                message: error.message || 'Failed to download task file. Please try again.',
                type: 'error'
            });
        }
    };

    const handleDelete = async (taskId) => {
        console.log('handleDelete called with taskId:', taskId);
        console.log('Current tasks:', tasks);
        console.log('Current userInfo:', userInfo);
        
        const task = tasks.find(t => t.id === taskId);
        console.log('Found task:', task);
        
        if (!task) {
            customAlert({
                title: 'Error',
                message: 'Task not found',
                type: 'error'
            });
            return;
        }

        console.log('Task creator ID:', task.uploadedBy?.userId);
        console.log('Can manage task:', canManageTask(task.uploadedBy?.userId));
        
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

        try {
            // Fetch all USER role users
            const usersResponse = await UserService.getUsersByRoleAndCompany(userInfo.companyId, 'USER');
            
            if (!usersResponse.success) {
                throw new Error('Failed to fetch users');
            }

            const users = usersResponse.data;
            
            if (users.length === 0) {
                customAlert({
                    title: 'No Users Available',
                    message: 'No USER role users found to assign this task.',
                    type: 'info'
                });
                return;
            }

            // Create user selection modal
            showUserSelectionModal(users, taskId, 'assign');

        } catch (error) {
            customAlert({
                title: 'Error',
                message: 'Failed to load users. Please try again.',
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

        if (!task.assignedTo) {
            customAlert({
                title: 'Task Not Assigned',
                message: 'This task is not assigned to anyone.',
                type: 'info'
            });
            return;
        }

        customAlert({
            title: 'Confirm Unassign',
            message: `Are you sure you want to unassign this task from ${task.assignedTo.name}?`,
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

    const handleStatusUpdate = async (taskId, newStatus) => {
    
        
        const task = tasks.find(t => t.id === taskId);

        
        if (!task) {
            customAlert({
                title: 'Error',
                message: 'Task not found',
                type: 'error'
            });
            return;
        }

        // Check if user can update status: ADMIN, DIRECTOR, or assigned user
        const canUpdateStatus = userInfo.role === 'ADMIN' ||
            userInfo.role === 'DIRECTOR' ||
            (task.assignedTo && task.assignedTo.userId === userInfo.userId);



        if (!canUpdateStatus) {
            customAlert({
                title: 'Permission Denied',
                message: 'You can only update status of tasks assigned to you, or you need ADMIN/DIRECTOR role',
                type: 'error'
            });
            return;
        }

        try {
            const result = await updateTaskStatus(taskId, newStatus);

            if (result.success) {
                // No need to call refreshTasks() here since useTasks now updates local state immediately
                customAlert({
                    title: 'Success',
                    message: `Task status updated to ${newStatus} successfully!`,
                    type: 'success'
                });
            } else {
                throw new Error(result.error || 'Failed to update task status');
            }
        } catch (error) {
            console.error('❌ Error in handleStatusUpdate:', error);
            customAlert({
                title: 'Error',
                message: error.message || 'Failed to update task status. Please try again.',
                type: 'error'
            });
        }
    };

    // --- Search & Filters ---
    const [searchTerm, setSearchTerm] = useState('');
    const [taskStatus, setTaskStatus] = useState('ALL'); // ALL | NEW | UNDER_PROCESS | COMPLETED
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // --- Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Fixed to 10 items per page

    const isAdminOrDirector = userInfo.role === 'ADMIN' || userInfo.role === 'DIRECTOR';

    // Load available creators from tasks data
    useEffect(() => {
        if (!tasks || tasks.length === 0) {
            setAvailableCreators([]);
            return;
        }

        const creators = [];
        const seenIds = new Set();

        tasks.forEach(task => {
            if (task.uploadedBy && !seenIds.has(task.uploadedBy)) {
                seenIds.add(task.uploadedBy);
                creators.push({
                    id: task.uploadedBy,
                    name: task.uploadedBy === userInfo.userId ? 'Me' : task.uploadedByName,
                    role: 'CREATOR'
                });
            }
        });

        setAvailableCreators(creators);
    }, [tasks, userInfo.userId]);

    // Load available assignees from tasks data
    useEffect(() => {
        if (!tasks || tasks.length === 0) {
            setAvailableAssignees([]);
            return;
        }

        const assignees = [];
        const seenIds = new Set();

        tasks.forEach(task => {
            if (task.assignedTo && task.assignedTo.userId && !seenIds.has(task.assignedTo.userId)) {
                seenIds.add(task.assignedTo.userId);
                assignees.push({
                    id: task.assignedTo.userId,
                    name: task.assignedTo.userId === userInfo.userId ? 'Me' : task.assignedTo.name,
                    role: 'ASSIGNEE'
                });
            }
        });

        setAvailableAssignees(assignees);
    }, [tasks, userInfo.userId]);

    const clearAllFilters = () => {
        setSearchTerm('');
        setTaskStatus('ALL');
        setCreatedByFilter('ALL');
        setAssignedToFilter('ALL');
    };

    const hasActiveFilters = useMemo(() => {
        return (
            (searchTerm && searchTerm.trim() !== '') ||
            taskStatus !== 'ALL' ||
            createdByFilter !== 'ALL' ||
            assignedToFilter !== 'ALL'
        );
    }, [searchTerm, taskStatus, createdByFilter, assignedToFilter]);

    const normalizedIncludes = (text, query) => (text || '').toLowerCase().includes((query || '').toLowerCase());

    const filteredTasks = useMemo(() => {
        
        let list = [...tasks];

        // Search by title
        if (searchTerm.trim()) {
            list = list.filter(t => {
                const titleMatch = normalizedIncludes(t.title, searchTerm);
                const creatorName = t.uploadedBy === userInfo.userId ? 'Me' : (t.uploadedByName || '');
                const assigneeName = t.assignedTo?.userId === userInfo.userId ? 'Me' : (t.assignedTo?.name || '');
                return titleMatch || normalizedIncludes(creatorName, searchTerm) || normalizedIncludes(assigneeName, searchTerm);
            });
        }

        // Created By filter
        if (createdByFilter !== 'ALL') {
            list = list.filter(t => t.uploadedBy === parseInt(createdByFilter));
        }

        // Assigned To filter
        if (assignedToFilter !== 'ALL') {
            list = list.filter(t => t.assignedTo?.userId === parseInt(assignedToFilter));
        }

        // Task Status filter
        if (taskStatus === 'NEW') {
            list = list.filter(t => t.status === 'NEW');
        } else if (taskStatus === 'UNDER_PROCESS') {
            list = list.filter(t => t.status === 'UNDER_PROCESS');
        } else if (taskStatus === 'COMPLETED') {
            list = list.filter(t => t.status === 'COMPLETED');
        }


        return list;
    }, [tasks, searchTerm, createdByFilter, assignedToFilter, taskStatus, userInfo.userId]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, taskStatus, createdByFilter, assignedToFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of table
        const tableElement = document.querySelector('.task-table-container');
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: 'smooth' });
        }
    };


    // Pagination Component
    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center py-4 border-t border-gray-200 bg-gray-50">
                {/* Page info */}
                <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} tasks
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 px-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    // Show loading state while user data is being loaded
    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading user data...</span>
            </div>
        );
    }

    // Show error state if user data failed to load
    if (initError) {
        return (
            <div className="text-center text-red-600 p-8">
                <p>{initError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Reload Page
                </button>
            </div>
        );
    }

    // Show error if essential user data is missing
    if (!userInfo.companyId || !userInfo.userId) {
        return (
            <div className="text-center text-red-600 p-8">
                <p>Essential user data is missing. Please log in again.</p>

                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-start min-h-screen p-2 sm:p-4">
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border shadow-sm w-full max-w-[1200px] h-fit">
                {/* Title */}
                <h2 className="text-center text-xl p-2 font-bold text-gray-800">Calling Management</h2>
                
                {/* Mobile Filter Toggle */}
                {isAdminOrDirector && (
                    <div className="mb-4 flex justify-end">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors relative"
                            title="Toggle Filters"
                        >
                            <Filter className="h-5 w-5" />
                            {hasActiveFilters && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"></div>
                            )}
                        </button>
                    </div>
                )}

                {/* Filters Section */}
                {isAdminOrDirector && (
                    <div className={`mb-4 p-4 bg-gray-50 rounded-lg transition-all duration-300 ${showMobileFilters ? 'block' : 'hidden md:block'
                        }`}>
                        {/* Search and Filters Row */}
                        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 min-w-[300px]">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                <div className="min-w-[140px]">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Calling Status
                                    </label>
                                    <select
                                        value={taskStatus}
                                        onChange={(e) => setTaskStatus(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="ALL">Status</option>
                                        <option value="NEW">New</option>
                                        <option value="UNDER_PROCESS">Under Process</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>

                                <div className="min-w-[140px]">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Created By
                                    </label>
                                    <select
                                        value={createdByFilter}
                                        onChange={(e) => setCreatedByFilter(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="ALL">Creators</option>
                                        {availableCreators.map(creator => (
                                            <option key={creator.id} value={creator.id}>
                                                {creator.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="min-w-[140px]">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Assigned To
                                    </label>
                                    <select
                                        value={assignedToFilter}
                                        onChange={(e) => setAssignedToFilter(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="ALL">Assignments</option>
                                        {availableAssignees.map(assignee => (
                                            <option key={assignee.id} value={assignee.id}>
                                                {assignee.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            {/* Refresh Button */}
                            <div className="flex items-end">
                                <button
                                    onClick={refreshTasks}
                                    disabled={loading}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>
                            </div>
                        </div>

                        {/* Filter Summary */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-3 pt-3 border-t border-gray-200 gap-3">
                            <div className="text-sm text-gray-600 flex flex-col md:flex-row gap-2 md:gap-4">
                                <span>Showing {filteredTasks.length} of {tasks?.length || 0} tasks</span>
                                <div className="flex gap-4">
                                    <span className="text-yellow-600">New: {filteredTasks.filter(t => t.status === 'NEW').length}</span>
                                    <span className="text-blue-600">Under Process: {filteredTasks.filter(t => t.status === 'UNDER_PROCESS').length}</span>
                                    <span className="text-green-600">Completed: {filteredTasks.filter(t => t.status === 'COMPLETED').length}</span>
                                </div>
                                {createdByFilter !== 'ALL' && (
                                    <span className="text-purple-600">
                                        Creator: {availableCreators.find(c => c.id === parseInt(createdByFilter))?.name || 'Unknown'}
                                    </span>
                                )}
                                {assignedToFilter !== 'ALL' && (
                                    <span className="text-indigo-600">
                                        Assigned: {availableAssignees.find(a => a.id === parseInt(assignedToFilter))?.name || 'Unknown'}
                                    </span>
                                )}
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
                    <div className="task-table-container">
                        <TaskTable
                            tasks={paginatedTasks}
                            onOpen={handleOpen}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                            onAssign={handleAssign}
                            onUnassign={handleUnassign}
                            onStatusUpdate={handleStatusUpdate}
                            role={userInfo.role}
                            canManageTask={canManageTask}
                            isTaskAssignedToUser={isTaskAssignedToUser}
                            loading={loading}
                        />
                        
                        {/* Pagination Controls */}
                        <PaginationControls />
                    </div>
                )}
            </div>

            {/* Custom Alert Modal */}
            <CustomAlert />
            
            {/* User Selection Modal */}
            <UserSelectionModal />
        </div>
    );
};

export default TaskSection;
