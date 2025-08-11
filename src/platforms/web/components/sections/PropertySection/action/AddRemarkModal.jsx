import React, { useState } from 'react';

const AddRemarkModal = ({ isOpen, onClose, property, onAddRemark }) => {
    const [remark, setRemark] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // The modal now depends on the `property` object instead of just the ID.
    if (!isOpen || !property) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!remark.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // The parent now handles getting the ID, so we just pass the remark data.
            await onAddRemark({ remark: remark.trim() });

            // Reset form and close modal on success
            setRemark('');
            onClose();
        } catch (error) {
    
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRemark('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header now displays the property's name */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">
                        Add Remark for: <span className="text-blue-600">{property.propertyName || property.name}</span>
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-800 text-3xl font-light leading-none"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-2">
                            Remark *
                        </label>
                        <textarea
                            id="remark"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter your remark here..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={4}
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !remark.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Remark'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRemarkModal;