import { useState, useCallback, useEffect } from 'react'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { useUsers } from '../../../../core/hooks/useUsers'
import { useAuth } from '../../../../shared/contexts/AuthContext'
import { customAlert } from '../../../../core/utils/alertUtils'

const AddUserForm = ({ onSuccess }) => {
  const { user } = useAuth()
  const companyId = user?.companyId
  const userRole = user?.role
  const userId = user?.userId || user?.id

  // Use the useUsers hook instead of direct service
  const { createUser, loading } = useUsers(companyId, userRole, userId)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: userRole === 'DEVELOPER' ? 'DIRECTOR' : 'USER',
    adminId: ''
  })

  const [admins, setAdmins] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)

  // Get available roles based on current user's role
  const getAvailableRoles = useCallback(() => {
    const roles = [];

    if (userRole === 'DEVELOPER') {
      // Developer can only create DIRECTOR
      roles.push({ value: 'DIRECTOR', label: 'Director' });
    } else if (userRole === 'DIRECTOR') {
      // Director can create ADMIN and USER
      roles.push(
        { value: 'ADMIN', label: 'Admin' },
        { value: 'USER', label: 'User' }
      );
    } else if (userRole === 'ADMIN') {
      // Admin can only create USER (hardcoded)
      roles.push({ value: 'USER', label: 'User' });
    }

    return roles;
  }, [userRole])

  const availableRoles = getAvailableRoles()

  // Load admins when role is USER (for DIRECTOR only)
  const loadAdmins = useCallback(async () => {
    if (!companyId || userRole !== 'DIRECTOR') return;

    setLoadingAdmins(true);
    try {
      const response = await fetch(`/api/users/admin-role/${companyId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const adminsList = await response.json();
        setAdmins(adminsList);
      } else {
        console.error('Failed to load admins');
        setAdmins([]);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  }, [companyId, userRole]);

  // Load admins when role changes to USER (for DIRECTOR)
  useEffect(() => {
    if (formData.role === 'USER' && userRole === 'DIRECTOR') {
      loadAdmins();
    }
  }, [formData.role, userRole, loadAdmins]);

  // Form validation
  const isFormValid = useCallback(() => {
    const baseValid = (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.role &&
      companyId &&
      availableRoles.length > 0
    );

    // For DIRECTOR creating USER, admin selection is required
    if (userRole === 'DIRECTOR' && formData.role === 'USER') {
      return baseValid && formData.adminId;
    }

    // For DEVELOPER, no additional validation needed (only creates DIRECTOR)
    return baseValid;
  }, [formData, companyId, availableRoles, userRole])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
  
    if (!companyId) {
      customAlert('❌ Company ID not found. Please login again.');
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      customAlert('❌ Passwords do not match!');
      return;
    }
  
    try {
      // Use the exact structure from your working JavaScript code
      const role = userRole === 'ADMIN' ? 'USER' : 
                   userRole === 'DEVELOPER' ? 'DIRECTOR' : 
                   formData.role;
      const adminId = userRole === 'ADMIN' ? userId : formData.adminId;

      const user = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: role,
        company: { id: parseInt(companyId, 10) },
        admin: role === "USER" && adminId ? { userId: parseInt(adminId, 10) } : null
      };

      // Remove confirmPassword before sending (backend validation)
      delete user.confirmPassword;
  
      console.log('📦 Final Payload Sent (exact working structure):', JSON.stringify(user, null, 2));
  
      const result = await createUser(user);
  
      if (result.success) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: userRole === 'DEVELOPER' ? 'DIRECTOR' : 'USER',
          adminId: ''
        });
        onSuccess?.();
      }
    } catch (error) {
      
      console.error('Error adding user:', error);
      customAlert('❌ Error adding user: ' + error.message);
    }
  }, [formData, companyId, createUser, onSuccess, userRole, userId]);
  

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Load admins when role changes to USER (for DIRECTOR)
    if (name === 'role' && value === 'USER' && userRole === 'DIRECTOR') {
      loadAdmins();
    }
  }, [userRole, loadAdmins])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center text-white">
            <UserPlus className="mr-3" size={24} />
            <h2 className="text-xl font-semibold">Add New User</h2>
          </div>
        </div>

        <div className="p-6">
          {!companyId && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              ⚠️ Company ID not found. Please login again.
            </div>
          )}

          {userRole === 'USER' && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              ⚠️ You don't have permission to create users.
            </div>
          )}

          {userRole === 'DEVELOPER' && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              ℹ️ As a Developer, you can only create Directors for companies.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Role selection - for DEVELOPER and DIRECTOR */}
              {(userRole === 'DEVELOPER' || userRole === 'DIRECTOR') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {availableRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Admin selection - only for DIRECTOR when creating USER */}
              {userRole === 'DIRECTOR' && formData.role === 'USER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Admin *
                  </label>
                  <select
                    name="adminId"
                    value={formData.adminId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loadingAdmins}
                  >
                    <option value="">
                      {loadingAdmins ? 'Loading admins...' : 'Select Admin'}
                    </option>
                    {admins.map(admin => (
                      <option key={admin.userId} value={admin.userId}>
                        {admin.name}
                      </option>
                    ))}
                  </select>
                  {admins.length === 0 && !loadingAdmins && (
                    <p className="text-sm text-red-600 mt-1">
                      No admins available. Please create an admin first.
                    </p>
                  )}
                </div>
              )}

              {/* Info for ADMIN role */}
              {userRole === 'ADMIN' && (
                <div className="md:col-span-2">
                  <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    ℹ️ As an Admin, you can only create Users. The user will be automatically assigned to you.
                  </div>
                </div>
              )}

              {/* Info for DEVELOPER role */}
              {userRole === 'DEVELOPER' && (
                <div className="md:col-span-2">
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    ℹ️ As a Developer, you can only create Directors. Directors will manage their company operations.
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onSuccess?.()}
                className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                <UserPlus size={18} className="mr-2" />
                {loading ? 'Adding User...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddUserForm