import { X, Building2, Mail, Phone, Users, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ViewCompanyModal = ({ isOpen, onClose, company }) => {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-white">
            <Building2 className="mr-3" size={24} />
            <h2 className="text-xl font-semibold">Company Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Name */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{company.name}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              company.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {company.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Contact Information</h4>
            
            <div className="flex items-center space-x-3">
              <Mail className="text-gray-500" size={20} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">{company.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="text-gray-500" size={20} />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-800 font-medium">{company.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Limits Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">User Limits</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Users className="text-blue-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Max Users</p>
                  <p className="text-gray-800 font-medium">{company.maxUsers || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserCheck className="text-purple-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Max Admins</p>
                  <p className="text-gray-800 font-medium">{company.maxAdmins || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {company.id && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">System Information</h4>
              
              <div>
                <p className="text-sm text-gray-500">Company ID</p>
                <p className="text-gray-800 font-medium">{company.id}</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewCompanyModal;