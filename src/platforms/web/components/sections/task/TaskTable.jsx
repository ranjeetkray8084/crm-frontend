import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
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
  const [sortConfig, setSortConfig] = useState({ key: 'uploadDate', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorting logic
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'assignedTo') {
      aValue = a.assignedTo?.name || 'Unassigned';
      bValue = b.assignedTo?.name || 'Unassigned';
    }

    if (sortConfig.key === 'uploadedBy') {
      aValue = a.uploadedByName || 'Unknown';
      bValue = b.uploadedByName || 'Unknown';
    }

    if (sortConfig.key === 'uploadDate') {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
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
            <SortableHeader columnKey="title" title="Title" />
            <SortableHeader columnKey="uploadDate" title="Created At" />
            <SortableHeader columnKey="uploadedBy" title="Created By" />
            <SortableHeader columnKey="assignedTo" title="Assigned To" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-400">No tasks found.</td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900" title={task.title}>
                    {task.title}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-sm text-gray-900">{formatDate(task.uploadDate)}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(task.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.uploadedByName || 'Unknown'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.assignedTo ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {task.assignedTo.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.assignedTo
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {task.assignedTo ? 'Assigned' : 'Pending'}
                  </span>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex justify-center">
                    <TaskActions
                      task={task}
                      onOpen={onOpen}
                      onDownload={onDownload}
                      onAssign={onAssign}
                      onUnassign={onUnassign}
                      onDelete={onDelete}
                      role={role}
                      canManageTask={canManageTask}
                      isTaskAssignedToUser={isTaskAssignedToUser}
                      loading={loading}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
