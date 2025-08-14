import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, MessageCircle, User, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeactivatedUserModal = ({ isOpen, onClose, userEmail }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchUserRole();
    }
  }, [isOpen, userEmail]);

  const fetchUserRole = async () => {
    setLoading(true);
    try {
      // Try to get user role from backend
      const response = await fetch(`/api/users/role-by-email?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      } else {
        // Fallback: try to determine from localStorage or default to USER
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUserRole(userData.role || 'USER');
        } else {
          setUserRole('USER'); // Default fallback
        }
      }
    } catch (error) {
      setUserRole('USER'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = () => {
    setHasAcknowledged(true);
    onClose();
  };

  const getContactInfo = () => {
    switch (userRole) {
      case 'USER':
        return {
          title: 'Contact Admin',
          description: 'Your account has been deactivated. Please contact your Admin to reactivate your account.',
          contacts: [
            {
              type: 'SMS',
              icon: <MessageCircle className="w-5 h-5" />,
              label: 'Send SMS to Admin',
              action: () => window.open('sms:+1234567890?body=Hello Admin, my account has been deactivated. Please help me reactivate it.'),
              color: 'bg-green-500 hover:bg-green-600'
            },
            {
              type: 'Email',
              icon: <Mail className="w-5 h-5" />,
              label: 'Email Admin',
              action: () => window.open('mailto:admin@company.com?subject=Account Deactivation&body=Hello Admin, my account has been deactivated. Please help me reactivate it.'),
              color: 'bg-blue-500 hover:bg-blue-600'
            },
            {
              type: 'Call',
              icon: <Phone className="w-5 h-5" />,
              label: 'Call Admin',
              action: () => window.open('tel:+1234567890'),
              color: 'bg-purple-500 hover:bg-purple-600'
            }
          ],
          roleIcon: <User className="w-8 h-8 text-blue-500" />,
          roleColor: 'text-blue-600'
        };

      case 'ADMIN':
        return {
          title: 'Contact Director',
          description: 'Your admin account has been deactivated. Please contact your Director to reactivate your account.',
          contacts: [
            {
              type: 'SMS',
              icon: <MessageCircle className="w-5 h-5" />,
              label: 'Send SMS to Director',
              action: () => window.open('sms:+1234567891?body=Hello Director, my admin account has been deactivated. Please help me reactivate it.'),
              color: 'bg-green-500 hover:bg-green-600'
            },
            {
              type: 'Email',
              icon: <Mail className="w-5 h-5" />,
              label: 'Email Director',
              action: () => window.open('mailto:director@company.com?subject=Admin Account Deactivation&body=Hello Director, my admin account has been deactivated. Please help me reactivate it.'),
              color: 'bg-blue-500 hover:bg-blue-600'
            },
            {
              type: 'Call',
              icon: <Phone className="w-5 h-5" />,
              label: 'Call Director',
              action: () => window.open('tel:+1234567891'),
              color: 'bg-purple-500 hover:bg-purple-600'
            }
          ],
          roleIcon: <Shield className="w-8 h-8 text-orange-500" />,
          roleColor: 'text-orange-600'
        };

      case 'DIRECTOR':
        return {
          title: 'Contact Support',
          description: 'Your director account has been deactivated. Please contact our support team for assistance.',
          contacts: [
            {
              type: 'SMS',
              icon: <MessageCircle className="w-5 h-5" />,
              label: 'Send SMS to Support',
              action: () => window.open('sms:+1234567892?body=Hello Support, my director account has been deactivated. Please help me reactivate it.'),
              color: 'bg-green-500 hover:bg-green-600'
            },
            {
              type: 'Email',
              icon: <Mail className="w-5 h-5" />,
              label: 'Email Support',
              action: () => window.open('mailto:support@leadstracker.com?subject=Director Account Deactivation&body=Hello Support Team, my director account has been deactivated. Please help me reactivate it.'),
              color: 'bg-blue-500 hover:bg-blue-600'
            },
            {
              type: 'Call',
              icon: <Phone className="w-5 h-5" />,
              label: 'Call Support',
              action: () => window.open('tel:+1234567892'),
              color: 'bg-purple-500 hover:bg-purple-600'
            }
          ],
          roleIcon: <Crown className="w-8 h-8 text-red-500" />,
          roleColor: 'text-red-600'
        };

      default:
        return {
          title: 'Contact Support',
          description: 'Your account has been deactivated. Please contact support for assistance.',
          contacts: [
            {
              type: 'Email',
              icon: <Mail className="w-5 h-5" />,
              label: 'Email Support',
              action: () => window.open('mailto:support@leadstracker.com?subject=Account Deactivation&body=Hello Support Team, my account has been deactivated. Please help me reactivate it.'),
              color: 'bg-blue-500 hover:bg-blue-600'
            }
          ],
          roleIcon: <User className="w-8 h-8 text-gray-500" />,
          roleColor: 'text-gray-600'
        };
    }
  };

  
  
  if (!isOpen) return null;

  const contactInfo = getContactInfo();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={hasAcknowledged ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {contactInfo.roleIcon}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Deactivated
                  </h3>
                  <p className={`text-sm font-medium ${contactInfo.roleColor}`}>
                    Role: {userRole}
                  </p>
                </div>
              </div>
              <button
                onClick={hasAcknowledged ? onClose : undefined}
                disabled={!hasAcknowledged}
                className={`transition-colors ${
                  hasAcknowledged 
                    ? 'text-gray-400 hover:text-gray-600 cursor-pointer' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            ) : (
              <>
                {/* Warning Message */}
                {!hasAcknowledged && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 text-center font-medium">
                      ⚠️ Please read this message carefully before proceeding
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {contactInfo.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {contactInfo.description}
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">
                      <strong>Account:</strong> {userEmail}
                    </p>
                  </div>
                </div>

                {/* Contact Options */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    Contact Options:
                  </h5>
                  {contactInfo.contacts.map((contact, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={contact.action}
                      className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 ${contact.color}`}
                    >
                      {contact.icon}
                      <span>{contact.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* OK Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleAcknowledge}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    OK, I Understand
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Once your account is reactivated, you'll be able to log in normally.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default DeactivatedUserModal;