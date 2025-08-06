import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {title || "Confirm Action"}
          </h3>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-gray-600">
            {message || "Are you sure you want to proceed?"}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;