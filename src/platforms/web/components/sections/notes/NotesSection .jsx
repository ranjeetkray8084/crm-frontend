import React, { useState, useEffect } from 'react';
import { useNotes } from '../../../../../core/hooks/useNotes';
import NoteTable from './NoteTable';
import NoteCardList from './NoteCardList';
import NoteModals from './NoteModals';
import { NoteTableSkeleton, NoteCardListSkeleton, FilterSkeleton } from './NoteSkeleton';

// Add section animations
const sectionStyles = `
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  .animate-slideDown {
    animation: slideDown 0.6s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.6s ease-out;
    animation-fill-mode: both;
  }
`;

// Inject section styles
if (typeof document !== 'undefined') {
  const existingSectionStyle = document.getElementById('section-animations');
  if (!existingSectionStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'section-animations';
    styleSheet.textContent = sectionStyles;
    document.head.appendChild(styleSheet);
  }
}

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



  // Manual function to set companyId (for debugging)
  const setCompanyIdManually = (id) => {
    console.log('Setting companyId manually to:', id);
    localStorage.setItem('companyId', id.toString());
    setUserInfo(prev => ({ ...prev, companyId: parseInt(id, 10) }));
  };

  // Expose function to window for console access
  useEffect(() => {
    window.setCompanyId = setCompanyIdManually;
    return () => {
      delete window.setCompanyId;
    };
  }, []);

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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Notes Management</h1>
        <div className="flex gap-3">
          <button
            onClick={handleAddNote}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:shadow-lg hover:-translate-y-1"
          >
            <svg className="w-5 h-5 transition-transform duration-200 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Note
          </button>
          <button
            onClick={loadNotes}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="animate-pulse">Refreshing...</span>
              </div>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      {loading ? (
        <FilterSkeleton />
      ) : (
        <div className="bg-white p-4 rounded-lg shadow mb-6 animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Notes
              </label>
              <input
                type="text"
                placeholder="Search by content or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
              />
            </div>

            {/* Status Filter */}
            <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
              >
                <option value="">All Status</option>
                <option value="NEW">New</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
              >
                <option value="">All Priority</option>
                <option value="PRIORITY_A">Priority A</option>
                <option value="PRIORITY_B">Priority B</option>
                <option value="PRIORITY_C">Priority C</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-4 animate-slideUp" style={{ animationDelay: '0.5s' }}>
            <div className="text-sm text-gray-600 animate-pulse">
              Showing {filteredNotes.length} of {notes.length} notes
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200 transform hover:scale-105"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Error UI */}
      {error && <div className="text-center p-4 text-red-500">Error: {error}</div>}

      {/* Check if user info is missing */}
      {(!userInfo.companyId || !userInfo.userId) && !loading ? (
        <div className="text-center p-4 text-yellow-600 bg-yellow-100 rounded-lg mb-4">
          <div className="font-semibold">User session expired or not found. Please log in again.</div>
          <div className="mt-2 text-sm">
            Missing: {!userInfo.companyId && 'Company ID'} {!userInfo.userId && 'User ID'}
          </div>
          {!userInfo.companyId && (
            <div className="mt-3">
              <input
                type="number"
                placeholder="Enter Company ID"
                className="px-3 py-1 border rounded mr-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setCompanyIdManually(e.target.value);
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  if (input.value) {
                    setCompanyIdManually(input.value);
                  }
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Set Company ID
              </button>
            </div>
          )}
        </div>
      ) : loading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="hidden md:block">
            <NoteTableSkeleton />
          </div>

          {/* Mobile Skeleton */}
          <div className="block md:hidden">
            <NoteCardListSkeleton />
          </div>
        </>
      ) : !error ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <NoteTable
              notes={filteredNotes}
              onEdit={handleEdit}
              onDelete={deleteNote}
              onUpdateStatus={updateNoteStatus}
              onUpdatePriority={updateNotePriority}
              onAddRemark={handleAddRemark}
              onViewRemarks={handleViewRemarks}
            />
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden animate-slideUp" style={{ animationDelay: '0.3s' }}>
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
      ) : null}

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
