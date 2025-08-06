import React from 'react';
import { RefreshCw, Search, Filter, Download } from 'lucide-react';

const TaskToolbar = ({ 
  onRefresh, 
  searchTerm, 
  onSearchChange, 
  loading = false,
  taskCount = 0 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Title and count */}
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
          <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {taskCount} tasks
          </span>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskToolbar;