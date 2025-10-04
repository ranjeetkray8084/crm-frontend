import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Trash2 } from 'lucide-react';
import { FollowUpService } from '../../../../../../core/services/followup.service';

const ViewFollowUpsModal = ({ isOpen, onClose, lead, companyId }) => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const hasLoadedRef = useRef(false);
  const currentLeadIdRef = useRef(null);

  // Get companyId from sessionStorage if not provided
  const getCurrentCompanyId = () => {
    if (companyId) return companyId;
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    return user.companyId;
  };

  // Load follow-ups
  const loadFollowUps = async () => {
    const currentCompanyId = getCurrentCompanyId();
    if (!currentCompanyId) {
      setError('Company ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await FollowUpService.getAllFollowUps(currentCompanyId);
      if (result.success) {
        setFollowUps(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const leadId = lead?.leadId || lead?.id;
    
    if (isOpen && lead && (!hasLoadedRef.current || currentLeadIdRef.current !== leadId)) {
      hasLoadedRef.current = true;
      currentLeadIdRef.current = leadId;
      loadFollowUps();
    }
    
    if (!isOpen) {
      hasLoadedRef.current = false;
      currentLeadIdRef.current = null;
      setError(null);
    }
  }, [isOpen, lead?.leadId || lead?.id]);







  const handleDeleteFollowUp = async (followUpId) => {
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      const currentCompanyId = getCurrentCompanyId();
      if (!currentCompanyId) {
        setError('Company ID is required');
        return;
      }

      setLoading(true);
      try {
        const result = await FollowUpService.deleteFollowUp(currentCompanyId, followUpId);
        if (result.success) {
          await loadFollowUps(); // Reload follow-ups
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError('Failed to delete follow-up');
      } finally {
        setLoading(false);
      }
    }
  };

  const clearError = () => {
    setError(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
  };

  // Filter follow-ups for this specific lead
  const leadFollowUps = followUps.filter(fu => {
    const fuLeadId = fu.lead?.leadId;
    const currentLeadId = lead?.leadId || lead?.id;
    return fuLeadId === currentLeadId;
  }).sort((a, b) => new Date(b.followupDate || 0) - new Date(a.followupDate || 0));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Follow-ups</h3>
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
              onClick={clearError}
              className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {/* Follow-ups List */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Follow-up History ({leadFollowUps.length})
            </h4>

            {loading && leadFollowUps.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading follow-ups...</p>
              </div>
            ) : leadFollowUps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium">No follow-ups found</p>
                <p className="text-sm">Add your first follow-up to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leadFollowUps.map((followUp) => (
                  <div key={followUp.followupId} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(followUp.followupDate)}
                          </span>
                        </div>
                        
                        <p className="text-gray-900 mb-2">{followUp.note}</p>
                        
                        {followUp.nextFollowup && (
                          <div className="text-sm text-gray-600">
                            <Clock size={14} className="inline mr-1" />
                            Next: {formatDateTime(followUp.nextFollowup)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleDeleteFollowUp(followUp.followupId)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete follow-up"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFollowUpsModal;