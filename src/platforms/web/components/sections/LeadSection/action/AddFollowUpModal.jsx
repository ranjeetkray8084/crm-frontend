import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MessageSquare } from 'lucide-react';
import { FollowUpService } from '../../../../../../core/services/followup.service';
import { customAlert } from '../../../../../../core/utils/alertUtils';

const AddFollowUpModal = ({ isOpen, onClose, onAddFollowUp, lead }) => {
  const [note, setNote] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Set default follow-up date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFollowupDate(tomorrow.toISOString().slice(0, 16));
      setNote('');
      setNextFollowup('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim() || !followupDate) {
      customAlert('⚠️ Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get companyId from sessionStorage
      const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
      const companyId = user.companyId;

      if (!companyId) {
        throw new Error('Company ID not found');
      }

      // Format data exactly as required: {"followUpDate": "2025-08-08T00:00:00", "note": "Initial contact made. Follow-up in 3 days.", "leadId": 35, "userId": 24}
      const followUpData = {
        followUpDate: followupDate.includes(':') && followupDate.split(':').length === 2 
          ? followupDate + ':00'  // Add seconds if missing
          : followupDate,
        note: note.trim(),
        leadId: parseInt(lead?.leadId || lead?.id),
        userId: parseInt(user.userId || user.id || 1)
      };


      
      const result = await FollowUpService.createFollowUp(companyId, followUpData);
      
      if (result.success) {
        // Show success alert with lead name and notification info
        const leadName = lead?.name || 'Lead';
        const followUpDate = new Date(followUpData.followUpDate);
        const formattedDate = followUpDate.toLocaleDateString('en-IN');
        const formattedTime = followUpDate.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        
        customAlert(`✅ Follow-up created successfully for ${leadName}!\n📅 Scheduled for: ${formattedDate} at ${formattedTime}\n🔔 Notification will be sent on the scheduled date.`);
        
        // Call the parent's onAddFollowUp callback if provided
        if (onAddFollowUp) {
          await onAddFollowUp(followUpData);
        }
        onClose();
      } else {
        setError(result.error);
        customAlert('❌ Failed to create follow-up: ' + result.error);
      }
    } catch (error) {
      const errorMessage = 'Failed to add follow-up. Please try again.';
      setError(errorMessage);
      customAlert('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Follow-Up</h3>
              <p className="text-sm text-gray-500">
                {lead?.name ? `for ${lead.name}` : 'for this lead'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}



        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="inline mr-2" size={16} />
              Follow-up Note *
            </label>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Enter your follow-up notes..."
                required
                disabled={loading}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  resize: 'none',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Follow-up Date & Time *
            </label>
            <input
              type="datetime-local"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ 
                color: '#000000 !important', 
                backgroundColor: '#ffffff !important',
                fontSize: '14px'
              }}
              required
              disabled={loading}
            />
          </div>



          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !note.trim() || !followupDate}
              className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                loading || !note.trim() || !followupDate
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Follow-Up'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFollowUpModal; 