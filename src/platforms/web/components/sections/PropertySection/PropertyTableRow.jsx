import { useState } from 'react';
import { MoreVertical, Edit, Trash2, MessageSquare, Eye, Clock } from 'lucide-react';
import ThreeDotMenu from '../../common/ThreeDotMenu';
import ReminderDateModal from '../../common/ReminderDateModal';
import { parseSize, calculatePricePerUnit, formatPricePerUnit } from '../../../../../core/utils/sizeUtils';

const PropertyTableRow = ({ property, onDelete, onAddRemark, onViewRemarks, onUpdate, onStatusChange, onSetReminder, onOutOfBox, currentUserId, userRole, onShowReminderModal }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const statusOptions = [
    { value: 'AVAILABLE_FOR_SALE', label: 'For Sale' },
    { value: 'AVAILABLE_FOR_RENT', label: 'For Rent' },
    { value: 'SOLD_OUT', label: 'Sold Out' },
    { value: 'RENT_OUT', label: 'Rented Out' },
    { value: 'DROPPED', label: 'Dropped' }
  ];

  // Get user data from sessionStorage
  const getUserData = () => {
    try {
      const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      return null;
    }
  };

  const userData = getUserData();
  const currentUserRole = userRole || userData?.role;
  const currentUserIdFromStorage = currentUserId || userData?.userId || userData?.id;

  // Access control logic
  const canUpdateProperty = () => {
    // Director role can update any property
    if (currentUserRole === 'DIRECTOR') {
      return true;
    }
    
    // Only the creator can update their own property
    const propertyCreatorId = property.createdBy?.id || property.createdBy?.userId || property.createdById;
    return propertyCreatorId && propertyCreatorId.toString() === currentUserIdFromStorage?.toString();
  };

  const canChangeStatus = () => {
    // Director role can change status of any property
    if (currentUserRole === 'DIRECTOR') {
      return true;
    }
    
    // Only the creator can change status of their own property
    const propertyCreatorId = property.createdBy?.id || property.createdBy?.userId || property.createdById;
    return propertyCreatorId && propertyCreatorId.toString() === currentUserIdFromStorage?.toString();
  };

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
      case 'DROPPED':
        return 'bg-gray-100 text-gray-600 border-gray-300 focus:ring-gray-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 focus:ring-gray-500';
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    console.log('🔄 Status change requested:', newStatus, 'for property:', property.propertyId || property.id);
    
    // If changing to RENT_OUT, show reminder modal first
    if (newStatus === 'RENT_OUT') {
      console.log('📅 RENT_OUT selected, showing reminder modal...');
      if (onShowReminderModal) {
        onShowReminderModal(property, newStatus);
      } else {
        setShowReminderModal(true);
        setPendingStatusChange(newStatus);
      }
    } else {
      console.log('🔄 Direct status change for non-RENT_OUT status');
      onStatusChange(property.propertyId || property.id, newStatus);
    }
  };

  const handleSetReminder = async (reminderDate) => {
    // First change the status to RENT_OUT if there's a pending status change
    if (pendingStatusChange) {
      console.log('🔄 Changing status to RENT_OUT first...');
      const statusResult = await onStatusChange(property.propertyId || property.id, pendingStatusChange);
      setPendingStatusChange(null);
      
      // Wait for status change to complete and refresh data
      console.log('⏳ Waiting for status change to complete...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if status change was successful
      if (statusResult && !statusResult.success) {
        console.error('❌ Status change failed:', statusResult.error);
        return;
      }
    }
    
    // Then set the reminder
    console.log('📅 Setting reminder after status change...');
    if (onSetReminder) {
      onSetReminder(property.propertyId || property.id, reminderDate);
    }
  };


  // Parse size with units
  const sizeData = parseSize(property.size);
  const pricePerUnit = calculatePricePerUnit(property.price, sizeData);

  return (
    <tr className="hover:bg-gray-50">
      {/* Project Name */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900" title={property.propertyName}>
          {property.propertyName}
        </div>
        <div className="text-sm text-gray-500">
          {property.source && `Source: ${property.source}`}
        </div>
      </td>
      
      {/* Status */}
      <td className="px-4 py-4 whitespace-nowrap">
        <select
          value={property.status}
          onChange={handleStatusChange}
          disabled={!canChangeStatus()}
          className={`px-2 py-1 border rounded-full text-xs font-semibold appearance-none focus:outline-none focus:ring-2 ${
            canChangeStatus() 
              ? getStatusStyles(property.status) 
              : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
          }`}
          onClick={(e) => e.stopPropagation()}
          title={!canChangeStatus() ? 'Only the creator or director can change status' : 'Change status'}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      
      {/* Type */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 truncate">
          {property.type || 'N/A'}
        </span>
      </td>
      
      {/* Price */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
        {formatPrice(property.price)}
      </td>
      
      {/* BHK */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate text-center">
        {property.bhk || 'N/A'}
      </td>
      
      {/* Size */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate text-center">
        <div className="font-medium">
          {sizeData.display}
        </div>
        {pricePerUnit > 0 && (
          <div className="text-xs text-gray-500">
            {formatPricePerUnit(pricePerUnit, sizeData.unit)}
          </div>
        )}
      </td>
      
      {/* Unit */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
        {property.unit || property.unitDetails || 'N/A'}
      </td>
      
      {/* Floor */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate text-center">
        {property.floor || 'N/A'}
      </td>
      
      {/* Owner/Broker */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
        <div className="font-medium" title={property.ownerName}>
          {property.ownerName || 'N/A'}
        </div>
        {property.ownerName && (
          <div className="text-xs text-gray-500">
            {property.referenceName ? `Ref: ${property.referenceName}` : 'Direct'}
          </div>
        )}
      </td>
      
      {/* Owner No. */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
        {property.ownerContact || property.ownerNumber || 'N/A'}
      </td>
      
      {/* Sector */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate text-center">
        {property.sector || 'N/A'}
      </td>
      
      {/* Location */}
      <td className="px-4 py-4 text-sm text-gray-900 truncate" title={property.location}>
        {property.location || 'N/A'}
      </td>
      
      {/* Created */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="text-sm text-gray-900">{formatDate(property.createdAt)}</div>
        <div className="text-xs text-gray-500">
          by {property.createdBy?.name || property.createdByName || 'Unknown'}
        </div>
      </td>

      {/* Actions */}
      <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
        <ThreeDotMenu
          item={property}
          actions={[
            ...(canUpdateProperty() ? [{ label: 'Update Property', icon: <Edit size={14} />, onClick: () => onUpdate(property) }] : []),
            { label: 'Add Remark', icon: <MessageSquare size={14} />, onClick: () => onAddRemark(property) },
            { label: 'View Remarks', icon: <Eye size={14} />, onClick: () => onViewRemarks(property) },
            // Add reminder action only for RENT_OUT status
            ...(property.status === 'RENT_OUT' ? [{ label: 'Set Reminder', icon: <Clock size={14} />, onClick: () => onShowReminderModal ? onShowReminderModal(property, null) : setShowReminderModal(true) }] : [])
          ]}
        />
      </td>

    </tr>
  );
};

export default PropertyTableRow;
