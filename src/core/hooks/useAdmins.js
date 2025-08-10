// Admins Hook - Refactored for Web & Mobile
import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../services/admin.service';
import { customAlert } from '../utils/alertUtils';

export const useAdmins = (companyId, role, userId) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wrap the main data loading function in useCallback for performance
  // and to prevent re-creating it on every render.
  const loadAdmins = useCallback(async () => {
    // For DEVELOPER role, we don't need companyId since they see all admins across companies
    if (role === 'DEVELOPER') {
      if (!role || !userId) {
        setLoading(false);
        return;
      }
    } else {
      // For other roles, we need companyId
      if (!companyId || !role || !userId) {
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      if (role === 'DEVELOPER') {
        // Developer can see all admins across all companies
        result = await AdminService.getAllAdmins();
      } else {
        // Other roles see admins by company
        result = await AdminService.getAdminRoleByCompany(companyId);
      }

      if (result.success) {
        setAdmins(result.data || []);
      } else {
        setError(result.error);
        customAlert('❌ ' + result.error);
      }
    } catch (err) {
      const errorMsg = 'Failed to load admins';
      setError(errorMsg);
      customAlert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  }, [companyId, role, userId]); // This function depends on companyId, role, and userId.

  // The effect now depends on the memoized `loadAdmins` function.
  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);


  // STEP 1: Create a single helper function to handle all API actions.
  // This removes all the duplicate try...catch blocks.
  const executeAdminAction = useCallback(async (apiCall, successMsg, errorMsg, shouldReload = true) => {
    try {
      const result = await apiCall();

      if (result.success) {
        customAlert(`✅ ${successMsg}`);
        // Refresh the list of admins if the action was successful and shouldReload is true.
        if (shouldReload) {
          await loadAdmins();
        }
        return { success: true, message: result.message };
      } else {
        customAlert(`❌ ${result.error || errorMsg}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      customAlert(`❌ ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }, [loadAdmins]); // This helper depends on the memoized loadAdmins function.


  // STEP 2: All the exported functions are now clean, one-line calls to the helper.
  const activateAdmin = useCallback((adminId) =>
    executeAdminAction(
      () => AdminService.activateAdmin(adminId),
      'Admin activated successfully',
      'Failed to activate admin'
    ), [executeAdminAction]);

  const revokeAdmin = useCallback((adminId) =>
    executeAdminAction(
      () => AdminService.revokeAdmin(adminId),
      'Admin deactivated successfully',
      'Failed to deactivate admin'
    ), [executeAdminAction]);

  const assignAdmin = useCallback((userId, adminId) =>
    executeAdminAction(
      () => AdminService.assignAdmin(userId, adminId),
      'Admin assigned successfully',
      'Failed to assign admin',
      true // We ensure the list reloads for consistency.
    ), [executeAdminAction]);

  const unassignAdmin = useCallback((userId) =>
    executeAdminAction(
      () => AdminService.unassignAdmin(userId),
      'Admin unassigned successfully',
      'Failed to unassign admin',
      true // We ensure the list reloads for consistency.
    ), [executeAdminAction]);

  // Add role-based methods like useUsers hook
  const getAllAdmins = useCallback(async () => {
    try {
      const result = await AdminService.getAllAdmins();
      if (result.success) {
        setAdmins(result.data || []);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to load all admins' };
    }
  }, []);

  const getAdminsByRoleAndCompany = useCallback(async () => {
    try {
      const result = await AdminService.getAdminRoleByCompany(companyId);
      if (result.success) {
        setAdmins(result.data || []);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to load company admins' };
    }
  }, [companyId]);

  return {
    admins,
    loading,
    error,
    loadAdmins,
    activateAdmin,
    revokeAdmin,
    assignAdmin,
    unassignAdmin,
    getAllAdmins,
    getAdminsByRoleAndCompany
  };
};
