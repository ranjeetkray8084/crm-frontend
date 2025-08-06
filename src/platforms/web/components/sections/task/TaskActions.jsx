import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Download, UserPlus, UserMinus, Trash2 } from 'lucide-react';

const TaskActions = ({ 
  task, 
  onOpen, 
  onDownload, 
  onAssign, 
  onUnassign, 
  onDelete, 
  role,
  canManageTask,
  isTaskAssignedToUser,
  loading = false
}) => {
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = async (callback, requiresConfirm = false, confirmMessage = '') => {
    if (actionLoading || loading || !callback) return;

    if (requiresConfirm) {
      const confirmed = window.confirm(confirmMessage || 'Are you sure you want to perform this action?');
      if (!confirmed) return;
    }

    try {
      setActionLoading(true);
      await callback(task.id);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
      setOpen(false);
    }
  };

  // Check permissions
  const canManage = canManageTask?.(task.uploadedBy?.userId);
  const isAssigned = isTaskAssignedToUser?.(task.assignedTo?.userId);
  
  // Only show actions if user has management rights or is assigned to the task
  if (!canManage && !isAssigned && role === 'USER') {
    return null;
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        title="More actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-52 z-50 bg-white border border-gray-200 rounded-md shadow-xl animate-fadeIn"
          role="menu"
          aria-orientation="vertical"
        >
          <ul className="py-1 text-sm text-gray-700">
            <li>
              <button
                onClick={() => handleAction(onOpen)}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
              >
                <Eye size={16} className="mr-2" />
                Preview Task
              </button>
            </li>

            {/* Download only available for assigned users or managers */}
            {(isAssigned || canManage) && (
              <li>
                <button
                  onClick={() => handleAction(onDownload)}
                  className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
                >
                  <Download size={16} className="mr-2" />
                  Download File
                </button>
              </li>
            )}

            {/* Assignment actions only available for managers */}
            {canManage && (
              <li>
                {task.assignedTo ? (
                  <button
                    onClick={() => handleAction(onUnassign)}
                    className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <UserMinus size={16} className="mr-2" />
                    Unassign Task
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(onAssign)}
                    className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <UserPlus size={16} className="mr-2" />
                    Assign Task
                  </button>
                )}
              </li>
            )}

            {/* Unassign action also available for assigned users */}
            {!canManage && isAssigned && task.assignedTo && (
              <li>
                <button
                  onClick={() => handleAction(onUnassign)}
                  className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
                >
                  <UserMinus size={16} className="mr-2" />
                  Unassign Self
                </button>
              </li>
            )}

            {/* Delete only available for managers */}
            {canManage && (
              <li>
                <button
                  onClick={() => handleAction(onDelete)}
                  className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Task
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskActions;