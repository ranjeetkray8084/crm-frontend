import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users as AdminIcon } from "lucide-react";
import { useAdmins } from '../../../../core/hooks/useAdmins';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import UpdateUserModal from "../../components/action/UpdateUserModal";
import AdminTableRow from './AdminTableRow';
import AssignedUsersModal from '../modals/AssignedUsersModal';

const AdminSection = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const role = user?.role;
  const userId = user?.userId || user?.id;

  // Use useAdmins hook for admin management actions
  const {
    admins,
    loading,
    error,
    loadAdmins,
    activateAdmin,
    revokeAdmin,
    getAdminsByRoleAndCompany,
    getAllAdmins
  } = useAdmins(role === 'DEVELOPER' ? null : companyId, role, userId);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [viewingAssignedUsers, setViewingAssignedUsers] = useState(null);

  // Load admins based on current user's role
  const loadAdminsData = async () => {
    // For DEVELOPER, we don't need companyId since they see all admins across companies
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
        // Developer can see all ADMIN role users across all companies
        await getAllAdmins();
      } else if (role === 'DIRECTOR') {
        // Director can see all ADMIN role users in the company
        await getAdminsByRoleAndCompany();
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    loadAdminsData();
  }, [companyId, role, userId]);

  // Handle admin operations with reload
  const handleActivateAdmin = async (adminId) => {
    const result = await activateAdmin(adminId);
    if (result.success) {
      // Table will automatically reload due to useAdmins hook
    }
  };

  const handleRevokeAdmin = async (adminId) => {
    const result = await revokeAdmin(adminId);
    if (result.success) {
      // Table will automatically reload due to useAdmins hook
    }
  };

  // Handle modal close with reload
  const handleUpdateModalClose = () => {
    setSelectedAdmin(null);
    // Reload admins after modal closes
    loadAdminsData();
  };

  const handleAssignedUsersModalClose = () => {
    setViewingAssignedUsers(null);
  };

  // Different filtering based on role
  const filteredAdmins = admins.filter((admin) => {
    const search = searchQuery.toLowerCase();
    
    if (role === 'DEVELOPER') {
      // Developer search includes Admin ID and Company
      return (
        admin.name?.toLowerCase().includes(search) ||
        admin.email?.toLowerCase().includes(search) ||
        admin.userId?.toString().includes(search) ||
        (admin.company?.name || admin.companyName || '')?.toLowerCase().includes(search)
      );
    } else {
      // Director search includes Phone and Role
      return (
        admin.name?.toLowerCase().includes(search) ||
        admin.email?.toLowerCase().includes(search) ||
        admin.phone?.toLowerCase().includes(search) ||
        admin.role?.toLowerCase().includes(search)
      );
    }
  });

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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admins</h2>
          <input
            type="text"
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      ) : (
        /* Original Header for Director */
        <div className="sticky top-0 bg-white z-10 pb-4">
          <div className="flex justify-center items-center gap-3 mb-3">
            <AdminIcon className="text-gray-500" size={28} />
            <h2 className="text-xl font-semibold text-gray-800">Admins Management</h2>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search admins..."
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
            /* Simple Admin Table for Developer */
            <table id="adminTable" className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Admin ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Company</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No admins found.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => {
                    const companyName = admin.company?.name || admin.companyName || "No Company";
                    return (
                      <tr key={admin.userId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{admin.userId}</td>
                        <td className="border border-gray-300 px-4 py-2">{admin.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{admin.email}</td>
                        <td className="border border-gray-300 px-4 py-2">{companyName}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Full Admin Table for Director */
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
                      <th className="border-b border-gray-200 px-6 py-4 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-gray-500">
                          No admins found.
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((admin) => (
                        <AdminTableRow
                          key={admin.userId}
                          admin={admin}
                          searchTerm={searchQuery}
                          onUpdate={setSelectedAdmin}
                          onActivate={handleActivateAdmin}
                          onDeactivate={handleRevokeAdmin}
                          onViewAssignedUsers={setViewingAssignedUsers}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View for Director */}
              <div className="space-y-4 md:hidden">
                {filteredAdmins.length === 0 ? (
                  <p className="text-gray-500 text-center">No admins found.</p>
                ) : (
                  filteredAdmins.map((admin) => {
                    const isActive =
                      admin.status === "active" || admin.status === true || admin.status === 1;

                    return (
                      <div
                        key={admin.userId}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <button
                          onClick={() => setViewingAssignedUsers(admin)}
                          className="font-semibold text-lg mb-3 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                          title="Click to view assigned users"
                        >
                          {admin.name}
                        </button>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Email:</span>
                            <span className="text-gray-700">{admin.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Phone:</span>
                            <span className="text-gray-700">{admin.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Role:</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {admin.role}
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
                        </div>
                        <div className="mt-3 space-y-2">
                          <button
                            onClick={() => setSelectedAdmin(admin)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Update
                          </button>
                          <button
                            onClick={() =>
                              isActive
                                ? handleRevokeAdmin(admin.userId)
                                : handleActivateAdmin(admin.userId)
                            }
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white ${isActive
                              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                              : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                              }`}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
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
      {selectedAdmin && role === 'DIRECTOR' && (
        <UpdateUserModal
          user={selectedAdmin}
          onClose={handleUpdateModalClose}
        />
      )}

      {/* Show Assigned Users Modal if selected - Only for Director */}
      {viewingAssignedUsers && role === 'DIRECTOR' && (
        <AssignedUsersModal
          isOpen={!!viewingAssignedUsers}
          admin={viewingAssignedUsers}
          onClose={handleAssignedUsersModalClose}
        />
      )}
    </motion.div>
  );
};

export default AdminSection;
