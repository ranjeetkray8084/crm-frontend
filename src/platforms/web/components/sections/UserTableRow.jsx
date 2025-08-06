import React, { useState, useEffect, useRef } from 'react';
import {
    MoreVertical, Edit, UserCheck, UserX, UserPlus, UserMinus
} from 'lucide-react';

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

    // Debug logging
    console.log('UserTableRow: Rendering user:', user.name, {
        showCompanyColumn,
        isDeveloper,
        companyName: user.companyName,
        userId: user.userId
    });

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
            <td className="px-6 py-4 text-center relative">
                {isDeveloper ? (
                    <span className="text-gray-400 text-sm">View Only</span>
                ) : (
                    <>
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {showActions && (
                            <div ref={actionsRef} className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                    <button
                                        onClick={handleUpdateClick}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        <Edit size={14} /> Update User
                                    </button>

                                    {isActive ? (
                                        <button
                                            onClick={handleDeactivateClick}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                        >
                                            <UserX size={14} /> Deactivate
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleActivateClick}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                        >
                                            <UserCheck size={14} /> Activate
                                        </button>
                                    )}

                                    {isDirector && (
                                        hasAdmin ? (
                                            <button
                                                onClick={handleUnassignAdminClick}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full text-left"
                                            >
                                                <UserMinus size={14} /> Unassign Admin
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleAssignAdminClick}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full text-left"
                                            >
                                                <UserPlus size={14} /> Assign Admin
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </td>
        </tr>
    );
};

export default UserTableRow;