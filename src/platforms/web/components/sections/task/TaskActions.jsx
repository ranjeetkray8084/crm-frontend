import { Eye, Download, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import ThreeDotMenu from '../../common/ThreeDotMenu';

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
  // Check permissions
  const canManage = canManageTask?.(task.uploadedBy?.userId);
  const isAssigned = isTaskAssignedToUser?.(task.assignedTo?.userId);
  const isAdminOrDirector = role === 'ADMIN' || role === 'DIRECTOR';

  const actions = [
    // Preview Task available for all roles
    { label: 'Preview Task', icon: <Eye size={16} />, onClick: () => onOpen(task.id) },
    
    // Download only available for assigned users or managers
    ...(isAssigned || canManage ? [
      { label: 'Download File', icon: <Download size={16} />, onClick: () => onDownload(task.id) }
    ] : []),
    
    // Assignment actions only available for ADMIN and DIRECTOR
    ...(isAdminOrDirector ? [
      task.assignedTo 
        ? { label: 'Unassign Task', icon: <UserMinus size={16} />, onClick: () => onUnassign(task.id) }
        : { label: 'Assign Task', icon: <UserPlus size={16} />, onClick: () => onAssign(task.id) },
      { label: 'Delete Task', icon: <Trash2 size={16} />, onClick: () => {
        console.log('Delete action clicked for task:', task.id);
        onDelete(task.id);
      }, danger: true }
    ] : [])
  ];

  return (
    <ThreeDotMenu
      item={task}
      actions={actions}
    />
  );
};

export default TaskActions;