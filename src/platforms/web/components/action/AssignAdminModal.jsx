import React, { useState } from "react";
import { useAdmins } from '../../../../core/hooks';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { customAlert } from '../../../../core/utils/alertUtils';

const AssignAdminModal = ({ user, userId, onClose, onAssigned }) => {
  // Support both user object and userId prop
  const actualUserId = userId || user?.userId;
  const { user: currentUser } = useAuth();
  const { admins, loading, assignAdmin } = useAdmins(currentUser?.companyId, currentUser?.role, currentUser?.userId || currentUser?.id);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAssign = async () => {
    if (!selectedAdminId) {
      customAlert("⚠️ Please select an admin.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await assignAdmin(actualUserId, selectedAdminId);
      if (result.success) {
        customAlert('✅ Admin assigned successfully');
        onAssigned?.(); // Notify parent to reload
        onClose?.();    // Close modal
      } else {
        customAlert('❌ Failed to assign admin');
      }
    } catch (error) {
      customAlert('❌ Failed to assign admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md text-black relative shadow-lg">
        <button
          className="absolute top-2 right-3 text-gray-700 hover:text-red-600 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-4">Assign Admin</h3>

        <label className="block mb-2">Select Admin:</label>
        {loading ? (
          <div className="w-full border p-2 rounded mb-4 text-gray-500">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="w-full border p-2 rounded mb-4 text-red-500">No admins found. Please check if there are any admin users in your company.</div>
        ) : (
          <select
            className="w-full border p-2 rounded mb-4"
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
          >
            <option value="">-- Select Admin --</option>
            {admins.map((admin) => (
              <option key={admin.userId} value={admin.userId}>
                {admin.name} ({admin.email})
              </option>
            ))}
          </select>
        )}

        <button
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded w-full"
          onClick={handleAssign}
          disabled={submitting || !selectedAdminId}
        >
          {submitting ? 'Assigning...' : 'Assign'}
        </button>
      </div>
    </div>
  );
};

export default AssignAdminModal;
