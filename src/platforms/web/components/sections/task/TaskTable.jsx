import React, { useState } from 'react';
import TaskActions from './TaskActions';

const TaskTable = ({ 
  tasks = [], 
  onOpen, 
  onDelete, 
  onAssign, 
  onUnassign, 
  onDownload, 
  role, 
  canManageTask,
  isTaskAssignedToUser,
  loading,
  error
}) => {
  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading tasks...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-gray-500">
          <p>No tasks found</p>
        </div>
      </div>
    );
  }
  const [sortField, setSortField] = useState('uploadDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Sorting logic
  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'assignedTo') {
      aValue = a.assignedTo?.name || 'Unassigned';
      bValue = b.assignedTo?.name || 'Unassigned';
    }

    if (sortField === 'uploadDate') {
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

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="bg-white rounded-lg shadow relative z-10 h-[600px] w-[1220px] border">
      <div className="h-full overflow-auto">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b border-gray-200">
              <th
                className="w-[400px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Title <SortIcon field="title" />
                </div>
              </th>
              <th
                className="w-[200px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                onClick={() => handleSort('uploadDate')}
              >
                <div className="flex items-center gap-1">
                  Created At <SortIcon field="uploadDate" />
                </div>
              </th>
              <th
                className="w-[250px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap border-r border-gray-200"
                onClick={() => handleSort('assignedTo')}
              >
                <div className="flex items-center gap-1">
                  Assigned To <SortIcon field="assignedTo" />
                </div>
              </th>
              <th
                className="w-[200px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-r border-gray-200"
              >
                Status
              </th>
              <th className="w-[170px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">No tasks found.</td>
              </tr>
            ) : (
              sortedTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="w-[400px] px-4 py-4 whitespace-nowrap border-r border-gray-200">
                    <div className="text-sm text-gray-900 overflow-hidden text-ellipsis" title={task.title}>
                      {task.title}
                    </div>
                  </td>
                  <td className="w-[200px] px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                    {formatDateTime(task.uploadDate)}
                  </td>
                  <td className="w-[250px] px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                    <span className={`px-2 py-1 rounded-full text-xs ${task.assignedTo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {task.assignedTo?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="w-[200px] px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                    <span className={`px-2 py-1 rounded-full text-xs ${task.assignedTo
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {task.assignedTo ? 'Assigned' : 'Pending'}
                    </span>
                  </td>
                  <td className="w-[170px] px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <TaskActions
                      task={task}
                      onOpen={onOpen}
                      onDownload={onDownload}
                      onAssign={onAssign}
                      onUnassign={onUnassign}
                      onDelete={onDelete}
                      role={role}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
