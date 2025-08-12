import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserService } from '../services';

export const useTaskCreators = (companyId, currentUserRole, currentUserId) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load users based on role
  const loadUsers = useCallback(async () => {
    if (!companyId || !currentUserRole) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (currentUserRole === 'DIRECTOR') {
        // Director can see all users in company
        result = await UserService.getAllUsersByCompany(companyId);
      } else if (currentUserRole === 'ADMIN') {
        // Admin can see all users in company (for now, we'll filter later)
        result = await UserService.getAllUsersByCompany(companyId);
      } else {
        // Regular users don't need this dropdown
        setAllUsers([]);
        return;
      }

      if (result.success) {
        setAllUsers(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [companyId, currentUserRole]);

  // Filter and sort users based on current user role
  const filteredUsers = useMemo(() => {
    if (!allUsers.length || !currentUserRole) return [];

    let filtered = [];

    if (currentUserRole === 'DIRECTOR') {
      // Director sees: DIRECTOR and ADMIN roles only
      filtered = allUsers.filter(user => 
        user.role === 'DIRECTOR' || user.role === 'ADMIN'
      );
    } else if (currentUserRole === 'ADMIN') {
      // Admin sees: ADMIN role only
      filtered = allUsers.filter(user => 
        user.role === 'ADMIN'
      );
    }

    // Sort: Current user first, then alphabetically
    return filtered.sort((a, b) => {
      const aId = a.id || a.userId;
      const bId = b.id || b.userId;
      
      // Current user goes first
      if (String(aId) === String(currentUserId)) return -1;
      if (String(bId) === String(currentUserId)) return 1;
      
      // Then sort alphabetically by name
      const aName = a.name || a.username || a.email || '';
      const bName = b.name || b.username || b.email || '';
      return aName.localeCompare(bName);
    });
  }, [allUsers, currentUserRole, currentUserId]);

  // Format users for dropdown
  const dropdownUsers = useMemo(() => {
    return filteredUsers.map(user => ({
      id: user.id || user.userId,
      name: user.name || user.username || user.email || 'Unknown User',
      role: user.role,
      isCurrentUser: String(user.id || user.userId) === String(currentUserId)
    }));
  }, [filteredUsers, currentUserId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users: dropdownUsers,
    loading,
    error,
    refreshUsers: loadUsers
  };
};