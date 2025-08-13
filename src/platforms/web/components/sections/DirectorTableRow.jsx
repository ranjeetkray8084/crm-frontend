import React from 'react';
import { Edit, UserCheck, UserX } from 'lucide-react';
import ThreeDotMenu from '../common/ThreeDotMenu';

const DirectorTableRow = ({
    director,
    searchTerm,
    onUpdate,
    onActivate,
    onDeactivate,
    isDeveloper = false,
    isDirector = false,
    mobileView = false
}) => {
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

    const isActive = director.status === 'ACTIVE' || director.status === true || director.status === 'active';

    // Mobile view - return only the three-dot menu
    if (mobileView) {
        if (isDeveloper) {
            return null; // No actions for developer in mobile view
        }
        
        return (
            <ThreeDotMenu
                item={director}
                actions={[
                    { label: 'Update Director', icon: <Edit size={14} />, onClick: () => onUpdate(director) },
                    isActive 
                        ? { label: 'Deactivate', icon: <UserX size={14} />, onClick: () => onDeactivate(director.userId), danger: true }
                        : { label: 'Activate', icon: <UserCheck size={14} />, onClick: () => onActivate(director.userId) }
                ]}
            />
        );
    }

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="border-b px-6 py-4">
                <div className="font-medium text-gray-900">{highlightText(director.name, searchTerm)}</div>
            </td>
            <td className="border-b px-6 py-4 text-gray-600">{highlightText(director.email, searchTerm)}</td>
            <td className="border-b px-6 py-4 text-gray-600">{highlightText(director.phone, searchTerm)}</td>
            <td className="border-b px-6 py-4 text-gray-600">{director.company?.name || director.companyName || 'N/A'}</td>
            <td className="border-b px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="border-b px-2 py-2 text-center">
                {isDeveloper ? (
                    <span className="text-gray-400 text-sm">View Only</span>
                ) : (isDirector || !isDeveloper) ? (
                    <ThreeDotMenu
                        item={director}
                        actions={[
                            { label: 'Update Director', icon: <Edit size={14} />, onClick: () => onUpdate(director) },
                            isActive 
                                ? { label: 'Deactivate', icon: <UserX size={14} />, onClick: () => onDeactivate(director.userId), danger: true }
                                : { label: 'Activate', icon: <UserCheck size={14} />, onClick: () => onActivate(director.userId) }
                        ]}
                    />
                ) : (
                    <span className="text-gray-400 text-sm">No Actions</span>
                )}
            </td>
        </tr>
    );
};

export default DirectorTableRow;