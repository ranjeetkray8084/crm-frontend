import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { PropertyService } from '../../../../../../core/services/property.service';

// A reusable input field component
const InputField = ({ label, name, value, onChange, placeholder = '', type = 'text', required = false, disabled = false, error = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : 
                error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

/**
 * A modal specifically for updating property code only
 */
const UpdatePropertyCodeModal = ({ isOpen, onClose, propertyToUpdate, onUpdate, companyId: propCompanyId }) => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset form data whenever the modal is opened with a new property
    useEffect(() => {
        if (isOpen && propertyToUpdate) {
            setFormData({
                externalPropertyId: propertyToUpdate.externalPropertyId || ''
            });
            setErrors({});
            setIsSubmitting(false);
            setIsSuccess(false);
        }
    }, [isOpen, propertyToUpdate]);

    console.log('🔍 UpdatePropertyCodeModal - isOpen:', isOpen, 'propertyToUpdate:', propertyToUpdate?.propertyName, 'isSuccess:', isSuccess);
    
    if (!isOpen || !propertyToUpdate) {
        console.log('🔍 UpdatePropertyCodeModal - Modal not open or no property, returning null');
        return null;
    }
    
    console.log('🔍 UpdatePropertyCodeModal - Modal should be visible');

    const validateForm = () => {
        const newErrors = {};
        
        // Property code is optional, so no validation needed
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Get company ID from multiple sources
            let companyId = propCompanyId || 
                           sessionStorage.getItem('companyId') || 
                           localStorage.getItem('companyId') || 
                           sessionStorage.getItem('company_id') || 
                           localStorage.getItem('company_id');
            
            // If still not found, try to get from property object
            if (!companyId && propertyToUpdate.company) {
                companyId = propertyToUpdate.company.id || propertyToUpdate.company;
            }
            
            const propertyId = propertyToUpdate.propertyId || propertyToUpdate.id;
            
            if (!companyId || !propertyId) {
                console.error('Missing company ID or property ID');
                return;
            }
            
            const externalPropertyId = formData.externalPropertyId?.trim() || '';
            
            // Call the dedicated property code update API
            console.log('🚀 Calling PropertyService.updatePropertyCode with:', { companyId, propertyId, externalPropertyId });
            const result = await PropertyService.updatePropertyCode(companyId, propertyId, externalPropertyId);
            console.log('📥 API Result:', result);
            
            if (result.success) {
                console.log('✅ API call successful, setting success state');
                console.log('📥 Success response data:', result.data);
                setIsSuccess(true);
                // Optionally refresh the property data
                if (onUpdate) {
                    onUpdate(result.data.property);
                }
            } else {
                console.log('❌ API call failed:', result.error);
                setErrors({ externalPropertyId: result.error });
            }
        } catch (error) {
            console.error('Error adding property code:', error);
            setErrors({ externalPropertyId: 'Failed to add property code' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Add Property Code</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                {isSuccess ? (
                    <div className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Property code has been successfully added for <strong>{propertyToUpdate.propertyName}</strong>
                        </p>
                        <button
                            onClick={() => {
                                console.log('🔘 OK button clicked, closing modal');
                                // Call onUpdate to refresh properties before closing
                                if (onUpdate) {
                                    onUpdate(propertyToUpdate);
                                }
                                onClose();
                            }}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            OK
                        </button>
                    </div>
                ) : (
                    <form id="updatePropertyCodeForm" onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Add property code for <strong>{propertyToUpdate.propertyName}</strong>
                                </p>
                            </div>
                            
                            <InputField 
                                label="Property Code" 
                                name="externalPropertyId" 
                                value={formData.externalPropertyId} 
                                onChange={handleChange} 
                                placeholder="e.g. P12345, MB_12345, H_12345"
                                error={errors.externalPropertyId}
                            />
                            
                            <div className="text-xs text-gray-500">
                                <p>Examples:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>P12345 (99acres format)</li>
                                    <li>MB_12345 (MagicBricks format)</li>
                                    <li>H_12345 (Housing format)</li>
                                    <li>MK_12345 (Makaan format)</li>
                                </ul>
                            </div>
                        </div>
                    </form>
                )}

                {/* Modal Footer - Only show if not in success state */}
                {!isSuccess && (
                    <div className="flex items-center justify-end p-4 border-t mt-auto">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            form="updatePropertyCodeForm" 
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                            {isSubmitting ? 'Adding...' : 'Add Code'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdatePropertyCodeModal;
