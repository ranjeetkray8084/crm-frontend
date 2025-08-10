import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../services';
import { customAlert } from '../utils/alertUtils';

export const useUsers = (companyId, role, userId) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Primary Data Loading ---
  const loadUsers = useCallback(async () => {
    if (!companyId && role !== 'DEVELOPER') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      if (role === 'ADMIN') {
        result = await UserService.getUsersByAdmin(userId);
      } else if (role === 'DIRECTOR') {
        result = await UserService.getAllUsersByCompany(companyId);
      } else if (role === 'DEVELOPER') {
        result = await UserService.getUsersWithUserRole();
      } else {
        // If no role is provided or unsupported role, load all company users
        result = await UserService.getAllUsersByCompany(companyId);
      }

      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error);
        customAlert('❌ ' + result.error);
      }
    } catch (err) {
      const errorMsg = 'Failed to load users';
      setError(errorMsg);
      customAlert('❌ ' + errorMsg);
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

  const getAllUsersByCompany = useCallback(async () => {
    try {
      const result = await UserService.getAllUsersByCompany(companyId);
      if (result.success) {
        setUsers(result.data || []);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to load all company users' };
    }
  }, [companyId]);

  const createUser = useCallback((data) =>
    executeUserAction(() => UserService.createUser(data), 'User created successfully', 'Failed to create user'), [executeUserAction]);

  const updateUser = useCallback((id, data) =>
    executeUserAction(() => UserService.updateProfile(id, data), 'User updated successfully', 'Failed to update user'), [executeUserAction]);

  const deleteUser = useCallback((id) =>
    executeUserAction(() => UserService.deleteUser(id), 'User deleted successfully', 'Failed to delete user'), [executeUserAction]);

  const activateUser = useCallback((id) =>
    executeUserAction(() => UserService.unrevokeUser(id), 'User activated successfully', 'Failed to activate user'), [executeUserAction]);

  const deactivateUser = useCallback((id) =>
    executeUserAction(() => UserService.revokeUser(id), 'User deactivated successfully', 'Failed to deactivate user'), [executeUserAction]);

  const assignAdmin = useCallback((userId, adminId) =>
    executeUserAction(() => UserService.assignAdmin(userId, adminId), 'Admin assigned successfully', 'Failed to assign admin'), [executeUserAction]);

  const unassignAdmin = useCallback((userId) =>
    executeUserAction(() => UserService.unassignAdmin(userId), 'Admin unassigned successfully', 'Failed to unassign admin'), [executeUserAction]);

  const uploadAvatar = useCallback((userId, file, name = 'avatar') =>
    executeUserAction(() => UserService.uploadAvatar(userId, file, name), 'Avatar uploaded', 'Avatar upload failed', false), [executeUserAction]);

  const getUserAvatar = useCallback((userId) =>
    fetchUserData(() => UserService.getAvatar(userId), 'Failed to load avatar'), [fetchUserData]);

  const logout = useCallback(() =>
    fetchUserData(() => UserService.logout(), 'Logout failed'), [fetchUserData]);

  const checkSession = useCallback(() =>
    fetchUserData(() => UserService.checkSession(), 'Session invalid'), [fetchUserData]);

  // --- Lookup & Fetch Methods (no UI reload) ---
  const getUserById = useCallback((id) =>
    fetchUserData(() => UserService.getUserById(id), 'Failed to load user'), [fetchUserData]);

  const getUsernameById = useCallback((id) =>
    fetchUserData(() => UserService.getUsernameById(id), 'Failed to load username'), [fetchUserData]);

  const getUsersWithRole = useCallback((role) =>
    fetchUserData(() => UserService.getUsersByRole(role), `Failed to load ${role}s`), [fetchUserData]);

  const getUsersWithUserRole = useCallback(async () => {
    try {
      const result = await UserService.getUsersWithUserRole();
      if (result.success) {
        setUsers(result.data || []);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to load users' };
    }
  }, []);

  const getUsersByRoleAndCompany = useCallback(async (role) => {
    try {
      const result = await UserService.getUsersByRoleAndCompany(companyId, role);
      if (result.success) {
        setUsers(result.data || []);
      }
      return result;
    } catch (error) {
      return { success: false, error: `Failed to load ${role}s` };
    }
  }, [companyId]);

  const getUsersByAdmin = useCallback(async (adminId) => {
    try {
      const result = await UserService.getUsersByAdmin(adminId);
      if (result.success) {
        setUsers(result.data || []);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to load users' };
    }
  }, []);

  const getUserByAdmin = useCallback((adminId, userId) =>
    fetchUserData(() => UserService.getUserByAdmin(adminId, userId), 'Failed to load user'), [fetchUserData]);

  const countUsersByAdmin = useCallback((adminId) =>
    fetchUserData(() => UserService.countUsersByAdmin(adminId, companyId), 'Failed to count users'), [fetchUserData, companyId]);

  const getAdminsByCompany = useCallback(() =>
    fetchUserData(() => UserService.getAdminsByCompany(companyId), 'Failed to load admins'), [fetchUserData, companyId]);

  // --- Effect ---
  useEffect(() => {
    if (companyId || role === 'DEVELOPER') {
      loadUsers();
    }
  }, [loadUsers]);

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
