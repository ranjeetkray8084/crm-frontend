import React from 'react';
import { useNotes } from '../../../../core/hooks/useNotes';
import AddNoteForm from '../sections/notes/form/AddNoteForm';

const AddNoteFormWrapper = ({ onCancel }) => {
    // Get user info from sessionStorage
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    const companyIdRaw = sessionStorage.getItem('companyId') || localStorage.getItem('companyId');

    let companyId = null;
    if (companyIdRaw) {
        companyId = parseInt(companyIdRaw, 10);
    } else if (user.companyId) {
        companyId = parseInt(user.companyId, 10);
    }

    // Ensure userId is numeric - try id first, then userId, validate it's a number
    let userId = user.id || user.userId;
    
    // If userId is not a number, try to parse it or get from token
    if (userId && typeof userId !== 'number') {
      const parsed = parseInt(userId, 10);
      if (!isNaN(parsed)) {
        userId = parsed;
      } else {
        // If still not numeric, it might be email - try to get from token
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
    
    const userRole = user.role || 'USER';

    const { createNote } = useNotes(companyId, userId, userRole);

    const handleSubmit = async (noteData) => {
        try {
            const result = await createNote(noteData);

            if (result && result.success) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    };

    const handleCancel = () => {
        // Use onCancel prop if provided, otherwise redirect back to notes view
        if (onCancel) {
            onCancel();
        } else {
            // Redirect back to notes view
            window.location.hash = '#ViewNotes';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <AddNoteForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default AddNoteFormWrapper;