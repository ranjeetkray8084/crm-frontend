import React, { useState, useEffect, useRef } from 'react';
import {
    MoreVertical, Edit, UserCheck, UserX
} from 'lucide-react';

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
            <td className="px-6 py-4 text-center relative">
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
                                <Edit size={14} /> Update Admin
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
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default AdminTableRow;