import React, { useState, useEffect, useRef } from 'react';
import {
    MoreVertical, Edit, UserCheck, UserX
} from 'lucide-react';
import ThreeDotMenu from '../common/ThreeDotMenu';

const AdminTableRow = ({
    admin,
    searchTerm,
    onUpdate,
    onActivate,
    onDeactivate,
    onViewAssignedUsers
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
        onUpdate(admin);
        setShowActions(false);
    };

    const handleActivateClick = () => {
        onActivate(admin.userId);
        setShowActions(false);
    };

    const handleDeactivateClick = () => {
        onDeactivate(admin.userId);
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

    const isActive = admin.status === "active" || admin.status === true || admin.status === 1;

    return (
        <tr className="text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200 border-b border-gray-100">
            <td className="px-6 py-4 font-medium text-gray-900">
                <button
                    onClick={() => onViewAssignedUsers && onViewAssignedUsers(admin)}
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                    title="Click to view assigned users"
                >
                    {highlightText(admin.name, searchTerm)}
                </button>
            </td>
            <td className="px-6 py-4 text-gray-600">
                {highlightText(admin.email, searchTerm)}
            </td>
            <td className="px-6 py-4 text-gray-600">
                {highlightText(admin.phone, searchTerm)}
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {admin.role}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                    {isActive ? "Active" : "Inactive"}
                </span>
            </td>
            <td className="px-2 py-2 text-center">
                <ThreeDotMenu
                    item={admin}
                    actions={[
                        { label: 'Update Admin', icon: <Edit size={14} />, onClick: () => onUpdate(admin) },
                        isActive 
                            ? { label: 'Deactivate', icon: <UserX size={14} />, onClick: () => onDeactivate(admin.userId), danger: true }
                            : { label: 'Activate', icon: <UserCheck size={14} />, onClick: () => onActivate(admin.userId) }
                    ]}
                />
            </td>
        </tr>
    );
};

export default AdminTableRow;