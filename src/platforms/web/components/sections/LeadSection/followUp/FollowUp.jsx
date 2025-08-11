import React, { useState, useEffect } from 'react';
import { useFollowUp } from '../../../../../core/hooks/useFollowUp';

const FollowUp = ({ leadId, userId }) => {
  const [note, setNote] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  
  // Use the useFollowUp hook
  const {
    followUps,
    loading,
    error,
    createFollowUp,
    loadFollowUps,
    clearError
  } = useFollowUp();

  // Load follow-ups for this specific lead
  const loadLeadFollowUps = async () => {
    if (leadId) {
      // Filter follow-ups for this specific lead
      await loadFollowUps();
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();

    const followUpData = {
      note,
      followupDate,
      nextFollowup,
      lead: { id: leadId },
      user: { id: userId }
    };

    try {
      const result = await createFollowUp(followUpData);
      if (result.success) {
        setNote('');
        setFollowupDate('');
        setNextFollowup('');
        // Refresh follow-ups for this lead
        await loadLeadFollowUps();
      } else {
        // Handle error silently
      }
    } catch (error) {
      // Handle error silently
    }
  };

  useEffect(() => {
    if (leadId) {
      loadLeadFollowUps();
    }
  }, [leadId]);

  // Filter follow-ups for this specific lead
  const leadFollowUps = followUps.filter(fu => fu.lead?.id === leadId);

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Follow-Ups</h2>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-600 rounded text-sm">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleAddFollowUp} className="space-y-4">
        <textarea
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          rows={3}
          placeholder="Enter note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Follow-up Date</label>
            <input
              type="datetime-local"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Next Follow-up</label>
            <input
              type="datetime-local"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              value={nextFollowup}
              onChange={(e) => setNextFollowup(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white font-medium ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Adding...' : 'Add Follow-Up'}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Previous Follow-Ups</h3>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading follow-ups...</p>
          </div>
        ) : leadFollowUps.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p>No follow-ups found for this lead.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {leadFollowUps.map((fu) => (
              <li key={fu.followupId || fu.id} className="p-3 bg-gray-800 rounded border border-gray-700">
                <p className="text-sm">{fu.note}</p>
                <div className="text-xs text-gray-400 mt-1">
                  <div>Follow-up: {new Date(fu.followupDate).toLocaleString()}</div>
                  {fu.nextFollowup && (
                    <div>Next: {new Date(fu.nextFollowup).toLocaleString()}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FollowUp;
