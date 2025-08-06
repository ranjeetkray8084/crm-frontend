import { useState, useMemo } from 'react';
import PropertyTableRow from './PropertyTableRow';
import { ArrowUp, ArrowDown } from 'lucide-react';

const PropertiesTable = ({ properties, onDelete, onAddRemark, onViewRemarks, onUpdate, onStatusChange }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProperties = useMemo(() => {
    if (!sortConfig.key) return properties;

    return [...properties].sort((a, b) => {
      const getNestedValue = (obj, path) => path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [properties, sortConfig]);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  const SortableHeader = ({ columnKey, title, className = "" }) => (
    <th
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap ${className}`}
      onClick={() => handleSort(columnKey)}
    >
      {title}
      {getSortIcon(columnKey)}
    </th>
  );

  return (
    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-[1200px] w-full table-auto text-sm text-left text-gray-700">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader columnKey="propertyName" title="Name" />
            <SortableHeader columnKey="status" title="Status" />
            <SortableHeader columnKey="type" title="Type" />
            <SortableHeader columnKey="price" title="Price" />
            <SortableHeader columnKey="location" title="Location" />
            <SortableHeader columnKey="sector" title="Sector" />
            <SortableHeader columnKey="bhk" title="BHK" />
            <SortableHeader columnKey="unitDetails" title="Unit" />
            <SortableHeader columnKey="floor" title="Floor" />
            <SortableHeader columnKey="ownerNumber" title="Owner No." />
            <SortableHeader columnKey="createdAt" title="Created" />
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedProperties.map((property) => (
            <PropertyTableRow
              key={property.propertyId || property.id}
              property={property}
              onDelete={onDelete}
              onAddRemark={onAddRemark}
              onViewRemarks={onViewRemarks}
              onUpdate={onUpdate}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropertiesTable;
