import { useState, useEffect } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUsers } from '../../../../core/hooks';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import UpdateUserModal from "../../components/action/UpdateUserModal";
import AssignAdminModal from "../../components/action/AssignAdminModal";
import UserTableRow from './UserTableRow';

const UsersSection = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const role = user?.role;
  const userId = user?.userId || user?.id;

  // Use useUsers hook for user management actions
  // For DEVELOPER role, we don't need companyId since they see all users across companies
  const {
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
  const [userRoleUsers, setUserRoleUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

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

    setUserLoading(true);
    try {
      let result;

      if (role === 'DEVELOPER') {
        // Developer can see all USER role users across all companies using specific endpoint
        result = await getUsersWithUserRole();
      } else if (role === 'DIRECTOR') {
        // Director can see all USER role users in the company
        result = await getUsersByRoleAndCompany('USER');
      } else if (role === 'ADMIN') {
        // Admin can see only users assigned to them
        result = await getUsersByAdmin(userId);
      } else {
        // For other roles, show no users
        setUserRoleUsers([]);
        setUserLoading(false);
        return;
      }

      if (result.success) {
        setUserRoleUsers(result.data || []);
      } else {
        setUserRoleUsers([]);
      }
    } catch (error) {
      setUserRoleUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    loadUserRoleUsers();
  }, [companyId, role, userId]);

  // Different filtering based on role
  const filteredUsers = userRoleUsers.filter((user) => {
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

      {userLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Different tables based on role */}
          {role === 'DEVELOPER' ? (
            /* Simple User Table for Developer */
            <table id="userTable" className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">User ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Company</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const companyName = user.company?.name || user.companyName || "No Company";
                    return (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{user.userId}</td>
                        <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                        <td className="border border-gray-300 px-4 py-2">{companyName}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Full User Table for Director */
            <>
              <div className="hidden md:block max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 shadow-sm">
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
                          onActivate={activateUser}
                          onDeactivate={deactivateUser}
                          onAssignAdmin={setAssigningUser}
                          onUnassignAdmin={unassignAdmin}
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
                        <div className="font-semibold text-lg mb-3 text-gray-800">
                          {user.name}
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
                        <div className="mt-3 space-y-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Update
                          </button>
                          <button
                            onClick={() =>
                              isActive
                                ? deactivateUser(user.userId)
                                : activateUser(user.userId)
                            }
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white ${isActive
                              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                              : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                              }`}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
                          {isDirector && (
                            <button
                              onClick={() =>
                                hasAdmin
                                  ? unassignAdmin(user.userId)
                                  : setAssigningUser(user)
                              }
                              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white ${hasAdmin
                                ? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                                }`}
                            >
                              {hasAdmin ? "Unassign Admin" : "Assign Admin"}
                            </button>
                          )}
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
          onClose={() => {
            setSelectedUser(null);
            loadUserRoleUsers();
          }}
        />
      )}

      {/* Show Assign Admin Modal if selected - Only for Director */}
      {assigningUser && role === 'DIRECTOR' && (
        <AssignAdminModal
          user={assigningUser}
          onClose={() => setAssigningUser(null)}
          onAssigned={() => loadUserRoleUsers()}
        />
      )}
    </motion.div>
  );
};

export default UsersSection;
