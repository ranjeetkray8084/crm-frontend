import { useState } from 'react';
import { MoreVertical, Edit, Trash2, MessageSquare, Eye } from 'lucide-react';
import ThreeDotMenu from '../../common/ThreeDotMenu';

const PropertyTableRow = ({ property, onDelete, onAddRemark, onViewRemarks, onUpdate, onStatusChange }) => {
  const [showActions, setShowActions] = useState(false);

  const statusOptions = [
    { value: 'AVAILABLE_FOR_SALE', label: 'For Sale' },
    { value: 'AVAILABLE_FOR_RENT', label: 'For Rent' },
    { value: 'SOLD_OUT', label: 'Sold Out' },
    { value: 'RENT_OUT', label: 'Rented Out' }
  ];

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'AVAILABLE_FOR_SALE':
        return 'bg-green-100 text-green-800 border-green-200 focus:ring-green-500';
      case 'AVAILABLE_FOR_RENT':
        return 'bg-blue-100 text-blue-800 border-blue-200 focus:ring-blue-500';
      case 'SOLD_OUT':
        return 'bg-red-100 text-red-800 border-red-200 focus:ring-red-500';
      case 'RENT_OUT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 focus:ring-yellow-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 focus:ring-gray-500';
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    onStatusChange(property.propertyId || property.id, newStatus);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900" title={property.propertyName}>
          {property.propertyName}
        </div>
        <div className="text-sm text-gray-500">
          {property.source && `Source: ${property.source}`}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <select
          value={property.status}
          onChange={handleStatusChange}
          className={`px-2 py-1 border rounded-full text-xs font-semibold appearance-none focus:outline-none focus:ring-2 ${getStatusStyles(property.status)}`}
          onClick={(e) => e.stopPropagation()}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 truncate">
          {property.type || 'N/A'}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
        {formatPrice(property.price)}
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 truncate" title={property.location}>
        {property.location || 'N/A'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate text-center">{property.sector || 'N/A'}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate text-center">{property.bhk || 'N/A'}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
        {property.unit || property.unitDetails || 'N/A'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate text-center">{property.floor || 'N/A'}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
        {property.ownerContact || property.ownerNumber || 'N/A'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="text-sm text-gray-900">{formatDate(property.createdAt)}</div>
        <div className="text-xs text-gray-500">
          by {property.createdBy?.name || property.createdByName || 'Unknown'}
        </div>
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <ThreeDotMenu
          item={property}
          actions={[
            { label: 'Update Property', icon: <Edit size={14} />, onClick: () => onUpdate(property) },
            { label: 'Add Remark', icon: <MessageSquare size={14} />, onClick: () => onAddRemark(property) },
            { label: 'View Remarks', icon: <Eye size={14} />, onClick: () => onViewRemarks(property) },
            { label: 'Delete Property', icon: <Trash2 size={14} />, onClick: () => onDelete(property.propertyId || property.id), danger: true }
          ]}
        />
      </td>
    </tr>
  );
};

export default PropertyTableRow;
