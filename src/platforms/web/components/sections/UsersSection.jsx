import { useState, useEffect } from 'react';
import { Users as UsersIcon, Edit, UserCheck, UserX, UserPlus, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUsers } from '../../../../core/hooks';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import UpdateUserModal from "../../components/action/UpdateUserModal";
import AssignAdminModal from "../../components/action/AssignAdminModal";
import UserTableRow from './UserTableRow';
import ThreeDotMenu from '../common/ThreeDotMenu';

const UsersSection = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const role = user?.role;
  const userId = user?.userId || user?.id;

  // Use useUsers hook for user management actions
  // For DEVELOPER role, we don't need companyId since they see all users across companies
  const {
    users,
    loading,
    error,
    loadUsers,
    activateUser,
    deactivateUser,
    unassignAdmin,
    getUsersByRoleAndCompany,
    getUsersByAdmin,
    getUsersWithRole,
    getUsersWithUserRole
  } = useUsers(role === 'DEVELOPER' ? null : companyId, role, userId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [assigningUser, setAssigningUser] = useState(null);

  // Load users based on current user's role
  const loadUserRoleUsers = async () => {
    // For DEVELOPER, we don't need companyId since they see all users across companies
    if (role === 'DEVELOPER') {
      if (!role || !userId) {
        return;
      }
    } else {
      // For other roles, we need companyId
      if (!companyId || !role || !userId) {
        return;
      }
    }

    try {
      if (role === 'DEVELOPER') {
        // Developer can see all USER role users across all companies using specific endpoint
        await getUsersWithUserRole();
      } else if (role === 'DIRECTOR') {
        // Director can see all USER role users in the company
        await getUsersByRoleAndCompany('USER');
      } else if (role === 'ADMIN') {
        // Admin can see only users assigned to them
        await getUsersByAdmin(userId);
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    loadUserRoleUsers();
  }, [companyId, role, userId]);

  // Handle user operations with reload
  const handleActivateUser = async (userId) => {
    const result = await activateUser(userId);
    if (result.success) {
      // Table will automatically reload due to useUsers hook
    }
  };

  const handleDeactivateUser = async (userId) => {
    const result = await deactivateUser(userId);
    if (result.success) {
      // Table will automatically reload due to useUsers hook
    }
  };

  const handleUnassignAdmin = async (userId) => {
    const result = await unassignAdmin(userId);
    if (result.success) {
      // Table will automatically reload due to useUsers hook
    }
  };

  // Handle modal close with reload
  const handleUpdateModalClose = () => {
    setSelectedUser(null);
    // Reload users after modal closes
    loadUserRoleUsers();
  };

  const handleAssignAdminModalClose = () => {
    setAssigningUser(null);
  };

  const handleAssignAdminSuccess = () => {
    // Reload users after admin assignment
    loadUserRoleUsers();
  };

  // Different filtering based on role
  const filteredUsers = users.filter((user) => {
    const search = searchQuery.toLowerCase();
    
    if (role === 'DEVELOPER') {
      // Developer search includes User ID and Company
      return (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.userId?.toString().includes(search) ||
        (user.company?.name || user.companyName || '')?.toLowerCase().includes(search)
      );
    } else {
      // Director search includes Phone and Admin
      return (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search) ||
        user.adminName?.toLowerCase().includes(search)
      );
    }
  });

  const isDirector = role === 'DIRECTOR';

  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-100 rounded-lg">
          <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      {/* Different headers based on role */}
      {role === 'DEVELOPER' ? (
        /* Simple Header for Developer */
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Users</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      ) : (
        /* Original Header for Director */
        <div className="sticky top-0 bg-white z-10 pb-4">
          <div className="flex justify-center items-center gap-3 mb-3">
            <UsersIcon className="text-gray-500" size={28} />
            <h2 className="text-xl font-semibold text-gray-800">Users Management</h2>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4 px-4 py-2 border border-gray-300 rounded w-full max-w-md"
            />
          </div>
        </div>
      )}

      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Different tables based on role */}
          {role === 'DEVELOPER' ? (
            <>
              {/* Desktop Table for Developer */}
              <div className="hidden md:block">
                <table id="userTable" className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">User ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Company</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const companyName = user.company?.name || user.companyName || "No Company";
                        const isActive = user.status === true || user.status === 'active';
                        return (
                          <tr key={user.userId} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{user.userId}</td>
                            <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                            <td className="border border-gray-300 px-4 py-2">{companyName}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <span className="text-gray-400 text-sm">View Only</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View for Developer */}
              <div className="space-y-4 md:hidden">
                {filteredUsers.length === 0 ? (
                  <p className="text-gray-500 text-center">No users found.</p>
                ) : (
                  filteredUsers.map((user) => {
                    const companyName = user.company?.name || user.companyName || "No Company";
                    const isActive = user.status === true || user.status === 'active';
                    
                    return (
                      <div
                        key={user.userId}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-semibold text-lg text-gray-800">
                            {user.name}
                          </div>
                          <span className="text-gray-400 text-sm">View Only</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-20">ID:</span>
                            <span className="text-gray-700">{user.userId}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-20">Email:</span>
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-20">Company:</span>
                            <span className="text-gray-700">{companyName}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-20">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Full User Table for Director */
            <>
              <div className="hidden md:block max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full table-auto border-collapse bg-white">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-sm text-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Name</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Email</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Phone</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Role</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Status</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Admin</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <UserTableRow
                          key={user.userId}
                          user={user}
                          searchTerm={searchQuery}
                          onUpdate={setSelectedUser}
                          onActivate={handleActivateUser}
                          onDeactivate={handleDeactivateUser}
                          onAssignAdmin={setAssigningUser}
                          onUnassignAdmin={handleUnassignAdmin}
                          isDirector={isDirector}
                          isDeveloper={role === 'DEVELOPER'}
                          showCompanyColumn={false}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View for Director */}
              <div className="space-y-4 md:hidden">
                {filteredUsers.length === 0 ? (
                  <p className="text-gray-500 text-center">No users found.</p>
                ) : (
                  filteredUsers.map((user) => {
                    const isActive = user.status === true || user.status === 'active';
                    const hasAdmin = user.adminName && user.adminName !== 'No Admin';

                    return (
                      <div
                        key={user.userId}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-semibold text-lg text-gray-800">
                            {user.name}
                          </div>
                          <ThreeDotMenu
                            item={user}
                            actions={[
                              {
                                label: 'Update User',
                                icon: <Edit size={14} />,
                                onClick: () => setSelectedUser(user)
                              },
                              isActive
                                ? {
                                    label: 'Deactivate',
                                    icon: <UserX size={14} />,
                                    onClick: () => handleDeactivateUser(user.userId),
                                    danger: true
                                  }
                                : {
                                    label: 'Activate',
                                    icon: <UserCheck size={14} />,
                                    onClick: () => handleActivateUser(user.userId)
                                  },
                              ...(isDirector ? [
                                hasAdmin
                                  ? {
                                      label: 'Unassign Admin',
                                      icon: <UserMinus size={14} />,
                                      onClick: () => handleUnassignAdmin(user.userId),
                                      danger: true
                                    }
                                  : {
                                      label: 'Assign Admin',
                                      icon: <UserPlus size={14} />,
                                      onClick: () => setAssigningUser(user)
                                    }
                              ] : [])
                            ]}
                          />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Email:</span>
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Phone:</span>
                            <span className="text-gray-700">{user.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Role:</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {user.role}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Status:</span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Admin:</span>
                            <span className="text-gray-700">{user.adminName || 'No Admin'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Show Update Modal if selected - Only for Director */}
      {selectedUser && role === 'DIRECTOR' && (
        <UpdateUserModal
          user={selectedUser}
          onClose={handleUpdateModalClose}
        />
      )}

      {/* Show Assign Admin Modal if selected - Only for Director */}
      {assigningUser && role === 'DIRECTOR' && (
        <AssignAdminModal
          user={assigningUser}
          onClose={handleAssignAdminModalClose}
          onAssigned={handleAssignAdminSuccess}
        />
      )}
    </motion.div>
  );
};

export default UsersSection;
