import React, { useState, useEffect, useRef } from 'react';
import {
    MoreVertical, Edit, UserCheck, UserX, UserPlus, UserMinus
} from 'lucide-react';
import ThreeDotMenu from '../common/ThreeDotMenu';

const UserTableRow = ({
    user,
    searchTerm,
    onUpdate,
    onActivate,
    onDeactivate,
    onAssignAdmin,
    onUnassignAdmin,
    isDirector,
    isDeveloper = false,
    showCompanyColumn = false
}) => {
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef(null);

    const highlightText = (text, searchTerm) => {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.toString().split(regex);
        return parts.map((part, index) =>
            regex.test(part)
                ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
                : part
        );
    };

    const handleUpdateClick = () => {
        onUpdate(user);
        setShowActions(false);
    };

    const handleActivateClick = () => {
        onActivate(user.userId);
        setShowActions(false);
    };

    const handleDeactivateClick = () => {
        onDeactivate(user.userId);
        setShowActions(false);
    };

    const handleAssignAdminClick = () => {
        onAssignAdmin(user);
        setShowActions(false);
    };

    const handleUnassignAdminClick = () => {
        onUnassignAdmin(user.userId);
        setShowActions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target)) {
                setShowActions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = user.status === true || user.status === 'active';
    const hasAdmin = user.adminName && user.adminName !== 'No Admin';

    return (
        <tr className="text-sm text-gray-700 hover:bg-blue-50">
            <td className="px-6 py-4 font-medium text-gray-900">
                {highlightText(user.name, searchTerm)}
            </td>
            <td className="px-6 py-4 text-gray-600">
                {highlightText(user.email, searchTerm)}
            </td>
            <td className="px-6 py-4 text-gray-600">
                {highlightText(user.phone, searchTerm)}
            </td>
            {showCompanyColumn && (
                <td className="px-6 py-4 text-gray-600">
                    {user.companyName || 'N/A'}
                </td>
            )}
            <td className="px-6 py-4 text-purple-700 font-medium">
                {user.role}
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-6 py-4 text-gray-600">
                {user.adminName || 'No Admin'}
            </td>
            <td className="px-6 py-4 text-center">
                {isDeveloper ? (
                    <span className="text-gray-400 text-sm">View Only</span>
                ) : (
                    <ThreeDotMenu
                        item={user}
                        actions={[
                            { label: 'Update User', icon: <Edit size={14} />, onClick: () => onUpdate(user) },
                            isActive 
                                ? { label: 'Deactivate', icon: <UserX size={14} />, onClick: () => onDeactivate(user.userId), danger: true }
                                : { label: 'Activate', icon: <UserCheck size={14} />, onClick: () => onActivate(user.userId) },
                            ...(isDirector ? [
                                hasAdmin 
                                    ? { label: 'Unassign Admin', icon: <UserMinus size={14} />, onClick: () => onUnassignAdmin(user.userId) }
                                    : { label: 'Assign Admin', icon: <UserPlus size={14} />, onClick: () => onAssignAdmin(user) }
                            ] : [])
                        ]}
                    />
                )}
            </td>
        </tr>
    );
};

export default UserTableRow;