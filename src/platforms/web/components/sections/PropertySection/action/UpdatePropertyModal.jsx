import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// A reusable input field component to keep the form clean.
const InputField = ({ label, name, value, onChange, placeholder = '', type = 'text', required = false, disabled = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
        />
    </div>
);

// A reusable select field component.
const SelectField = ({ label, name, value, onChange, options, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
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

    // ✅ UPDATED: Reset form data whenever the modal is opened with a new property.
    // This ensures previous unsaved changes are discarded.
    useEffect(() => {
        if (isOpen && propertyToUpdate) {
            setFormData(propertyToUpdate);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare the data in the exact format required
        const updateData = {
            propertyName: formData.propertyName,
            type: formData.type,
            bhk: formData.bhk,
            unitDetails: formData.unitDetails,
            floor: formData.floor,
            size: formData.size ? parseInt(formData.size) : null,
            location: formData.location,
            ownerContact: formData.ownerContact,
            ownerName: formData.ownerName,
            price: formData.price,
            sector: formData.sector,
            status: formData.status,
            source: formData.source,
            referenceName: formData.source === 'Reference' ? (formData.referenceName || '') : ''
        };
        
        await onUpdate(updateData);
        onClose(); // Close modal after successful update
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
        { value: 'SOLD_OUT', label: 'Sold Out' }
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
                        <InputField label="Property Name" name="propertyName" value={formData.propertyName} onChange={handleChange} required />
                        <SelectField label="Type" name="type" value={formData.type} onChange={handleChange} options={typeOptions} required />
                        <InputField label="BHK" name="bhk" value={formData.bhk} onChange={handleChange} placeholder="e.g., 2BHK" disabled={isBhkDisabled} />
                        <InputField label="Unit Details" name="unitDetails" value={formData.unitDetails} onChange={handleChange} />
                        <InputField label="Floor" name="floor" value={formData.floor} onChange={handleChange} />
                        <InputField label="Size (sqft)" name="size" value={formData.size} onChange={handleChange} type="text" />
                        <InputField label={isBroker ? 'Broker Name' : 'Owner Name'} name="ownerName" value={formData.ownerName} onChange={handleChange} />
                        <InputField label={isBroker ? 'Broker Contact' : 'Owner Contact'} name="ownerContact" value={formData.ownerContact} onChange={handleChange} />
                        <InputField label="Location" name="location" value={formData.location} onChange={handleChange} />
                        <InputField label="Price" name="price" value={formData.price} onChange={handleChange} type="text" />
                        <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} required />
                        <InputField label="Sector" name="sector" value={formData.sector} onChange={handleChange} required />
                        <SelectField label="Source" name="source" value={formData.source} onChange={handleChange} options={sourceOptions} />
                        {showReference && (
                            <InputField label="Reference Name" name="referenceName" value={formData.referenceName} onChange={handleChange} />
                        )}
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="flex items-center justify-end p-4 border-t mt-auto">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2">
                        Cancel
                    </button>
                    <button type="submit" form="updatePropertyForm" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Update Property
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdatePropertyModal;
