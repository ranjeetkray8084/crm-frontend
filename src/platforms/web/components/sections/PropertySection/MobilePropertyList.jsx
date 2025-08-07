import { useState } from 'react';
import {
  MoreVertical, Edit, Trash2, MessageSquare, Eye,
  MapPin, Home, IndianRupee, Layers, Building, Ruler, GitBranch
} from 'lucide-react';

const MobilePropertyList = ({ properties, onDelete, onAddRemark, onViewRemarks, onUpdate }) => {
  const [activeProperty, setActiveProperty] = useState(null);

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

  const getStatusInfo = (status) => {
    switch (status) {
      case 'AVAILABLE_FOR_SALE':
        return { text: 'For Sale', color: 'bg-green-100 text-green-800' };
      case 'AVAILABLE_FOR_RENT':
        return { text: 'For Rent', color: 'bg-blue-100 text-blue-800' };
      case 'SOLD_OUT':
        return { text: 'Sold Out', color: 'bg-red-100 text-red-800' };
      case 'RENT_OUT':
        return { text: 'Rented Out', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: status || 'N/A', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="md:hidden space-y-4">
      {properties.map((property) => {
        const id = property.propertyId || property.id;
        const statusInfo = getStatusInfo(property.status);

        return (
          <div key={id} className="bg-white border border-gray-200 rounded-lg p-4 relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-lg">
                  {property.propertyName || 'Unnamed Property'}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {property.type || 'N/A'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveProperty(activeProperty === id ? null : id)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <IndianRupee size={14} className="text-gray-500" />
                <span className="font-medium">{formatPrice(property.price)}</span>
              </div>

              {property.bhk && (
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-gray-500" />
                  <span>{property.bhk} BHK</span>
                </div>
              )}

              {property.size && (
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-gray-500" />
                  <span>{property.size}</span>
                </div>
              )}

              {property.floor && (
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-gray-500" />
                  <span>Floor: {property.floor}</span>
                </div>
              )}

              {property.sector && (
                <div className="flex items-center gap-2 col-span-2">
                  <Building size={14} className="text-gray-500" />
                  <span>Sector: {property.sector}</span>
                </div>
              )}

              {property.location && (
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin size={14} className="text-gray-500" />
                  <span>{property.location}</span>
                </div>
              )}

              {property.source && (
                <div className="flex items-center gap-2 col-span-2">
                  <GitBranch size={14} className="text-gray-500" />
                  <span>Source: {property.source}</span>
                </div>
              )}

              {property.ownerName && (
                <div className="col-span-2">
                  <span className="font-medium">Owner:</span>{' '}
                  {property.ownerName} ({property.ownerContact || 'No contact'})
                </div>
              )}

              {property.unit && (
                <div className="col-span-2">
                  <span className="font-medium">Unit:</span>{' '}
                  {property.unit}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <div>
                Created {formatDate(property.createdAt)}
                {property.createdBy?.name && (
                  <span className="ml-1">by {property.createdBy.name}</span>
                )}
              </div>
            </div>

            {/* Actions Dropdown */}
            {activeProperty === id && (
              <div className="absolute right-4 top-12 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                <div className="py-1">
                  <button
                    onClick={() => { onUpdate(property); setActiveProperty(null); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Edit size={14} /> Update Property
                  </button>
                  <button
                    onClick={() => { onAddRemark(property); setActiveProperty(null); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <MessageSquare size={14} /> Add Remark
                  </button>
                  <button
                    onClick={() => { onViewRemarks(property); setActiveProperty(null); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Eye size={14} /> View Remarks
                  </button>
                  <button
                    onClick={() => { onDelete(id); setActiveProperty(null); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 size={14} /> Delete Property
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MobilePropertyList;
