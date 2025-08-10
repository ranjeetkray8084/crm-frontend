import React, { useState, useEffect } from 'react';
import { X, User, Search } from 'lucide-react';
import { useUsers } from '../../../../../core/hooks/useUsers';

const UserAssignmentModal = ({
  isOpen,
  onClose,
  onAssign,
  taskId,
  companyId,
  currentUserRole,
  currentUserId,
  loading = false
}) => {
  const { getAllUsersByCompany, getUsersByAdmin } = useUsers(companyId);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && companyId) {
      fetchUsers();
    }
  }, [isOpen, companyId, currentUserId, currentUserRole]);

  useEffect(() => {
    // Filter users based on search term (search by name)
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError('');

    try {
      let usersToSet = [];

      if (currentUserRole === 'ADMIN' && currentUserId) {
        // For ADMIN role, get only users assigned to this admin
        const result = await getUsersByAdmin(currentUserId);
        if (result.success) {
          usersToSet = result.data || [];
        } else {
          setError(result.error || 'Failed to load users assigned to you');
          usersToSet = [];
        }
      } else {
        // For other roles, get all users and filter based on role
        const result = await getAllUsersByCompany();
        if (result.success) {
          const allUsers = result.data || [];
          
          // Role-based filtering logic
          if (currentUserRole === 'DIRECTOR') {
            // Director can assign to ADMIN and USER roles
            usersToSet = allUsers.filter(user =>
              user.role === 'ADMIN' || user.role === 'USER'
            );
          } else if (currentUserRole === 'ADMIN') {
            // Admin can assign only to USER role (fallback if getUsersByAdmin fails)
            usersToSet = allUsers.filter(user => user.role === 'USER');
          } else {
            // USER role cannot assign tasks (this shouldn't happen)
            usersToSet = [];
          }
        } else {
          setError(result.error || 'Failed to load users');
          usersToSet = [];
        }
      }

      if (usersToSet.length === 0) {
        setError('No users available for assignment');
      }

      setUsers(usersToSet);
      setFilteredUsers(usersToSet);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssign = async (userId) => {
    try {
      await onAssign(taskId, userId);
      onClose();
    } catch (err) {
      setError(err.message || 'Assignment failed');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserIcon = () => {
    return <User className="h-4 w-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Assign Task to User
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* User List - Box Style */}
          <div className="border-2 border-gray-200 rounded-xl bg-gray-50 p-4">
            <div className="max-h-64 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading users...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No users found matching your search' : 'No users available for assignment'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getRoleColor(user.role)}`}>
                              {getUserIcon()}
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-base font-semibold text-gray-900">
                              {user.name} ({user.role})
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {user.email || 'No email provided'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssign(user.userId)}
                          disabled={loading}
                          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            'Assign'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Count */}
          {!loadingUsers && filteredUsers.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              {searchTerm ? (
                `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} found`
              ) : (
                `${users.length} user${users.length !== 1 ? 's' : ''} available for assignment`
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAssignmentModal;