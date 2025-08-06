import React from 'react';
import { useUsers } from '../../../../../../core/hooks/useUsers';

/**
 * A modal component for assigning a lead to a user.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls whether the modal is visible.
 * @param {Function} props.onClose - Function to call when the modal should be closed.
 * @param {Function} props.onAssign - Function to call when a user is selected for assignment. It receives (leadId, userId, userName).
 * @param {string|number|null} props.leadId - The ID of the lead to be assigned.
 * @param {string|number|null} props.companyId - The ID of the company to fetch users from.
 */
const AssignLeadModal = ({ isOpen, onClose, onAssign, leadId, companyId, userRole, currentUserId }) => {
  // Use the useUsers hook to fetch users with role and userId for proper filtering
  const { users: allUsers, loading, error } = useUsers(companyId, userRole, currentUserId);

  // Filter users based on current user's role
  const getFilteredUsers = () => {
    if (!allUsers || allUsers.length === 0) return [];

    // Role-based filtering logic similar to TaskAssignment
    if (userRole === 'DIRECTOR') {
      // Director can assign leads to ADMIN and USER roles
      return allUsers.filter(user => 
        user.role === 'ADMIN' || user.role === 'USER'
      );
    } else if (userRole === 'ADMIN') {
      // Admin can assign leads only to USER role
      return allUsers.filter(user => user.role === 'USER');
    } else {
      // USER role cannot assign leads (this shouldn't happen)
      return [];
    }
  };

  const users = getFilteredUsers();

  const handleAssignClick = (user) => {
    // Use id field as most APIs return id, not userId
    const userId = user.id || user.userId;
    onAssign(leadId, userId, user.name);
    onClose(); // Close the modal after selection
  };

  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose} // Close modal if overlay is clicked
    >
      {/* Modal Content: stopPropagation prevents clicks inside from closing the modal */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Assign Lead #{leadId}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-3xl font-light">&times;</button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto">
          {loading && <p className="text-center text-gray-500">Loading users...</p>}
          
          {error && <p className="text-center text-red-500">{error}</p>}
          
          {!loading && !error && (
            <div className="space-y-2">
              {users.length > 0 ? (
                users.map(user => (
                  <div
                    key={user.id || user.userId}
                    onClick={() => handleAssignClick(user)}
                    className="p-3 border rounded-lg hover:bg-blue-100 hover:border-blue-400 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email || 'No email available'}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users available for assignment</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal;
