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
    const todayMap = new Map();
    let eventCount = 0;
    let totalNotes = 0;

    allNotes.forEach((note) => {
      totalNotes++;
      // Only include events (notes with dateTime) that are scheduled for today and not closed
      if (note.dateTime && note.status !== 'CLOSED') {
        try {
          const noteDate = new Date(note.dateTime).toISOString().split('T')[0];
          if (noteDate === today) {
            todayMap.set(note.id, note);
            eventCount++;
          }
        } catch (dateError) {
          // Skip notes with invalid dateTime
          console.warn('Invalid dateTime for note:', note.id, note.dateTime);
        }
      }
    });

    const todayEvents = Array.from(todayMap.values());
    return todayEvents;
  };

  const value = {
    allNotes,
    notesLoading,
    notesError,
    updateNotesData,
    getTodayEvents,
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
