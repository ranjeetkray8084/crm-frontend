import { useState } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
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
    requirements: [],
    customRequirement: '',
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
      setShowReferenceField(value === 'Reference');
    }
  };

  const handleCheckboxChange = (value) => {
    setFormData(prev => {
      const alreadyChecked = prev.requirements.includes(value);
      const updated = alreadyChecked
        ? prev.requirements.filter(v => v !== value)
        : [...prev.requirements, value];
      return { ...prev, requirements: updated };
    });
  };

  const getFinalRequirement = () => {
    const final = [...formData.requirements];
    if (formData.customRequirement.trim()) {
      final.push(formData.customRequirement.trim());
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
        referenceName: formData.source === 'Reference' ? formData.referenceName.trim() : null,
        status: formData.status,
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
          status: '',
          budget: '',
          location: '',
          requirements: [],
          customRequirement: '',
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
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
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
                <option value="Reference">Reference</option>
              </select>
            </div>

            {showReferenceField && (
              <InputField name="referenceName" label="Reference Name *" value={formData.referenceName} onChange={handleInputChange} required />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required>
                <option value="">Select Status</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CLOSED">Dropped</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Requirement</label>
            <div className="flex flex-wrap gap-4">
              {['Commercial', 'Residential', 'Rent', 'Lease', 'Purchase', 'Plot'].map(option => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requirements.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                    className="accent-green-500"
                  />
                  {option}
                </label>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type custom requirement"
              value={formData.customRequirement}
              onChange={(e) => setFormData(prev => ({ ...prev, customRequirement: e.target.value }))}
              className="mt-3 w-full px-4 py-2 border rounded-lg"
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
    </motion.div>
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
