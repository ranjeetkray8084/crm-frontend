import React, { useState, useEffect } from 'react';

// --- LeadRemarksModal Component ---
// A modal to display the remarks for a specific lead.
const LeadRemarksModal = ({ isOpen, onClose, lead, onGetRemarks }) => {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get leadId from the lead object
  const leadId = lead?.id || lead?.leadId;

  // Fetch remarks when modal opens
  useEffect(() => {
    if (isOpen && leadId && onGetRemarks) {
      fetchRemarks();
    }
  }, [isOpen, leadId]);

  const fetchRemarks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await onGetRemarks(leadId);
      if (result.success) {
        setRemarks(result.data || []);
      } else {
        setError(result.error || 'Failed to load remarks');
      }
    } catch (err) {
      setError('Failed to load remarks');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lead) {
    return null;
  }

  const sortedRemarks = [...remarks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            Remarks for: <span className="text-blue-600">{lead.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-3xl font-light leading-none" aria-label="Close modal">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Loading remarks...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchRemarks}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : sortedRemarks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No remarks found for this lead.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-700 border-b">Remark</th>
                  <th className="p-3 text-left font-semibold text-gray-700 border-b whitespace-nowrap">Date & Time</th>
                  <th className="p-3 text-left font-semibold text-gray-700 border-b whitespace-nowrap">Created By</th>
                </tr>
              </thead>
              <tbody>
                {sortedRemarks.map((remark, index) => {
                  const createdDateTime = remark.createdAt ? new Date(remark.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';
                  const createdBy = remark.createdBy?.name || 'Unknown';
                  return (
                    <tr key={remark.id || index} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-700" style={{ wordBreak: 'break-word' }}>{remark.remark}</td>
                      <td className="p-3 text-gray-600 whitespace-nowrap">{createdDateTime}</td>
                      <td className="p-3 text-gray-600 whitespace-nowrap">{createdBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t text-right bg-gray-50">
            <button onClick={onClose} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">Close</button>
        </div>
      </div>
    </div>
  );
};

export default LeadRemarksModal;