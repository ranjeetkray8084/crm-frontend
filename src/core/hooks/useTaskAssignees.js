import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserService } from '../services';

export const useTaskAssignees = (companyId, currentUserRole, currentUserId) => {
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
                // Director can assign to all users in company
                result = await UserService.getAllUsersByCompany(companyId);
            } else if (currentUserRole === 'ADMIN') {
                // Admin can only assign to users assigned to them
                result = await UserService.getUsersByAdmin(currentUserId);
            } else {
                // Regular users don't need this dropdown
                setAllUsers([]);
                return;
            }

            if (result.success) {
                console.log('🔍 useTaskAssignees - Raw API data:', result.data);
                console.log('🔍 Current user role:', currentUserRole);
                setAllUsers(result.data || []);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [companyId, currentUserRole, currentUserId]);

    // Filter users based on current user role
    const filteredUsers = useMemo(() => {
        if (!allUsers.length || !currentUserRole) return [];

        let filtered = [];

        if (currentUserRole === 'DIRECTOR') {
            // Director can assign to: USER and ADMIN roles only
            filtered = allUsers.filter(user =>
                user.role === 'USER' || user.role === 'ADMIN'
            );
        } else if (currentUserRole === 'ADMIN') {
            // Admin can assign to: Only USER role users assigned to them
            filtered = allUsers.filter(user => {
                const isUserRole = user.role === 'USER';
                console.log('🔍 Filtering user:', user.name, 'Role:', user.role, 'Include:', isUserRole);
                return isUserRole;
            });
            console.log('🔍 Filtered users for ADMIN:', filtered.map(u => ({ name: u.name, role: u.role })));
        }

        // Sort alphabetically by name
        return filtered.sort((a, b) => {
            const aName = a.name || a.username || a.email || '';
            const bName = b.name || b.username || b.email || '';
            return aName.localeCompare(bName);
        });
    }, [allUsers, currentUserRole]);

    // Format users for dropdown
    const dropdownUsers = useMemo(() => {
        return filteredUsers.map(user => ({
            id: user.id || user.userId,
            name: user.name || user.username || user.email || 'Unknown User',
            role: user.role
        }));
    }, [filteredUsers]);

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