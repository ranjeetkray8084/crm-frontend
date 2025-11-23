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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Fixed to 10 items per page

  useEffect(() => {
    // Use sessionStorage first, then fallback to localStorage
    const companyIdRaw = sessionStorage.getItem('companyId') || localStorage.getItem('companyId');
    const companyIdAlt = sessionStorage.getItem('company_id') || localStorage.getItem('company_id');
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

    let companyId = null;
    if (companyIdRaw) {
      companyId = parseInt(companyIdRaw, 10);
    } else if (user.companyId) {
      companyId = parseInt(user.companyId, 10);
    } else if (companyIdAlt) {
      companyId = parseInt(companyIdAlt, 10);
    }

    // Ensure userId is numeric - try id first, then userId, validate it's a number
    let userId = user.id || user.userId;
    
    // If userId is not a number, try to parse it or get from token
    if (userId && typeof userId !== 'number') {
      const parsed = parseInt(userId, 10);
      if (!isNaN(parsed)) {
        userId = parsed;
      } else {
        // If still not numeric, it might be email - log warning
        console.warn('⚠️ UserId is not numeric:', userId, 'Attempting to extract from token...');
        // Try to get from token payload
        try {
          const token = sessionStorage.getItem('token') || localStorage.getItem('token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.userId && typeof payload.userId === 'number') {
              userId = payload.userId;
              console.log('✅ Extracted numeric userId from token:', userId);
            } else if (payload.sub && typeof payload.sub === 'number') {
              userId = payload.sub;
              console.log('✅ Extracted numeric userId from token sub:', userId);
            }
          }
        } catch (e) {
          console.error('❌ Could not extract userId from token:', e);
        }
      }
    }
    
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
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

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

  // Status-based sorting logic: NEW -> PROCESSING -> COMPLETED
  // This ensures that:
  // 1. NEW notes appear at the top (highest priority)
  // 2. PROCESSING notes appear in the middle (medium priority)  
  // 3. COMPLETED notes appear at the bottom (lowest priority)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const statusPriority = {
      'NEW': 1,        // Top priority - appears first
      'PROCESSING': 2, // Medium priority - appears second
      'COMPLETED': 3   // Bottom priority - appears last
    };
    
    // Handle undefined/null status values and make case-insensitive
    const statusA = (a.status || 'COMPLETED').toUpperCase(); // Default to COMPLETED if no status
    const statusB = (b.status || 'COMPLETED').toUpperCase(); // Default to COMPLETED if no status
    
    const priorityA = statusPriority[statusA] || 4; // Default to bottom for unknown statuses
    const priorityB = statusPriority[statusB] || 4;
    
    return priorityA - priorityB;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(sortedNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotes = sortedNotes.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, typeFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of notes section
    const notesElement = document.querySelector('.notes-container');
    if (notesElement) {
      notesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };



  // Get unique types for filter dropdown
  const uniqueTypes = [...new Set(notes.map(note => note.typeStr).filter(Boolean))];

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
  };

  // Pagination Component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center py-4 border-t border-gray-200 bg-gray-50 mr-20">
        {/* Page info */}
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedNotes.length)} of {sortedNotes.length} notes
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border shadow-sm w-full h-fit">

        {/* Toolbar Section (mobile only to avoid empty space on desktop) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-gray-50 rounded-lg md:hidden">
          <div className="flex gap-2 flex-wrap">
           
            
            
            {/* Mobile Filters Toggle */}
            <button 
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden bg-gray-500 text-white px-4 py-2 text-sm rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
              title="Toggle filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
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
                <option value="">Status</option>
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
                <option value="">Priority</option>
                <option value="PRIORITY_A">Priority A</option>
                <option value="PRIORITY_B">Priority B</option>
                <option value="PRIORITY_C">Priority C</option>
              </select>
            </div>

            {/* Type Filter + Refresh in same cell */}
            <div className="flex items-center gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                onClick={loadNotes}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Refreshing...
                  </div>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
          </div>

        
                    {/* Filter Summary */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {sortedNotes.length} of {notes.length} notes
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

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <div className="md:hidden mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 gap-4">
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
                  <option value="">Status</option>
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
                  <option value="">Priority</option>
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

            {/* Mobile Filter Summary */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {sortedNotes.length} of {notes.length} notes
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
        )}

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
        {!loading && !error && sortedNotes.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            <div className="text-lg font-medium">No notes found</div>
            <div className="text-sm mt-1">
              {notes.length === 0 ? 'Create your first note to get started' : 'Try adjusting your filters'}
            </div>
          </div>
        )}



        {/* Notes Display */}
        {!loading && !error && sortedNotes.length > 0 && (
          <div className="notes-container">
            <NoteTable
              notes={paginatedNotes}
              onEdit={handleEdit}
              onDelete={deleteNote}
              onUpdateStatus={updateNoteStatus}
              onUpdatePriority={updateNotePriority}
              onAddRemark={handleAddRemark}
              onViewRemarks={handleViewRemarks}
            />
            <div className="block md:hidden">
              <NoteCardList
                notes={paginatedNotes}
                onEdit={handleEdit}
                onDelete={deleteNote}
                onUpdateStatus={updateNoteStatus}
                onUpdatePriority={updateNotePriority}
                onAddRemark={handleAddRemark}
                onViewRemarks={handleViewRemarks}
              />
            </div>
            
            {/* Pagination Controls */}
            <PaginationControls />
          </div>
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
