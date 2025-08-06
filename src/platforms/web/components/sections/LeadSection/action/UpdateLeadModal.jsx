import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A reusable, styled input field component for a cleaner form structure.
const InputField = ({ id, label, value, onChange, ...props }) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-800">
      {label}
    </label>
    <input
      id={id}
      name={id} // The 'name' attribute is crucial for the handleChange function to work correctly.
      value={value}
      onChange={onChange}
      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
      {...props}
    />
  </div>
);

/**
 * A modal component for updating lead information.
 * @param {boolean} isOpen - Controls the visibility of the modal.
 * @param {function} onClose - Function to call when the modal should be closed.
 * @param {object|null} lead - The lead object to be edited. Can be null when the modal is closed.
 * @param {function} onUpdate - Callback function to execute with the updated form data on submission.
 */
function UpdateLeadModal({ isOpen, onClose, lead, onUpdate }) {
  // --- STATE MANAGEMENT ---
  // **FIX**: Initialize state with the `lead` object OR an empty object `{}`.
  // This is the key change to prevent `formData` from ever being null.
  const [formData, setFormData] = useState(lead || {});

  // This effect hook synchronizes the form's state with the `lead` prop.
  // It runs whenever the `lead` prop changes.
  useEffect(() => {
    // If a valid lead is passed, populate the form with its data.
    // If `lead` is null (e.g., when the modal is closed), reset the form to an empty object.
    setFormData(lead || {});
  }, [lead]);

  // --- EVENT HANDLERS ---

  // A generic handler that updates the corresponding key in `formData` when any input changes.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles the form submission event.
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default browser form submission behavior.
    onUpdate(formData); // Pass the final, updated data to the parent component.
  };
  
  // --- CONFIGURATION ---

  // Animation variants for the modal entrance and exit, powered by Framer Motion.
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 30, scale: 0.95 },
  };

  // Status options for the dropdown, making it easy to manage.
  const statusOptions = ['NEW', 'CONTACTED', 'CLOSED', 'DROPED'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={onClose} // Close the modal if the user clicks on the backdrop.
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-8 relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside it.
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Update Lead 📝</h2>
            
            {/* The form is now safe because `formData` is guaranteed to be an object. */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField id="name" label="Name" value={formData.name || ''} onChange={handleChange} placeholder="Enter full name" required />
              <InputField id="email" label="Email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="example@email.com" />
              <InputField id="phone" label="Phone" type="tel" value={formData.phone || ''} onChange={handleChange} placeholder="10-digit mobile number" required />
              
              <div>
                <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-800">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'NEW'}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <InputField id="budget" label="Budget (₹)" type="number" value={formData.budget || ''} onChange={handleChange} placeholder="e.g., 50000" step="100" />
              <InputField id="location" label="Location" value={formData.location || ''} onChange={handleChange} placeholder="e.g., Delhi, India" />
              
              <div>
                <label htmlFor="requirement" className="block mb-2 text-sm font-medium text-gray-800">Requirement</label>
                <textarea
                  id="requirement"
                  name="requirement"
                  value={formData.requirement || ''}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder="Describe the lead's requirement..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
              >
                Update Lead
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default UpdateLeadModal;
