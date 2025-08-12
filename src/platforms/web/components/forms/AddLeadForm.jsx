import { useState } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useLeads } from '../../../../core/hooks/useLeads';
import { customAlert } from '../../../../core/utils/alertUtils';

const AddLeadForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'INSTAGRAM',
    referenceName: '',
    status: '',
    budget: '',
    location: '',
    propertyType: '', // New field for Commercial/Residential
    transactionType: [], // New field for Purchase/Lease/Rent
    additionalRequirements: '', // Simple text input for additional requirements
  });

  const [loading, setLoading] = useState(false);
  const [showReferenceField, setShowReferenceField] = useState(false);

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const companyId = parseInt(localStorage.getItem('companyId'), 10);
  const userId = user.userId || user.id;
  const userRole = user.role;

  // Use the useLeads hook
  const { createLead } = useLeads(companyId, userId, userRole);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'source') {
      setShowReferenceField(value === 'REFERENCE');
    }
    
    // Reset transaction type when property type changes
    if (name === 'propertyType') {
      setFormData(prev => ({ ...prev, transactionType: [] }));
    }
  };

  const handleTransactionTypeChange = (value) => {
    setFormData(prev => {
      const alreadyChecked = prev.transactionType.includes(value);
      const updated = alreadyChecked
        ? prev.transactionType.filter(v => v !== value)
        : [...prev.transactionType, value];
      return { ...prev, transactionType: updated };
    });
  };

  const getFinalRequirement = () => {
    const final = [];
    
    // Add property type and transaction type to requirements
    if (formData.propertyType) {
      final.push(formData.propertyType);
    }
    if (formData.transactionType.length > 0) {
      final.push(...formData.transactionType);
    }
    if (formData.additionalRequirements) {
      final.push(formData.additionalRequirements);
    }
    
    return final.join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const leadData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        source: formData.source,
        referenceName: formData.source === 'REFERENCE' ? formData.referenceName.trim() : null,
        status: 'NEW', // Always set to NEW for new leads
        budget: formData.budget.trim() || null,
        location: formData.location.trim() || null,
        requirement: getFinalRequirement(),
        createdBy: { userId },
      };

      const result = await createLead(leadData);

      if (result.success) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          source: 'INSTAGRAM',
          referenceName: '',
          budget: '',
          location: '',
          propertyType: '',
          transactionType: [],
          additionalRequirements: '',
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      customAlert('❌ Error saving lead: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div className="flex items-center text-white">
            <UserPlus className="mr-3" size={24} />
            <h2 className="text-xl font-semibold">Add New Lead</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField name="name" label="Full Name *" value={formData.name} onChange={handleInputChange} required />
            <InputField name="email" label="Email" type="email" value={formData.email} onChange={handleInputChange} />
            <InputField name="phone" label="Phone *" type="tel" value={formData.phone} onChange={handleInputChange} required pattern="^[+]?[0-9]{10,15}$" />
            <InputField name="budget" label="Budget (₹)" value={formData.budget} onChange={handleInputChange} />
            <InputField name="location" label="Location" value={formData.location} onChange={handleInputChange} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source *</label>
              <select name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required>
                <option value="INSTAGRAM">Instagram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="REFERENCE">Reference</option>
                <option value="NINETY_NINE_ACRES">99acres</option>
                <option value="MAGIC_BRICKS">MagicBricks</option>
              </select>
            </div>

            {showReferenceField && (
              <InputField name="referenceName" label="Reference Name *" value={formData.referenceName} onChange={handleInputChange} required />
            )}


          </div>

          {/* Property Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="propertyType"
                  value="Commercial"
                  checked={formData.propertyType === 'Commercial'}
                  onChange={handleInputChange}
                  className="accent-green-500"
                  required
                />
                Commercial
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="propertyType"
                  value="Residential"
                  checked={formData.propertyType === 'Residential'}
                  onChange={handleInputChange}
                  className="accent-green-500"
                  required
                />
                Residential
              </label>
            </div>
          </div>

          {/* Transaction Type Selection - Show based on Property Type */}
          {formData.propertyType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
              <div className="flex gap-4">
                {formData.propertyType === 'Commercial' ? (
                  // Commercial options: Purchase, Lease
                  <>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.transactionType.includes('Purchase')}
                        onChange={() => handleTransactionTypeChange('Purchase')}
                        className="accent-green-500"
                      />
                      Purchase
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.transactionType.includes('Lease')}
                        onChange={() => handleTransactionTypeChange('Lease')}
                        className="accent-green-500"
                      />
                      Lease
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.transactionType.includes('Plot')}
                        onChange={() => handleTransactionTypeChange('Plot')}
                        className="accent-green-500"
                      />
                      Plot
                    </label>
                  </>
                ) : formData.propertyType === 'Residential' ? (
                  // Residential options: Rent, Purchase
                  <>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.transactionType.includes('Rent')}
                        onChange={() => handleTransactionTypeChange('Rent')}
                        className="accent-green-500"
                      />
                      Rent
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.transactionType.includes('Purchase')}
                        onChange={() => handleTransactionTypeChange('Purchase')}
                        className="accent-green-500"
                      />
                      Purchase
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.transactionType.includes('Plot')}
                        onChange={() => handleTransactionTypeChange('Plot')}
                        className="accent-green-500"
                      />
                      Plot
                    </label>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Additional Requirements - Simple Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requirements</label>
            <input
              type="text"
              placeholder="Type any additional requirements..."
              value={formData.additionalRequirements || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalRequirements: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => onSuccess?.()} className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
              <ArrowLeft className="mr-2" size={18} />
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg">
              <UserPlus className="mr-2" size={18} />
              {loading ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ name, label, value, onChange, type = 'text', required = false, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      {...rest}
    />
  </div>
);

export default AddLeadForm;
