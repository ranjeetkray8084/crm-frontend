import { useState } from 'react';
import { Edit, MessageSquare, Eye, Trash2, MoreVertical, Clock } from 'lucide-react';
import ThreeDotMenu from '../../common/ThreeDotMenu';
import ReminderDateModal from '../../common/ReminderDateModal';

const MobilePropertyList = ({ properties, onUpdate, onAddRemark, onViewRemarks, onDelete, onOutOfBox, onStatusChange, onSetReminder, currentUserId, userRole }) => {
  const [activeProperty, setActiveProperty] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Extract only numeric part from size (remove "sqft", "sq", "sqm" or other text)
  const getNumericSize = (size) => {
    if (!size) return 0;
    
    // Remove common size units: sqft, sq, sqm, square feet, etc.
    const cleanSize = size.toString()
      .replace(/\s*(sqft|sq|sqm|square\s*feet|square\s*meters?)\s*/gi, '')
      .trim();
    
    const numericPart = cleanSize.match(/\d+/);
    return numericPart ? parseInt(numericPart[0]) : 0;
  };

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
      case 'DROPPED':
        return 'bg-gray-100 text-gray-600';
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
      case 'DROPPED':
        return 'Dropped';
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

  const handleSetReminder = (reminderDate) => {
    if (onSetReminder && selectedProperty) {
      onSetReminder(selectedProperty.propertyId || selectedProperty.id, reminderDate);
    }
    
    // If there's a pending status change, apply it now
    if (pendingStatusChange && selectedProperty) {
      onStatusChange(selectedProperty.propertyId || selectedProperty.id, pendingStatusChange);
      setPendingStatusChange(null);
    }
    
    setShowReminderModal(false);
    setSelectedProperty(null);
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

    // Add reminder action only for RENT_OUT status
    if (property.status === 'RENT_OUT') {
      baseActions.push({
        label: 'Set Reminder',
        icon: <Clock size={14} />,
        onClick: (property) => { 
          setSelectedProperty(property); 
          setShowReminderModal(true); 
          setActiveProperty(null); 
        }
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
                    const numericSize = getNumericSize(property.size);
                    return numericSize > 0 ? numericSize : 'N/A';
                  })()}
                </p>
                {(() => {
                  const numericSize = getNumericSize(property.size);
                  const parsqrfrate = property.price && numericSize ? (property.price / numericSize) : 0;
                  return parsqrfrate > 0 ? (
                    <p className="text-xs text-gray-500">
                      ₹{Math.round(parsqrfrate).toLocaleString()}/sqft
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
              <select
                value={property.status}
                onChange={(e) => {
                  if (canChangeStatus(property) && onStatusChange) {
                    const newStatus = e.target.value;
                    
                    // If changing to RENT_OUT, show reminder modal first
                    if (newStatus === 'RENT_OUT') {
                      setSelectedProperty(property);
                      setShowReminderModal(true);
                      setPendingStatusChange(newStatus);
                    } else {
                      onStatusChange(property.propertyId || property.id, newStatus);
                    }
                  }
                }}
                disabled={!canChangeStatus(property)}
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border border-gray-300 bg-white ${getStatusColor(property.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                title={canChangeStatus(property) ? 'Select status' : 'Only creator or director can change status'}
              >
                <option value="AVAILABLE_FOR_SALE">For Sale</option>
                <option value="AVAILABLE_FOR_RENT">For Rent</option>
                <option value="RENT_OUT">Rented Out</option>
                <option value="SOLD_OUT">Sold Out</option>
                <option value="DROPPED">Dropped</option>
              </select>
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

      {/* Reminder Date Modal */}
      <ReminderDateModal
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setSelectedProperty(null);
          setPendingStatusChange(null);
        }}
        onSetReminder={handleSetReminder}
        propertyName={selectedProperty?.propertyName || 'Unknown Property'}
      />
    </div>
  );
};

export default MobilePropertyList;
