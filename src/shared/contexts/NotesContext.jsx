import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotesContext = createContext();

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const { user } = useAuth();
  const [allNotes, setAllNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);

  const companyId = user?.companyId;
  const userId = user?.userId || user?.id;
  const role = user?.role;

  // Function to update notes data (called from useNotes hook)
  const updateNotesData = (notes, loading, error) => {
    setAllNotes(notes || []);
    setNotesLoading(loading);
    setNotesError(error);
  };

  // Function to get today's events from the stored notes
  const getTodayEvents = () => {
    if (!allNotes || allNotes.length === 0) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Store all notes with dateTime in an array
    const notesArray = [];
    
    allNotes.forEach((note) => {
      // Only include notes with dateTime and exclude completed/closed status
      if (note.dateTime && note.status !== 'CLOSED' && note.status !== 'COMPLETED') {
        try {
          const noteDate = new Date(note.dateTime).toISOString().split('T')[0];
          notesArray.push({
            ...note,
            noteDate,
            isToday: noteDate === today
          });
        } catch (dateError) {
          // Skip notes with invalid dateTime
          console.warn('Invalid dateTime for note:', note.id, note.dateTime);
        }
      }
    });

    // Sort the array: today's events first, then by date and time
    const sortedNotes = notesArray.sort((a, b) => {
      // First priority: today's events come first
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      
      // Second priority: sort by date and time
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);
      return dateA - dateB;
    });

    // Return only today's events for dashboard display
    const todayEvents = sortedNotes.filter(note => note.isToday);
    return todayEvents;
  };

  // Function to get all sorted notes (today first, then by date)
  const getSortedNotes = () => {
    if (!allNotes || allNotes.length === 0) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Store all notes with dateTime in an array
    const notesArray = [];
    
    allNotes.forEach((note) => {
      // Only include notes with dateTime and exclude completed/closed status
      if (note.dateTime && note.status !== 'CLOSED' && note.status !== 'COMPLETED') {
        try {
          const noteDate = new Date(note.dateTime).toISOString().split('T')[0];
          notesArray.push({
            ...note,
            noteDate,
            isToday: noteDate === today
          });
        } catch (dateError) {
          // Skip notes with invalid dateTime
          console.warn('Invalid dateTime for note:', note.id, note.dateTime);
        }
      }
    });

    // Sort the array: today's events first, then by date and time
    const sortedNotes = notesArray.sort((a, b) => {
      // First priority: today's events come first
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      
      // Second priority: sort by date and time
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);
      return dateA - dateB;
    });

    return sortedNotes;
  };

  const value = {
    allNotes,
    notesLoading,
    notesError,
    updateNotesData,
    getTodayEvents,
    getSortedNotes,
    companyId,
    userId,
    role
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};
