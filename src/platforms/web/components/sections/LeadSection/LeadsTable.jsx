import { useState } from 'react';
import LeadTableRow from './LeadTableRow';

const LeadsTable = ({
    leads,
    searchTerm,
    onStatusUpdate,
    onBulkStatusUpdate,
    onDelete,
    onAddRemark,
    onGetRemarks,
    onAssign,
    onUnassign,
    onUpdate,
    onAddFollowUp,
    onViewFollowUps,
    companyId
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedLeads = [...leads].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('name')}
                        >
                            Lead Name {getSortIcon('name')}
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('phone')}
                        >
                            Phone {getSortIcon('phone')}
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('status')}
                        >
                            Status {getSortIcon('status')}
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('budget')}
                        >
                            Budget {getSortIcon('budget')}
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('requirement')}
                        >
                            Requirement {getSortIcon('requirement')}
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('location')}
                        >
                            Location {getSortIcon('location')}
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('createdAt')}
                        >
                            Created {getSortIcon('createdAt')}
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('assignedTo')}
                        >
                            Assigned To {getSortIcon('assignedTo')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedLeads.map((lead) => (
                        <LeadTableRow
                            key={lead.leadId || lead.id}
                            lead={lead}
                            searchTerm={searchTerm}
                            onStatusUpdate={onStatusUpdate}
                            onDelete={onDelete}
                            onAddRemark={onAddRemark}
                            onGetRemarks={onGetRemarks}
                            onAssign={onAssign}
                            onUnassign={onUnassign}
                            onUpdate={onUpdate}
                            onAddFollowUp={onAddFollowUp}
                            onViewFollowUps={onViewFollowUps}
                            companyId={companyId}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeadsTable;
