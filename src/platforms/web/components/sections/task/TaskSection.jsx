import React, { useEffect, useState } from 'react';
import { useTasks } from '../../../../../core/hooks/useTasks';
import TaskTable from './TaskTable';

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
                alert('DEBUG: No authentication token found. This might cause logout.');
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
                alert(`DEBUG: Missing data - companyId: ${companyId}, userId: ${userId}`);
            }

            setUserInfo({ companyId, userId, role: userRole });

        } catch (error) {
            alert(`DEBUG: Error reading localStorage: ${error.message}`);
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



    useEffect(() => {
        if (loadTasksByRole && userInfo.companyId && userInfo.userId) {
            loadTasksByRole();
        }
    }, [loadTasksByRole, userInfo.companyId, userInfo.userId]);

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
        
        // Store taskId in localStorage
        localStorage.setItem('currentTaskId', taskId);
        
        // Check if we should preview in new tab or current tab
        const result = await previewExcel(taskId);
        if (result.success) {
            // Create URL for new tab with task data
            const editorUrl = `/excel-preview/${taskId}`;
            
            // Open in new tab
            window.open(editorUrl, '_blank');
            
            customAlert({
                title: 'Excel Editor Opened',
                message: 'Excel editor has been opened in a new tab for viewing.',
                type: 'success'
            });
        } else {
            customAlert({
                title: 'Error',
                message: 'Failed to load Excel data. Please try again.',
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

        if (!canManageTask(task.uploadedBy?.userId)) {
            customAlert({
                title: 'Permission Denied',
                message: 'You do not have permission to assign this task',
                type: 'error'
            });
            return;
        }

        const assignedUserId = prompt('Enter user ID to assign:');
        if (assignedUserId) {
            try {
                const result = await assignTask(taskId, assignedUserId);
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
                    message: error.message || 'Failed to assign task. Please check the user ID and try again.',
                    type: 'error'
                });
            }
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

        if (!canManageTask(task.uploadedBy?.userId) && !isTaskAssignedToUser(task.assignedTo?.userId)) {
            customAlert({
                title: 'Permission Denied',
                message: 'You do not have permission to unassign this task',
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="ml-4 text-gray-600">Loading tasks...</div>
            </div>
        );
    }

    // Check if user info is missing
    if (!userInfo.companyId || !userInfo.userId) {
        return (
            <div className="text-center p-4 text-yellow-600 bg-yellow-100 rounded-lg mb-4">
                <div className="font-semibold">User session expired or not found. Please log in again.</div>
                <div className="mt-2 text-sm">
                    Missing: {!userInfo.companyId && 'Company ID'} {!userInfo.userId && 'User ID'}
                </div>
                <div className="mt-2 text-xs">
                    Debug: companyId={userInfo.companyId}, userId={userInfo.userId}, role={userInfo.role}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
                        <p className="text-gray-600 mt-1">Role: {userInfo.role} | Total Tasks: {tasks.length}</p>
                    </div>
                    <div className="flex space-x-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Assigned: {tasks.filter(task => task.assignedTo).length}
                        </span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            Pending: {tasks.filter(task => !task.assignedTo).length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Task Table */}
            <TaskTable
                tasks={tasks}
                onOpen={handleOpen}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onAssign={handleAssign}
                onUnassign={handleUnassign}
                role={userInfo.role}
            />

            {/* Custom Alert Modal */}
            <CustomAlert />


        </div>
    );
};

export default TaskSection;
