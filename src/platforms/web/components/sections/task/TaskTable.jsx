import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Calendar, User, UserCheck, Clock } from 'lucide-react';
import TaskActions from './TaskActions';

const TaskTable = ({ 
  tasks = [], 
  onOpen, 
  onDelete, 
  onAssign, 
  onUnassign, 
  onDownload, 
  onStatusUpdate,
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

    if (sortConfig.key === 'assignedToDate') {
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
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-[1000px] w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader columnKey="title" title="Title" />
              <SortableHeader columnKey="uploadDate" title="Created" />
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
                <td colSpan="5" className="text-center py-6 text-gray-400">No tasks found.</td>
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
                      by {task.uploadedByName || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.assignedTo ? (
                      <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {task.assignedTo.name}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          {task.assignedToDate ? formatDate(task.assignedToDate) : 'Date not set'}
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Unassigned
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          Not assigned
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={task.status || 'NEW'}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        if (newStatus === 'COMPLETED') {
                          if (window.confirm(`Are you sure you want to mark this task as ${newStatus}?`)) {
                            onStatusUpdate(task.id, newStatus);
                          } else {
                            e.target.value = task.status || 'NEW';
                          }
                        } else {
                          onStatusUpdate(task.id, newStatus);
                        }
                      }}
                      className={`px-2 py-1 border rounded-full text-xs font-semibold appearance-none focus:outline-none focus:ring-2 ${
                        task.status === 'NEW' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        task.status === 'UNDER_PROCESS' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="NEW">NEW</option>
                      <option value="UNDER_PROCESS">UNDER PROCESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-lg font-medium">No tasks found</div>
            <div className="text-sm mt-1">Try adjusting your filters</div>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              {/* Task Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={task.title}>
                    {task.title}
                  </h3>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.uploadDate)}
                    <span className="ml-2">
                      by {task.uploadedByName || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0">
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
              </div>

              {/* Task Details */}
              <div className="space-y-2">

                {/* Assigned To */}
                <div className="flex items-center text-sm">
                  <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Assigned to:</span>
                  {task.assignedTo ? (
                    <>
                      <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {task.assignedTo.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        {task.assignedToDate ? formatDate(task.assignedToDate) : 'Date not set'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Unassigned
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        Not assigned
                      </span>
                    </>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Status:</span>
                  <select
                    value={task.status || 'NEW'}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if (newStatus === 'COMPLETED') {
                        if (window.confirm(`Are you sure you want to mark this task as ${newStatus}?`)) {
                          onStatusUpdate(task.id, newStatus);
                        } else {
                          e.target.value = task.status || 'NEW';
                        }
                      } else {
                        onStatusUpdate(task.id, newStatus);
                      }
                    }}
                    className={`ml-1 px-2 py-1 border rounded-full text-xs font-semibold appearance-none focus:outline-none focus:ring-2 ${
                      task.status === 'NEW' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      task.status === 'UNDER_PROCESS' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-300' :
                      'bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="UNDER_PROCESS">UNDER PROCESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default TaskTable;
