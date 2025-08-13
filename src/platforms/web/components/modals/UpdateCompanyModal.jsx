import { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { CompanyService } from '../../../../core/services';
import { customAlert } from '../../../../core/utils/alertUtils';

const UpdateCompanyModal = ({ isOpen, onClose, company, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    maxUsers: '',
    maxAdmins: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        maxUsers: company.maxUsers || '',
        maxAdmins: company.maxAdmins || '',
      });
    }
  }, [company]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const companyData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        maxUsers: parseInt(formData.maxUsers),
        maxAdmins: parseInt(formData.maxAdmins),
      };

      const result = await CompanyService.updateCompany(company.id, companyData);
      
      if (result.success) {
        customAlert('✅ Company updated successfully!');
        if (onUpdate) {
          onUpdate();
        }
        onClose();
      } else {
        customAlert('❌ Failed to update company: ' + result.error);
      }
    } catch (error) {
      customAlert('❌ Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-white">
            <Building2 className="mr-3" size={24} />
            <h2 className="text-xl font-semibold">Update Company</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Company Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Max Users</label>
            <input
              type="number"
              name="maxUsers"
              required
              min="1"
              value={formData.maxUsers}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter maximum users"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Max Admins</label>
            <input
              type="number"
              name="maxAdmins"
              required
              min="1"
              value={formData.maxAdmins}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter maximum admins"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  Update Company
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateCompanyModal;