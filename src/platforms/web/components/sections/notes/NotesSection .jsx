import React, { useState, useEffect } from 'react';
import { useNotes } from '../../../../../core/hooks/useNotes';
import NoteTable from './NoteTable';
import NoteCardList from './NoteCardList';
import NoteModals from './NoteModals';
import { NoteTableSkeleton, NoteCardListSkeleton, FilterSkeleton } from './NoteSkeleton';



const NotesSection = () => {
  const [userInfo, setUserInfo] = useState({
    companyId: null,
    userId: null,
    role: null,
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const companyIdRaw = localStorage.getItem('companyId');
    const companyIdAlt = localStorage.getItem('company_id');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    let companyId = null;
    if (companyIdRaw) {
      companyId = parseInt(companyIdRaw, 10);
    } else if (user.companyId) {
      companyId = parseInt(user.companyId, 10);
    } else if (companyIdAlt) {
      companyId = parseInt(companyIdAlt, 10);
    }

    const userId = user.id || user.userId;
    const userRole = user.role || 'USER';

    setUserInfo({ companyId, userId, role: userRole });
  }, []);

  const {
    notes,
    loading,
    error,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    updateNoteStatus,
    updateNotePriority,
    addRemarkToNote,
    getNoteById,
    getRemarksByNoteId,
  } = useNotes(userInfo.companyId, userInfo.userId, userInfo.role);

  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isViewRemarksModalOpen, setIsViewRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState([]);





  const handleEdit = async (noteId) => {
    const { success, data } = await getNoteById(noteId);
    if (success) {
      setSelectedNote(data);
      setIsEditModalOpen(true);
    }
  };

  const handleAddNote = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('No authentication token found. Please login again.');
      return;
    }

    if (!userInfo.companyId || !userInfo.userId) {
      alert('Missing user session data. Please login again.');
      return;
    }

    setSelectedNote(null);
    setIsAddModalOpen(true);
  };

  const handleAddRemark = (noteId) => {
    setSelectedNote({ id: noteId });
    setIsRemarkModalOpen(true);
  };

  const handleViewRemarks = async (noteId) => {
    const { success, data } = await getRemarksByNoteId(noteId);
    if (success) {
      setRemarks(data); // Backend returns remarks array directly
      setSelectedNote({ id: noteId }); // Set selected note for modal
      setIsViewRemarksModalOpen(true);
    }
  };

  // Filter and search logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' ||
      (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (note.typeStr && note.typeStr.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' || note.status === statusFilter;
    const matchesPriority = priorityFilter === '' || note.priority === priorityFilter;
    const matchesType = typeFilter === '' || note.typeStr === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Get unique types for filter dropdown
  const uniqueTypes = [...new Set(notes.map(note => note.typeStr).filter(Boolean))];

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-4">
      <div className="bg-white p-4 md:p-6 rounded-xl border shadow-sm w-full max-w-[1200px] h-fit">
        <h2 className="text-center text-xl p-2 font-bold text-gray-800">Notes Management</h2>

        {/* Toolbar Section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleAddNote}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Note
            </button>
            <button
              onClick={loadNotes}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Refreshing...
                </div>
              ) : (
                'Refresh'
              )}
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <input
                type="text"
                placeholder="Search by content or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="NEW">New</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="PRIORITY_A">Priority A</option>
                <option value="PRIORITY_B">Priority B</option>
                <option value="PRIORITY_C">Priority C</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {filteredNotes.length} of {notes.length} notes
            </div>
            {(searchTerm || statusFilter || priorityFilter || typeFilter) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <>
            <div className="hidden md:block">
              <NoteTableSkeleton />
            </div>
            <div className="block md:hidden">
              <NoteCardListSkeleton />
            </div>
          </>
        )}

        {error && (
          <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredNotes.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            <div className="text-lg font-medium">No notes found</div>
            <div className="text-sm mt-1">
              {notes.length === 0 ? 'Create your first note to get started' : 'Try adjusting your filters'}
            </div>
          </div>
        )}

        {/* Notes Display */}
        {!loading && !error && filteredNotes.length > 0 && (
          <>
            <NoteTable
              notes={filteredNotes}
              onEdit={handleEdit}
              onDelete={deleteNote}
              onUpdateStatus={updateNoteStatus}
              onUpdatePriority={updateNotePriority}
              onAddRemark={handleAddRemark}
              onViewRemarks={handleViewRemarks}
            />
            <div className="block md:hidden">
              <NoteCardList
                notes={filteredNotes}
                onEdit={handleEdit}
                onDelete={deleteNote}
                onUpdateStatus={updateNoteStatus}
                onUpdatePriority={updateNotePriority}
                onAddRemark={handleAddRemark}
                onViewRemarks={handleViewRemarks}
              />
            </div>
          </>
        )}

      </div>

      {/* Modals */}
      <NoteModals
        isEditModalOpen={isEditModalOpen}
        closeEditModal={() => setIsEditModalOpen(false)}
        selectedNote={selectedNote}
        updateNote={updateNote}
        isAddModalOpen={isAddModalOpen}
        closeAddModal={() => setIsAddModalOpen(false)}
        createNote={createNote}
        isRemarkModalOpen={isRemarkModalOpen}
        closeRemarkModal={() => setIsRemarkModalOpen(false)}
        addRemarkToNote={addRemarkToNote}
        isViewRemarksModalOpen={isViewRemarksModalOpen}
        closeViewRemarksModal={() => setIsViewRemarksModalOpen(false)}
        remarks={remarks}
      />
    </div>
  );
};

export default NotesSection;
