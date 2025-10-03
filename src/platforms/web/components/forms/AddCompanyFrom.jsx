import { useState } from 'react';
import { Building2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { CompanyService } from '../../../../core/services';
import { customAlert } from '../../../../core/utils/alertUtils';

const AddCompanyForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    maxUsers: '',
    maxAdmins: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createCompany = async (e) => {
    e.preventDefault();

    const companyData = {
      ...formData,
      maxUsers: parseInt(formData.maxUsers),
      maxAdmins: parseInt(formData.maxAdmins),
    };

    try {
      const result = await CompanyService.addCompany(companyData);
      
      if (result.success) {
        customAlert('✅ Company created successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          maxUsers: '',
          maxAdmins: '',
        });
        if (onSuccess) onSuccess();
      } else {
        customAlert('❌ Error: ' + result.error);
      }
    } catch (error) {
      customAlert('❌ Network error: ' + error.message);
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
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <div className="flex items-center text-white">
            <Building2 className="mr-3" size={24} />
            <h2 className="text-xl font-semibold">Add New Company</h2>
          </div>
        </div>

        <form onSubmit={createCompany} className="p-8 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Max Users</label>
            <input
              type="number"
              name="maxUsers"
              required
              min="1"
              value={formData.maxUsers}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Max Admins</label>
            <input
              type="number"
              name="maxAdmins"
              required
              min="1"
              value={formData.maxAdmins}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={onCancel || (() => onSuccess?.())}
              className="flex items-center px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >
              <ArrowLeft className="mr-2" size={18} />
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg"
            >
              Create Company
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddCompanyForm;
