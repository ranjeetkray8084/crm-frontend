import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const ReminderDateModal = ({ isOpen, onClose, onSetReminder, propertyName }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    // Set default time to 9:00 AM
    const reminderDateTime = new Date(`${selectedDate}T09:00:00`);
    const now = new Date();
    
    if (reminderDateTime <= now) {
      alert('Please select a future date for the reminder.');
      return;
    }

    // Format date for API (LocalDateTime format without timezone)
    const reminderDateString = reminderDateTime.toISOString().replace('Z', '');
    onSetReminder(reminderDateString);
    onClose();
  };

  const handleClose = () => {
    setSelectedDate('');
    onClose();
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Set Reminder</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Set a reminder for property: <span className="font-medium">{propertyName}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Reminder Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Reminder will be sent at 9:00 AM on the selected date
              </p>
            </div>

            {/* Preview */}
            {selectedDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Reminder will be set for:</strong><br />
                  {new Date(`${selectedDate}T09:00:00`).toLocaleString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Set Reminder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReminderDateModal;
