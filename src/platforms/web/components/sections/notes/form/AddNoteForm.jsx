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
  const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
  const role = user.role;
  
  // Ensure userId is numeric - extract from user object or token
  let userId = user.id || user.userId;
  if (userId && typeof userId !== 'number') {
    const parsed = parseInt(userId, 10);
    if (!isNaN(parsed)) {
      userId = parsed;
    } else {
      // If still not numeric, try to get from token
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.userId && typeof payload.userId === 'number') {
            userId = payload.userId;
          } else if (payload.sub && typeof payload.sub === 'number') {
            userId = payload.sub;
          }
        }
      } catch (e) {
        console.error('❌ Could not extract userId from token:', e);
      }
    }
  }
  
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

  const { 
    users: allUsers, 
    loading, 
    loadUsers, 
    getUsersByRoleAndCompany, 
    getAdminsByCompany 
  } = useUsers(companyId, role, userId);

  useEffect(() => {
    const vis = formData.visibility;
    if (vis === 'SPECIFIC_USERS') {
      const fetchSpecificUsers = async () => {
        await getUsersByRoleAndCompany('USER');
      };
      fetchSpecificUsers();
    } else if (vis === 'SPECIFIC_ADMIN') {
      const fetchAdmins = async () => {
        await getAdminsByCompany();
      };
      fetchAdmins();
    } else {
      setAvailableUsers([]);
      setSelectedUsers([]);
    }
  }, [formData.visibility, companyId, getUsersByRoleAndCompany, getAdminsByCompany]);

  // Use the hook's users state when it changes
  useEffect(() => {
    if (allUsers.length > 0) {
      setAvailableUsers(allUsers);
    }
  }, [allUsers]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === availableUsers.length) {
      setSelectedUsers([]);
    } else {
      // Ensure we extract numeric IDs only
      const userIds = availableUsers.map(u => {
        const id = u.id || u.userId;
        return typeof id === 'number' ? id : parseInt(id, 10);
      }).filter(id => !isNaN(id));
      setSelectedUsers(userIds);
    }
  };

  const handleCheckboxChange = (id) => {
    // Ensure id is numeric
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error('❌ Invalid user ID in checkbox:', id);
      return;
    }
    
    setSelectedUsers(prev =>
      prev.includes(numericId) 
        ? prev.filter(uid => uid !== numericId) 
        : [...prev, numericId]
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
  
    // Ensure visibleUserIds is array of numbers
    const visibleUserIds = (vis === 'SPECIFIC_USERS' || vis === 'SPECIFIC_ADMIN') 
      ? selectedUsers.map(id => {
          const numId = typeof id === 'number' ? id : parseInt(id, 10);
          return isNaN(numId) ? id : numId;
        }).filter(id => !isNaN(id))
      : [];

    const noteData = {
      content: formData.content,
      priority: formData.priority,
      status: formData.status,
      type: formData.type,
      dateTime: formData.type === 'EVENT' ? `${formData.date}T${formData.time}:00` : null,
      visibility: vis,
      visibleUserIds: visibleUserIds, // Array of numbers only
    };
  
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
        <h2 className="text-2xl font-semibold text-gray-900">
          {formData.type === 'NOTE' ? '📝 Create Note' : '📅 Schedule Event'}
        </h2>
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

        {/* Date & Time - Show only for Events */}
        {formData.type === 'EVENT' && (
          <div className="p-4 bg-blue-50 border rounded-lg animate-slideDown">
            <div className="grid grid-cols-2 gap-4">
              <div className="animate-slideUp">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Time</label>
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
              Select {formData.visibility === 'SPECIFIC_USERS' ? 'Users' : 'Admin Users'}
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
                availableUsers.map((user) => {
                  const userId = user.id || user.userId;
                  const numericUserId = typeof userId === 'number' ? userId : parseInt(userId, 10);
                  const displayUserId = !isNaN(numericUserId) ? numericUserId : userId;
                  
                  return (
                    <label key={displayUserId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(numericUserId)}
                        onChange={() => handleCheckboxChange(numericUserId)}
                        disabled={isSubmitting}
                      />
                      <span>{user.name || 'Unnamed'}</span>
                    </label>
                  );
                })
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

        {/* Content - Dynamic label based on type */}
        <div className="space-y-2 animate-slideUp">
          <label className="text-sm font-medium text-gray-700">
            {formData.type === 'NOTE' ? 'Note Content' : 'Event Description'}
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder={formData.type === 'NOTE' ? 'Write your note content...' : 'Describe the event details...'}
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
          {isSubmitting 
            ? (formData.type === 'NOTE' ? 'Creating...' : 'Scheduling...') 
            : (formData.type === 'NOTE' ? 'Create Note' : 'Schedule Event')
          }
        </button>
      </div>
    </div>
  );
};

export default AddNoteForm;
