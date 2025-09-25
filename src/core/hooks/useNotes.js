import { useState, useEffect, useCallback } from 'react';
import { NoteService } from '../services/note.service';
import { customAlert } from '../utils/alertUtils';
import axios from '../../legacy/api/axios';
import { useNotesContext } from '../../shared/contexts/NotesContext';

export const useNotes = (companyId, userId, role) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get context to update shared notes data
  const { updateNotesData } = useNotesContext();

  const loadNotes = useCallback(async () => {
    if (!companyId || !userId || !role) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let notePromises = [];

      switch (role) {
        case 'ADMIN':
          notePromises.push(NoteService.getNotesVisibleToUser(companyId, userId, true, false));
          notePromises.push(NoteService.getNotesVisibleToAdmin(companyId, userId));
          notePromises.push(NoteService.getNotesByAdmin(companyId, userId)); // Include admin's own notes (including SPECIFIC_USERS)
          break;
        case 'DIRECTOR':
          notePromises.push(NoteService.getNotesVisibleToDirector(companyId, userId));
          notePromises.push(NoteService.getNotesVisibleToUser(companyId, userId, false, true)); // isDirector = true
          notePromises.push(NoteService.getPublicNotes(companyId));
          break;
        case 'USER':
          notePromises.push(NoteService.getNotesByUser(companyId, userId));
          notePromises.push(NoteService.getNotesVisibleToUser(companyId, userId));
          notePromises.push(NoteService.getPublicNotes(companyId));
          break;
        default:
          notePromises.push(NoteService.getNotesVisibleToUser(companyId, userId));
      }

      const results = await Promise.all(notePromises);

      const combinedNotes = results.flatMap(result => {
        if (!result.success) return [];
        return Array.isArray(result.data) ? result.data : result.data?.notes || [];
      });

      const fmtTime = d =>
        d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

      const getWordChunks = (text, chunkSize = 5) => {
        const words = (text || '').split(/\s+/);
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
          chunks.push(words.slice(i, i + chunkSize).join(' '));
        }
        return chunks;
      };

      // Get unique user IDs for fetching usernames
      const uniqueUserIds = [...new Set(combinedNotes.flatMap(note => 
        [note.userId, ...(note.visibleUserIds || [])]).filter(Boolean))];

      // Fetch usernames for all unique user IDs
      const idToName = {};
      await Promise.all(uniqueUserIds.map(async id => {
        try {
          const response = await axios.get(`/api/users/${id}/username`);
          idToName[id] = response.data || 'Unknown';
        } catch (error) {
          idToName[id] = 'Unknown';
        }
      }));

      const uniqueNotes = Array.from(
        new Map(combinedNotes.map(note => [note.id, note])).values()
      ).map(note => {
        const schedDT = note.dateTime ? new Date(note.dateTime) : null;
        const createdDT = note.createdAt ? new Date(note.createdAt) : null;
        const createdBy = idToName[note.userId] || 'Unknown';

        // Get visible user names for "Created For" column
        const visibleUserNames = (note.visibleUserIds || [])
          .map(id => idToName[id])
          .filter(Boolean);

        return {
          ...note,
          schedStr: schedDT ? schedDT.toLocaleDateString() + ' ' + fmtTime(schedDT) : 'N/A',
          createdStr: createdDT ? createdDT.toLocaleDateString() + ' ' + fmtTime(createdDT) : '-',
          typeStr: schedDT ? 'Event' : 'Note',
          wordChunks: getWordChunks(note.content),
          createdBy: {
            id: note.userId,
            name: createdBy,
            username: createdBy
          },
          visibleUserNames: visibleUserNames
        };
      });

      const sortedNotes = uniqueNotes.sort((a, b) => {
        if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
        if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setNotes(sortedNotes);
      
      // Update the shared context with the loaded notes data

      updateNotesData(sortedNotes, false, null);
    } catch (err) {
      setError('A critical error occurred while loading notes.');
      // Update context with error state
      updateNotesData([], false, err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, role]);

  useEffect(() => {
    if (companyId && userId && role) {
      loadNotes();
    }
  }, [companyId, userId, role, loadNotes]);

  const executeNoteAction = useCallback(
    async (apiCall, successMsg, errorMsg, shouldReload = true) => {
      setLoading(true);
      try {
        const result = await apiCall();

        if (result?.success) {
          if (successMsg) customAlert(`✅ ${successMsg}`);
          if (shouldReload) {
            await loadNotes();
          }
          return result;
        } else {
          throw new Error(result?.error || errorMsg || 'Unknown error');
        }
      } catch (err) {
        setError(err.message);
        customAlert(`❌ ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [loadNotes]
  );

  return {
    notes,
    loading,
    error,
    loadNotes,
    createNote: (noteData) => {
      
      // Validate required data
      if (!companyId) {
        return Promise.resolve({ success: false, error: 'Company ID is required' });
      }
      
      if (!userId) {
        return Promise.resolve({ success: false, error: 'User ID is required' });
      }
      
      if (!noteData.content) {
        return Promise.resolve({ success: false, error: 'Note content is required' });
      }
      
      const finalNoteData = { 
        ...noteData, 
        userId,
        createdBy: userId
      };
      
      return executeNoteAction(
        () => NoteService.createNote(companyId, finalNoteData),
        'Note created successfully',
        'Failed to create note'
      );
    },
    updateNote: (noteId, noteData) =>
      executeNoteAction(
        () => NoteService.updateNote(companyId, noteId, noteData),
        'Note updated',
        'Update failed'
      ),
    deleteNote: (noteId) =>
      executeNoteAction(
        () => NoteService.deleteNote(companyId, noteId),
        'Note deleted',
        'Delete failed'
      ),
    updateNoteStatus: (noteId, status) =>
      executeNoteAction(
        () => NoteService.updateNoteStatus(companyId, noteId, status),
        'Status updated',
        'Status update failed'
      ),
    updateNotePriority: (noteId, priority) =>
      executeNoteAction(
        () => NoteService.updateNotePriority(companyId, noteId, priority),
        'Priority updated',
        'Priority update failed'
      ),
    addRemarkToNote: (noteId, remarkData) =>
      executeNoteAction(
        () => {
          return NoteService.addRemarkToNote(companyId, noteId, { ...remarkData, userId });
        },
        'Remark added',
        'Failed to add remark',
        false
      ),
    getNoteById: (noteId) =>
      executeNoteAction(
        () => NoteService.getNoteById(companyId, noteId),
        null,
        'Failed to fetch note',
        false
      ),
    getRemarksByNoteId: (noteId) =>
      executeNoteAction(
        () => NoteService.getRemarksByNoteId(companyId, noteId),
        null,
        'Failed to fetch remarks',
        false
      ),
  };
};
