import React from 'react';
import { useNotes } from '../../../../core/hooks/useNotes';
import AddNoteForm from '../sections/notes/form/AddNoteForm';

const AddNoteFormWrapper = () => {
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const companyIdRaw = localStorage.getItem('companyId');

    let companyId = null;
    if (companyIdRaw) {
        companyId = parseInt(companyIdRaw, 10);
    } else if (user.companyId) {
        companyId = parseInt(user.companyId, 10);
    }

    const userId = user.id || user.userId;
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
        // Redirect back to notes view
        window.location.hash = '#ViewNotes';
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