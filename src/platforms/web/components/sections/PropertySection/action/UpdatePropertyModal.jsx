import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { parseSize } from '../../../../../../core/utils/sizeUtils';

// A reusable input field component to keep the form clean.
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

// A reusable select field component.
const SelectField = ({ label, name, value, onChange, options, required = false, error = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
        >
            <option value="">Select {label}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

/**
 * A user-friendly modal for updating property details.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {object} props.propertyToUpdate - The property object being edited.
 * @param {function} props.onUpdate - Async function to call with updated data on submit.
 * @returns {JSX.Element|null} The rendered modal component or null if not open.
 */
const UpdatePropertyModal = ({ isOpen, onClose, propertyToUpdate, onUpdate }) => {
    const [formData, setFormData] = useState({});
    const [showReference, setShowReference] = useState(false);
    const [isBroker, setIsBroker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // ✅ UPDATED: Reset form data whenever the modal is opened with a new property.
    // This ensures previous unsaved changes are discarded.
    useEffect(() => {
        if (isOpen && propertyToUpdate) {
            // Parse the size to separate value and unit
            const sizeData = parseSize(propertyToUpdate.size);
            const updatedProperty = {
                ...propertyToUpdate,
                sizeValue: sizeData.value || '',
                sizeUnit: sizeData.unit || 'sqft'
            };
            setFormData(updatedProperty);
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, propertyToUpdate]);

    // Logic to disable and clear BHK field based on property type.
    useEffect(() => {
        if (formData.type === 'Office' || formData.type === 'Retail') {
            // Only update if bhk has a value, to avoid unnecessary re-renders
            if (formData.bhk) {
                setFormData(prev => ({ ...prev, bhk: '' }));
            }
        }
    }, [formData.type, formData.bhk]);

    // Toggle reference/broker UI based on source
    useEffect(() => {
        const source = formData.source;
        setShowReference(source === 'Reference');
        setIsBroker(source === 'Broker');
    }, [formData.source]);

    if (!isOpen || !propertyToUpdate) {
        return null;
    }

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.propertyName?.trim()) {
            newErrors.propertyName = 'Property name is required';
        }
        
        if (!formData.type) {
            newErrors.type = 'Property type is required';
        }
        
        if (!formData.status) {
            newErrors.status = 'Status is required';
        }
        
        if (!formData.sector?.trim()) {
            newErrors.sector = 'Sector is required';
        }
        
        if (formData.price && isNaN(Number(formData.price))) {
            newErrors.price = 'Price must be a valid number';
        }
        
        if (formData.sizeValue && isNaN(Number(formData.sizeValue))) {
            newErrors.sizeValue = 'Size must be a valid number';
        }
        
        if (formData.ownerContact && !/^[\d\s\-\+\(\)]+$/.test(formData.ownerContact)) {
            newErrors.ownerContact = 'Contact must contain only numbers, spaces, and common phone characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Debug logging for size-related changes
        if (name === 'sizeValue' || name === 'sizeUnit') {
            console.log(`🔧 Size field changed: ${name} = ${value}`);
        }
        
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Debug log the updated form data for size fields
            if (name === 'sizeValue' || name === 'sizeUnit') {
                console.log('📝 Updated formData size fields:', {
                    sizeValue: updated.sizeValue,
                    sizeUnit: updated.sizeUnit,
                    combinedSize: updated.sizeValue ? `${updated.sizeValue} ${updated.sizeUnit || 'sqft'}` : ''
                });
            }
            
            return updated;
        });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Clear size-related errors when either size field changes
        if (name === 'sizeValue' || name === 'sizeUnit') {
            setErrors(prev => ({ ...prev, sizeValue: '', size: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Prepare the data in the exact format required
            const updateData = {
                propertyName: formData.propertyName?.trim(),
                type: formData.type,
                bhk: formData.bhk?.trim() || '',
                unitDetails: formData.unitDetails?.trim() || '',
                floor: formData.floor?.trim() || '',
                size: formData.sizeValue ? `${formData.sizeValue} ${formData.sizeUnit || 'sqft'}` : '',
                location: formData.location?.trim() || '',
                ownerContact: formData.ownerContact?.trim() || '',
                ownerName: formData.ownerName?.trim() || '',
                price: formData.price ? Number(formData.price) : null,
                sector: formData.sector?.trim(),
                status: formData.status,
                source: formData.source || '',
                referenceName: formData.source === 'Reference' ? (formData.referenceName?.trim() || '') : ''
            };
            
            // Debug logging for the data being sent
            console.log('🚀 Submitting property update with data:', updateData);
            console.log('📏 Size data details:', {
                originalSize: propertyToUpdate?.size,
                sizeValue: formData.sizeValue,
                sizeUnit: formData.sizeUnit,
                finalSize: updateData.size
            });
            
            await onUpdate(updateData);
            onClose(); // Close modal after successful update
        } catch (error) {
            console.error('Error updating property:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const typeOptions = [
        { value: 'Office', label: 'Office' },
        { value: 'Retail', label: 'Retail' },
        { value: 'Residential', label: 'Residential' },
        { value: 'Plot', label: 'Plot' }
    ];

    const statusOptions = [
        { value: 'AVAILABLE_FOR_SALE', label: 'Available for Sale' },
        { value: 'AVAILABLE_FOR_RENT', label: 'Available for Rent' },
        { value: 'RENT_OUT', label: 'Rent Out' },
        { value: 'SOLD_OUT', label: 'Sold Out' },
        { value: 'DROPPED', label: 'Dropped' }
    ];

    const sourceOptions = [
        { value: 'Social Media', label: 'Social Media' },
        { value: 'Cold Call', label: 'Cold Call' },
        { value: 'Project Call', label: 'Project Call' },
        { value: 'Reference', label: 'Reference' },
        { value: 'Broker', label: 'Broker' }
    ];

    const isBhkDisabled = formData.type === 'Office' || formData.type === 'Retail';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Update Property</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body with Form */}
                <form id="updatePropertyForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                            label="Property Name" 
                            name="propertyName" 
                            value={formData.propertyName} 
                            onChange={handleChange} 
                            required 
                            error={errors.propertyName}
                        />
                        <SelectField 
                            label="Type" 
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange} 
                            options={typeOptions} 
                            required 
                            error={errors.type}
                        />
                        <InputField 
                            label="BHK" 
                            name="bhk" 
                            value={formData.bhk} 
                            onChange={handleChange} 
                            placeholder="e.g., 2BHK" 
                            disabled={isBhkDisabled} 
                        />
                        <InputField 
                            label="Unit Details" 
                            name="unitDetails" 
                            value={formData.unitDetails} 
                            onChange={handleChange} 
                        />
                        <InputField 
                            label="Floor" 
                            name="floor" 
                            value={formData.floor} 
                            onChange={handleChange} 
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <InputField 
                                    label="Size" 
                                    name="sizeValue" 
                                    value={formData.sizeValue} 
                                    onChange={handleChange} 
                                    type="number" 
                                    error={errors.sizeValue}
                                />
                            </div>
                            <div className="w-full sm:w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit
                                </label>
                                <select
                                    name="sizeUnit"
                                    value={formData.sizeUnit || 'sqft'}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                                >
                                    <option value="sqft">sqft</option>
                                    <option value="sqyd">sqyd</option>
                                </select>
                            </div>
                        </div>
                        <InputField 
                            label={isBroker ? 'Broker Name' : 'Owner Name'} 
                            name="ownerName" 
                            value={formData.ownerName} 
                            onChange={handleChange} 
                        />
                        <InputField 
                            label={isBroker ? 'Broker Contact' : 'Owner Contact'} 
                            name="ownerContact" 
                            value={formData.ownerContact} 
                            onChange={handleChange} 
                            error={errors.ownerContact}
                        />
                        <InputField 
                            label="Location" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange} 
                        />
                        <InputField 
                            label="Total Price" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleChange} 
                            type="text" 
                            error={errors.price}
                        />
                        <SelectField 
                            label="Status" 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange} 
                            options={statusOptions} 
                            required 
                            error={errors.status}
                        />
                        <InputField 
                            label="Sector" 
                            name="sector" 
                            value={formData.sector} 
                            onChange={handleChange} 
                            required 
                            error={errors.sector}
                        />
                        <SelectField 
                            label="Source" 
                            name="source" 
                            value={formData.source} 
                            onChange={handleChange} 
                            options={sourceOptions} 
                        />
                        {showReference && (
                            <InputField 
                                label="Reference Name" 
                                name="referenceName" 
                                value={formData.referenceName} 
                                onChange={handleChange} 
                            />
                        )}
                    </div>
                </form>

                {/* Modal Footer */}
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
                        form="updatePropertyForm" 
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                        {isSubmitting ? 'Updating...' : 'Update Property'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdatePropertyModal;
