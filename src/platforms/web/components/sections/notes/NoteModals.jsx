import React, { useState, useEffect } from 'react';
import AddNoteForm from './form/AddNoteForm';

// Add modal animations
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0; 
      transform: scale(0.9) translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out;
  }
`;

// Inject modal styles
if (typeof document !== 'undefined') {
  const existingModalStyle = document.getElementById('modal-animations');
  if (!existingModalStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'modal-animations';
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
  }
}

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex justify-center items-center backdrop-blur-sm animate-fadeIn">
    <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-hidden animate-scaleIn transform transition-all duration-300">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-200 z-10 hover:rotate-90 hover:scale-110"
        aria-label="Close Modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {children}
    </div>
  </div>
);

const NoteModals = ({
  isEditModalOpen,
  closeEditModal,
  selectedNote,
  updateNote,
  isAddModalOpen,
  closeAddModal,
  createNote,
  isRemarkModalOpen,
  closeRemarkModal,
  addRemarkToNote,
  isViewRemarksModalOpen,
  closeViewRemarksModal,
  remarks = []
}) => {
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [remark, setRemark] = useState('');
  
  // Add note states are now handled in AddNoteForm component

  // 🔁 Sync selectedNote to local state when changed
  useEffect(() => {
    if (selectedNote) {
      setEditContent(selectedNote.content || '');

      if (selectedNote.dateTime) {
        const date = new Date(selectedNote.dateTime);
        setEditDate(date.toISOString().split('T')[0]);
        setEditTime(date.toTimeString().slice(0, 5));
      } else {
        setEditDate('');
        setEditTime('');
      }
    }
  }, [selectedNote]);

  // User loading logic moved to AddNoteForm component

  const handleUpdate = () => {
    if (!selectedNote || !selectedNote.id) return;

    const noteData = {
      content: editContent,
      dateTime: editDate && editTime ? `${editDate}T${editTime}:00` : null
    };

    updateNote(selectedNote.id, noteData);
    closeEditModal();
  };

  const handleAddRemark = async () => {
    if (!selectedNote || !selectedNote.id || !remark.trim()) {
      alert('Please enter a remark');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.userId || user.id;

    if (!userId) {
      alert('User session not found. Please login again.');
      return;
    }

    try {
      const result = await addRemarkToNote(selectedNote.id, { remark, userId });
      if (result.success) {
        setRemark('');
        closeRemarkModal();
      }
    } catch (error) {
      console.error('Error adding remark:', error);
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      const result = await createNote(noteData);
      
      if (result && result.success) {
        closeAddModal();
        return true;
      } else {
        alert(`Failed to create note: ${result?.error || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      alert(`Error creating note: ${error.message}`);
      return false;
    }
  };

  if (isAddModalOpen) {
    return (
      <Modal onClose={closeAddModal}>
        <AddNoteForm 
          onSubmit={handleCreateNote}
          onCancel={closeAddModal}
        />
      </Modal>
    );
  }

  if (isEditModalOpen && selectedNote) {
    return (
      <Modal onClose={closeEditModal}>
        <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Update your note content"
          className="w-full p-2 border rounded mb-4"
          rows={4}
        />
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="w-1/2 p-2 border rounded"
            min={new Date().toISOString().split('T')[0]}
          />
          <input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            className="w-1/2 p-2 border rounded"
            step="60"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={handleUpdate} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Update
          </button>
          <button onClick={closeEditModal} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </Modal>
    );
  }

  if (isRemarkModalOpen && selectedNote) {
    return (
      <Modal onClose={closeRemarkModal}>
        <h2 className="text-2xl font-bold mb-4">Add Remark</h2>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Write a remark..."
          className="w-full p-2 border rounded mb-4"
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <button onClick={handleAddRemark} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Add
          </button>
          <button onClick={closeRemarkModal} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </Modal>
    );
  }

  if (isViewRemarksModalOpen && selectedNote) {
    return (
      <Modal onClose={closeViewRemarksModal}>
        <h2 className="text-2xl font-bold mb-4">Remarks</h2>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {remarks.length === 0 ? (
            <p className="text-gray-500">No remarks found for this note.</p>
          ) : (
            remarks.map((r) => (
              <div key={r.id} className="p-2 border-b">
                <p className="text-gray-800">{r.remark}</p>
                <small className="text-gray-500 block mt-1">
                  by {r.createdBy?.name || 'Unknown'} at {new Date(r.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={closeViewRemarksModal}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return null;
};

export default NoteModals;
