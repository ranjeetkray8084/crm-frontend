import React, { useState, useEffect } from 'react';
import VisibilitySelector from './VisibilitySelector';
import { useUsers } from '../../../../../../core/hooks/useUsers';

const styles = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.6s ease-out; }
.animate-slideDown { animation: slideDown 0.6s ease-out; }
.animate-slideUp { animation: slideUp 0.6s ease-out; animation-fill-mode: both; }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const AddNoteForm = ({ onSubmit, onCancel }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;
  const userId = user.userId;
  const companyId = user.companyId;

  const [formData, setFormData] = useState({
    content: '',
    date: '',
    time: '',
    priority: 'PRIORITY_C',
    status: 'NEW',
    type: 'NOTE',
    visibility: 'ONLY_ME',
  });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { users: allUsers, loading, loadUsers } = useUsers(companyId, role, userId);

  useEffect(() => {
    const vis = formData.visibility;
    if ((vis === 'SPECIFIC_USERS' || vis === 'SPECIFIC_ADMIN') && companyId && userId && role) {
      loadUsers();
    } else {
      setAvailableUsers([]);
      setSelectedUsers([]);
    }
  }, [formData.visibility, companyId, userId, role, loadUsers]);

  useEffect(() => {
    const vis = formData.visibility;
    if (vis === 'SPECIFIC_USERS') {
      setAvailableUsers(allUsers.filter(u => u.role === 'USER'));
    } else if (vis === 'SPECIFIC_ADMIN') {
      setAvailableUsers(allUsers.filter(u => u.role === 'ADMIN'));
    }
  }, [allUsers, formData.visibility]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === availableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(availableUsers.map(u => u.userId));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) return alert('Please enter note content');
    if (formData.type === 'EVENT' && (!formData.date || !formData.time)) {
      return alert('Please select both date and time');
    }
  
    const vis = formData.visibility;
    if ((vis === 'SPECIFIC_USERS' || vis === 'SPECIFIC_ADMIN') && selectedUsers.length === 0) {
      return alert('Please select at least one user/admin');
    }
  
    const noteData = {
      content: formData.content,
      priority: formData.priority,
      status: formData.status,
      type: formData.type,
      dateTime: formData.type === 'EVENT' ? `${formData.date}T${formData.time}:00` : null,
      visibility: vis,
      visibleUserIds: (vis === 'SPECIFIC_USERS' || vis === 'SPECIFIC_ADMIN') ? selectedUsers : [],
    };
  
    // ✅ ADD THESE LOGS
    console.log("🧾 Note Submit Payload:", noteData);
    console.log("👤 Selected Users:", selectedUsers);
  
    setIsSubmitting(true);
    try {
      const success = await onSubmit(noteData);
      if (success) resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const resetForm = () => {
    setFormData({
      content: '',
      date: '',
      time: '',
      priority: 'PRIORITY_C',
      status: 'NEW',
      type: 'NOTE',
      visibility: 'ONLY_ME',
    });
    setSelectedUsers([]);
    setAvailableUsers([]);
  };

  return (
    <div className="max-h-[85vh] overflow-y-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-6 animate-slideDown">
        <h2 className="text-2xl font-semibold text-gray-900">Create New Note</h2>
        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" />
      </div>

      <div className="space-y-6">
        {/* Type */}
        <div className="space-y-2 animate-slideUp">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            disabled={isSubmitting}
          >
            <option value="NOTE">📝 Note</option>
            <option value="EVENT">📅 Event</option>
          </select>
        </div>

        {/* Date & Time */}
        {formData.type === 'EVENT' && (
          <div className="p-4 bg-blue-50 border rounded-lg animate-slideDown">
            <div className="grid grid-cols-2 gap-4">
              <div className="animate-slideUp">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={isSubmitting}
                />
              </div>
              <div className="animate-slideUp">
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        {/* Visibility */}
        <VisibilitySelector
          role={role}
          value={formData.visibility}
          onChange={(val) => handleInputChange('visibility', val)}
          disabled={isSubmitting}
        />

        {/* Select Users/Admins */}
        {(formData.visibility === 'SPECIFIC_USERS' || formData.visibility === 'SPECIFIC_ADMIN') && (
          <div className="p-4 bg-gray-50 border rounded-lg">
            <label className="block text-sm font-medium mb-2">
              Select {formData.visibility === 'SPECIFIC_USERS' ? 'Users' : 'Admins'}
            </label>

            {availableUsers.length > 0 && (
              <label className="flex items-center mb-2 space-x-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === availableUsers.length}
                  onChange={toggleSelectAll}
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium text-gray-700">Select All</span>
              </label>
            )}

            <div className="max-h-32 overflow-y-auto space-y-1">
              {loading ? (
                <div className="text-gray-500 text-sm">Loading users...</div>
              ) : availableUsers.length > 0 ? (
                availableUsers.map((user) => (
                  <label key={user.userId} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.userId)}
                      onChange={() => handleCheckboxChange(user.userId)}
                      disabled={isSubmitting}
                    />
                    <span>{user.name || 'Unnamed'}</span>
                  </label>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No users found</div>
              )}
            </div>
          </div>
        )}

        {/* Priority */}
        <div className="space-y-2 animate-slideUp">
          <label className="text-sm font-medium text-gray-700">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            disabled={isSubmitting}
          >
            <option value="PRIORITY_A">Priority A</option>
            <option value="PRIORITY_B">Priority B</option>
            <option value="PRIORITY_C">Priority C</option>
          </select>
        </div>

        {/* Content */}
        <div className="space-y-2 animate-slideUp">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Write your note content..."
            className="w-full px-4 py-3 border rounded-lg resize-none"
            rows={4}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Note'}
        </button>
      </div>
    </div>
  );
};

export default AddNoteForm;
