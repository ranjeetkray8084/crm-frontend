import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../services';
import { customAlert } from '../utils/alertUtils';

export const useUsers = (companyId, role, userId, includeAdmins = false) => {
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
        let filteredUsers = result.data || [];
        
        // Additional filtering based on current user role
        if (role === 'ADMIN') {
          // Admin should only see USER role users assigned to them
          filteredUsers = filteredUsers.filter(user => user.role === 'USER');
        } else if (role === 'DIRECTOR') {
          // Director should see USER role users in company
          filteredUsers = filteredUsers.filter(user => user.role === 'USER');
        }
        // DEVELOPER role already gets filtered data from backend
        
        setUsers(filteredUsers);
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

  // --- Load All Users Including Admins and Directors ---
  const loadAllUsersIncludingAdmins = useCallback(async () => {
    if (!companyId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await UserService.getAllUsersByCompany(companyId);
      
      if (result.success) {
        // Don't filter by role - include all users (ADMIN, DIRECTOR, USER)
        const allUsers = result.data || [];
        setUsers(allUsers);
      } else {
        setError(result.error);
        customAlert('❌ ' + result.error);
      }
    } catch (err) {
      const errorMsg = 'Failed to load all users';
      setError(errorMsg);
      customAlert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // --- Load Only Admin and Director Users ---
  const loadAdminAndDirectorUsers = useCallback(async () => {
    if (!companyId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get ADMIN users by company
      const adminResult = await UserService.getAdminRoleByCompany(companyId);
      // Get DIRECTOR users (global)
      const directorResult = await UserService.getUsersWithDirectorRole();
      
      let adminDirectorUsers = [];
      
      if (adminResult.success) {
        adminDirectorUsers = adminDirectorUsers.concat(adminResult.data || []);
      }
      
      if (directorResult.success) {
        adminDirectorUsers = adminDirectorUsers.concat(directorResult.data || []);
      }
      
      setUsers(adminDirectorUsers);
    } catch (err) {
      const errorMsg = 'Failed to load admin and director users';
      setError(errorMsg);
      customAlert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // --- Load Only User Role Users ---
  const loadUserRoleUsers = useCallback(async () => {
    if (!companyId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the specific API for USER role users by company
      const result = await UserService.getUserRoleByCompany(companyId);
      
      if (result.success) {
        const userRoleUsers = result.data || [];
        setUsers(userRoleUsers);
      } else {
        setError(result.error);
        customAlert('❌ ' + result.error);
      }
    } catch (err) {
      const errorMsg = 'Failed to load user role users';
      setError(errorMsg);
      customAlert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

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

  const getAdminsByCompany = useCallback(async () => {
    try {
      const result = await UserService.getAdminsByCompany(companyId);
      if (result.success) {
        setUsers(result.data || []);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to load admins' };
    }
  }, [companyId]);

  // --- Effect ---
  useEffect(() => {
    if (companyId || role === 'DEVELOPER') {
      if (includeAdmins === 'admin-director') {
        // Load only ADMIN and DIRECTOR users for Created By filter
        loadAdminAndDirectorUsers();
      } else if (includeAdmins === 'user-only') {
        // Load only USER role users for Assigned To filter
        loadUserRoleUsers();
      } else if (includeAdmins === true) {
        // Load all users including admins (legacy support)
        loadAllUsersIncludingAdmins();
      } else {
        // Default behavior - load users based on role
        loadUsers();
      }
    }
  }, [loadUsers, loadAllUsersIncludingAdmins, loadAdminAndDirectorUsers, loadUserRoleUsers, includeAdmins, companyId, role]);

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
    getAllUsersByCompany,
    loadAllUsersIncludingAdmins,
    loadAdminAndDirectorUsers,
    loadUserRoleUsers
  };
};
