import { useState } from 'react';
import { MoreVertical, Edit, Trash2, MessageSquare, Eye } from 'lucide-react';

const PropertyTableRow = ({ property, onDelete, onAddRemark, onViewRemarks, onUpdate, onStatusChange }) => {
  const [showActions, setShowActions] = useState(false);
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  
  // Use the visibility rules from the property object
  const isOwner = property._isOwner;
  const canViewPrivateFields = property._canViewPrivateFields;

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
        {canViewPrivateFields ? (property.unit || property.unitDetails || 'N/A') : '🔒 Hidden'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate text-center">{property.floor || 'N/A'}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
        {canViewPrivateFields ? (property.ownerContact || property.ownerNumber || 'N/A') : '🔒 Hidden'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(property.createdAt)}
        {property.createdBy?.name && <div className="text-xs text-gray-400">by {property.createdBy.name}</div>}
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <MoreVertical size={16} />
        </button>

        {showActions && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              <button onClick={() => { onUpdate(property); setShowActions(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                <Edit size={14} /> Update Property
              </button>
              <button onClick={() => { onAddRemark(property); setShowActions(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                <MessageSquare size={14} /> Add Remark
              </button>
              <button onClick={() => { onViewRemarks(property); setShowActions(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                <Eye size={14} /> View Remarks
              </button>
              <button onClick={() => { onDelete(property.propertyId || property.id); setShowActions(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                <Trash2 size={14} /> Delete Property
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

export default PropertyTableRow;
