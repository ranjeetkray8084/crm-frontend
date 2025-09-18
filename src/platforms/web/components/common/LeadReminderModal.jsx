import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const LeadReminderModal = ({ isOpen, onClose, onSetReminder, leadName }) => {
  const [reminderDate, setReminderDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reminderDate) {
      alert('Please select a reminder date');
      return;
    }

    // Convert to the format expected by backend (yyyy-MM-ddTHH:mm:ss)
    // Set time to 9:00 AM by default
    const formattedDateTime = reminderDate + 'T09:00:00';
    onSetReminder(formattedDateTime);
  };

  const handleClose = () => {
    setReminderDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Set Reminder for Lead
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            Set a reminder for lead: <span className="font-medium">{leadName}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            You will receive notifications on the reminder date at 9:00 AM
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Reminder Date
            </label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              <Calendar className="inline w-3 h-3 mr-1" />
              Select a future date for your reminder (notification will be sent at 9:00 AM)
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadReminderModal;
