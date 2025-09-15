import { useState } from 'react';
import { Edit, MessageSquare, Eye, Trash2, MoreVertical } from 'lucide-react';
import ThreeDotMenu from '../../common/ThreeDotMenu';
import { parseSize, calculatePricePerUnit, formatPricePerUnit } from '../../../../../core/utils/sizeUtils';

const MobilePropertyList = ({ properties, onUpdate, onAddRemark, onViewRemarks, onDelete, onOutOfBox, onStatusChange, currentUserId, userRole }) => {
  const [activeProperty, setActiveProperty] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Parse size with units - this function is now available from sizeUtils
  const parsePropertySize = (size) => parseSize(size);

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE_FOR_SALE':
        return 'bg-green-100 text-green-800';
      case 'AVAILABLE_FOR_RENT':
        return 'bg-blue-100 text-blue-800';
      case 'RENT_OUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'SOLD_OUT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'AVAILABLE_FOR_SALE':
        return 'For Sale';
      case 'AVAILABLE_FOR_RENT':
        return 'For Rent';
      case 'RENT_OUT':
        return 'Rented Out';
      case 'SOLD_OUT':
        return 'Sold Out';
      default:
        return status || 'N/A';
    }
  };

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  const userData = getUserData();
  const currentUserRole = userRole || userData?.role;
  const currentUserIdFromStorage = currentUserId || userData?.userId || userData?.id;

  // Access control logic
  const canUpdateProperty = (property) => {
    // Director role can update any property
    if (currentUserRole === 'DIRECTOR') {
      return true;
    }
    
    // Only the creator can update their own property
    const propertyCreatorId = property.createdBy?.id || property.createdBy?.userId || property.createdById;
    return propertyCreatorId && propertyCreatorId.toString() === currentUserIdFromStorage?.toString();
  };

  const canChangeStatus = (property) => {
    // Director role can change status of any property
    if (currentUserRole === 'DIRECTOR') {
      return true;
    }
    
    // Only the creator can change status of their own property
    const propertyCreatorId = property.createdBy?.id || property.createdBy?.userId || property.createdById;
    return propertyCreatorId && propertyCreatorId.toString() === currentUserIdFromStorage?.toString();
  };

  const handleOutOfBox = (property) => {
    if (onOutOfBox) {
      onOutOfBox(property);
    }
    setActiveProperty(null);
  };

  const getActionsForProperty = (property) => {
    const baseActions = [
      {
        label: 'Add Remark',
        icon: <MessageSquare size={14} />,
        onClick: (property) => { onAddRemark(property); setActiveProperty(null); }
      },
      {
        label: 'View Remarks',
        icon: <Eye size={14} />,
        onClick: (property) => { onViewRemarks(property); setActiveProperty(null); }
      }
    ];

    // Only add update action if user has permission
    if (canUpdateProperty(property)) {
      baseActions.unshift({
        label: 'Update Property',
        icon: <Edit size={14} />,
        onClick: (property) => { onUpdate(property); setActiveProperty(null); }
      });
    }

    return baseActions;
  };

  return (
    <div className="md:hidden space-y-4">
      {properties.map((property) => {
        const id = property.propertyId || property.id;
        const isActive = activeProperty === id;

        return (
          <div key={id} className="bg-white rounded-lg border border-gray-200 p-4 relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {property.propertyName || property.name || 'N/A'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {property.location || property.address || 'N/A'}
                </p>
              </div>
              
              {/* Three Dot Menu */}
              <ThreeDotMenu
                item={property}
                actions={getActionsForProperty(property)}
                onOutOfBox={handleOutOfBox}
                position="right-0"
              />
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-xs text-gray-500">Type</span>
                <p className="text-sm font-medium">{property.type || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">BHK</span>
                <p className="text-sm font-medium">{property.bhk ? `${property.bhk} BHK` : 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Size</span>
                <p className="text-sm font-medium">
                  {(() => {
                    const sizeData = parsePropertySize(property.size);
                    return sizeData.display;
                  })()}
                </p>
                {(() => {
                  const sizeData = parsePropertySize(property.size);
                  const pricePerUnit = calculatePricePerUnit(property.price, sizeData);
                  return pricePerUnit > 0 ? (
                    <p className="text-xs text-gray-500">
                      {formatPricePerUnit(pricePerUnit, sizeData.unit)}
                    </p>
                  ) : null;
                })()}
              </div>
              <div>
                <span className="text-xs text-gray-500">Price</span>
                <p className="text-sm font-medium">
                  {property.price ? `₹${property.price.toLocaleString()}` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Owner/Broker</span>
                <p className="text-sm font-medium">{property.ownerName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Contact</span>
                <p className="text-sm font-medium">{property.ownerContact || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Source</span>
                <p className="text-sm font-medium">{property.source || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Unit Details</span>
                <p className="text-sm font-medium">{property.unitDetails || 'N/A'}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <span 
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  canChangeStatus(property) 
                    ? `${getStatusColor(property.status)} cursor-pointer hover:opacity-80 transition-opacity` 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (canChangeStatus(property) && onStatusChange) {
                    // Simple status cycling for mobile
                    const statusOptions = ['AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_RENT', 'RENT_OUT', 'SOLD_OUT'];
                    const currentIndex = statusOptions.indexOf(property.status);
                    const nextIndex = (currentIndex + 1) % statusOptions.length;
                    onStatusChange(property.propertyId || property.id, statusOptions[nextIndex]);
                  }
                }}
                title={canChangeStatus(property) ? 'Click to change status' : 'Only creator or director can change status'}
              >
                {getStatusLabel(property.status)}
              </span>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div className="font-medium text-gray-700">Created {formatDate(property.createdAt)}</div>
              <div className="text-xs text-gray-500">
                by {property.createdBy?.name || property.createdByName || 'Unknown'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobilePropertyList;
