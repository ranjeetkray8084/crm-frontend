import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../services';
import { customAlert } from '../utils/alertUtils';

export const useUsers = (companyId, role, userId) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Primary Data Loading ---
  const loadUsers = useCallback(async () => {
    if (!companyId) {
      console.log("⚠️ Missing companyId:", companyId);
      return;
    }

    setLoading(true);
    console.log("📥 Loading users with params:", { companyId, role, userId });

    try {
      let data = [];
      if (role === 'ADMIN') {
        const res = await UserService.getUsersByAdmin(companyId, userId);
        data = res.data;
      } else if (role === 'DIRECTOR') {
        const res = await UserService.getAllUsersByCompany(companyId);
        data = res.data;
      } else if (role === 'DEVELOPER') {
        const res = await UserService.getUsersWithUserRole();
        data = res.data;
      }
      else {
        // If no role is provided or unsupported role, load all company users
        console.log("🔄 No role provided or unsupported role, loading all company users");
        const res = await UserService.getAllUsersByCompany(companyId);
        data = res.data;
      }

      console.log("✅ Users fetched:", data);
      setUsers(data);
    } catch (err) {
      console.error("❌ Error loading users:", err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [companyId, role, userId]);

  // --- Action Handler Helper ---
  const executeUserAction = useCallback(async (apiCall, successMsg, errorMsg, shouldReload = true) => {
    try {
      const result = await apiCall();
      if (result.success) {
        customAlert(`✅ ${successMsg}`);
        if (shouldReload) await loadUsers();
        return { success: true, message: result.message, data: result.data };
      } else {
        customAlert(`❌ ${result.error || errorMsg}`);
        return { success: false, error: result.error };
      }
    } catch (err) {
      customAlert(`❌ ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }, [loadUsers]);

  const fetchUserData = useCallback(async (apiCall, errorMsg) => {
    try {
      return await apiCall();
    } catch {
      return { success: false, error: errorMsg };
    }
  }, []);

  // --- Action Methods ---

  const getAllUsersByCompany = () =>
    fetchUserData(() => UserService.getAllUsersByCompany(companyId), 'Failed to load all company users');

  const createUser = (data) =>
    executeUserAction(() => UserService.createUser(data), 'User created successfully', 'Failed to create user');

  const updateUser = (id, data) =>
    executeUserAction(() => UserService.updateProfile(id, data), 'User updated successfully', 'Failed to update user');

  const deleteUser = (id) =>
    executeUserAction(() => UserService.deleteUser(id), 'User deleted successfully', 'Failed to delete user');

  const activateUser = (id) =>
    executeUserAction(() => UserService.unrevokeUser(id), 'User activated successfully', 'Failed to activate user');

  const deactivateUser = (id) =>
    executeUserAction(() => UserService.revokeUser(id), 'User deactivated successfully', 'Failed to deactivate user');

  const assignAdmin = (userId, adminId) =>
    executeUserAction(() => UserService.assignAdmin(userId, adminId), 'Admin assigned successfully', 'Failed to assign admin');

  const unassignAdmin = (userId) =>
    executeUserAction(() => UserService.unassignAdmin(userId), 'Admin unassigned successfully', 'Failed to unassign admin');

  const uploadAvatar = (userId, file, name = 'avatar') =>
    executeUserAction(() => UserService.uploadAvatar(userId, file, name), 'Avatar uploaded', 'Avatar upload failed', false);

  const getUserAvatar = (userId) =>
    fetchUserData(() => UserService.getAvatar(userId), 'Failed to load avatar');

  const logout = () =>
    fetchUserData(() => UserService.logout(), 'Logout failed');

  const checkSession = () =>
    fetchUserData(() => UserService.checkSession(), 'Session invalid');

  // --- Lookup & Fetch Methods (no UI reload) ---
  const getUserById = (id) =>
    fetchUserData(() => UserService.getUserById(id), 'Failed to load user');

  const getUsernameById = (id) =>
    fetchUserData(() => UserService.getUsernameById(id), 'Failed to load username');

  const getUsersWithRole = (role) =>
    fetchUserData(() => UserService.getUsersByRole(role), `Failed to load ${role}s`);

  const getUsersWithUserRole = () =>
    fetchUserData(() => UserService.getUsersWithUserRole(), 'Failed to load users');

  const getUsersByRoleAndCompany = (role) =>
    fetchUserData(() => UserService.getUsersByRoleAndCompany(companyId, role), `Failed to load ${role}s`);

  const getUsersByAdmin = (adminId) =>
    fetchUserData(() => UserService.getUsersByAdmin(adminId), 'Failed to load users');

  const getUserByAdmin = (adminId, userId) =>
    fetchUserData(() => UserService.getUserByAdmin(adminId, userId), 'Failed to load user');

  const countUsersByAdmin = (adminId) =>
    fetchUserData(() => UserService.countUsersByAdmin(adminId, companyId), 'Failed to count users');

  const getAdminsByCompany = () =>
    fetchUserData(() => UserService.getAdminsByCompany(companyId), 'Failed to load admins');

  // --- Effect ---
  useEffect(() => {
    if (companyId) loadUsers();
  }, [companyId, loadUsers]);

  // --- Return All Methods & States ---
  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    assignAdmin,
    unassignAdmin,
    uploadAvatar,
    getUserAvatar,
    logout,
    checkSession,
    getUserById,
    getUsernameById,
    getUsersWithRole,
    getUsersWithUserRole,
    getUsersByRoleAndCompany,
    getUsersByAdmin,
    getUserByAdmin,
    countUsersByAdmin,
    getAdminsByCompany,
    getAllUsersByCompany
  };
};
