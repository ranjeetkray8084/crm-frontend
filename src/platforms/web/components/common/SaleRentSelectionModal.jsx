import React from 'react';
import { X, Home, DollarSign } from 'lucide-react';

const SaleRentSelectionModal = ({ isOpen, onClose, onSelectSale, onSelectRent, leadName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Close Lead: {leadName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            How was this lead closed? Please select the outcome:
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSelectSale}
            className="w-full flex items-center justify-center space-x-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
          >
            <DollarSign size={24} className="text-green-600 group-hover:text-green-700" />
            <div className="text-left">
              <div className="font-medium text-green-800">Sale</div>
              <div className="text-sm text-green-600">Lead was converted to a sale</div>
            </div>
          </button>

          <button
            onClick={onSelectRent}
            className="w-full flex items-center justify-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <Home size={24} className="text-blue-600 group-hover:text-blue-700" />
            <div className="text-left">
              <div className="font-medium text-blue-800">Rent</div>
              <div className="text-sm text-blue-600">Lead was converted to a rental</div>
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleRentSelectionModal;
