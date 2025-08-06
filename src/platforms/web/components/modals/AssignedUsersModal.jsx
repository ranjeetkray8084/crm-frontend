import { useState, useEffect } from 'react';
import { X, Users, User, Mail, Phone, UserCheck, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUsers } from '../../../../core/hooks/useUsers';

const AssignedUsersModal = ({ isOpen, onClose, admin }) => {
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use the useUsers hook
  const { getUsersByAdmin } = useUsers();

  useEffect(() => {
    if (isOpen && admin?.userId) {
      loadAssignedUsers();
    }
  }, [isOpen, admin?.userId]);

  const loadAssignedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsersByAdmin(admin.userId);
      if (result.success) {
        setAssignedUsers(result.data || []);
      } else {
        setError(result.error || 'Failed to load assigned users');
      }
    } catch (err) {
      setError('Failed to load assigned users');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAssignedUsers([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={24} />
                <div>
                  <h2 className="text-xl font-semibold">Assigned Users</h2>
                  <p className="text-blue-100 text-sm">
                    Users assigned to {admin?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-blue-600 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">❌ {error}</div>
                <button
                  onClick={loadAssignedUsers}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : assignedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No Users Assigned</p>
                <p className="text-sm">This admin has no users assigned to them.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full table-auto border-collapse bg-white">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-sm text-gray-800">
                      <tr>
                        <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Name</th>
                        <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Email</th>
                        <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Phone</th>
                        <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Role</th>
                        <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedUsers.map((user) => {
                        const isActive = user.status === "active" || user.status === true || user.status === 1;
                        return (
                          <tr key={user.userId || user.id} className="text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400" />
                                {user.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                {user.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                {user.phone}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {isActive ? (
                                  <>
                                    <UserCheck size={12} className="mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <UserX size={12} className="mr-1" />
                                    Inactive
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {assignedUsers.map((user) => {
                    const isActive = user.status === "active" || user.status === true || user.status === 1;
                    return (
                      <div key={user.userId || user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 font-semibold text-lg mb-3 text-gray-900">
                          <User size={18} className="text-gray-400" />
                          {user.name}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-500 w-16">Email:</span>
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-500 w-16">Phone:</span>
                            <span className="text-gray-700">{user.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-500 w-16">Role:</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-500 w-16">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {isActive ? (
                                <>
                                  <UserCheck size={12} className="mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <UserX size={12} className="mr-1" />
                                  Inactive
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Users size={16} />
                    <span className="font-medium">
                      Total: {assignedUsers.length} user{assignedUsers.length !== 1 ? 's' : ''} assigned to {admin?.name}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssignedUsersModal;