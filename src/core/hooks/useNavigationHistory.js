import { useState, useCallback } from 'react';

/**
 * Hook to manage navigation history and provide redirect functionality
 * This helps forms redirect back to where they came from when cancelled
 */
export const useNavigationHistory = (initialSection = 'ViewDashboard') => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [previousSection, setPreviousSection] = useState(null);
  const [sectionHistory, setSectionHistory] = useState([initialSection]);

  const navigateToSection = useCallback((newSection) => {
    if (newSection !== currentSection) {

      
      setPreviousSection(currentSection);
      setCurrentSection(newSection);
      setSectionHistory(prev => {
        const newHistory = [...prev, newSection];
        console.log(`📚 History updated:`, newHistory);
        return newHistory;
      });
    } else {
      console.log(`⚠️ Navigation skipped: Already at ${newSection}`);
    }
  }, [currentSection]);

  const goBack = useCallback(() => {

    
    if (previousSection && previousSection !== currentSection) {
      console.log(`✅ Going back to: ${previousSection}`);
      
      // Find the index of the previous section in history
      const previousIndex = sectionHistory.indexOf(previousSection);
      const newPreviousSection = previousIndex > 0 ? sectionHistory[previousIndex - 1] : 'ViewDashboard';
      

      
      setCurrentSection(previousSection);
      setPreviousSection(newPreviousSection);
      
      // Update history by removing the current section
      setSectionHistory(prev => {
        const newHistory = prev.slice(0, -1);
        return newHistory;
      });
    } else {
      // Fallback to dashboard if no previous section or if we're already there
      setCurrentSection('ViewDashboard');
      setPreviousSection(null);
      setSectionHistory(['ViewDashboard']);
    }
  }, [previousSection, currentSection, sectionHistory]);

  const goToSection = useCallback((section) => {
    navigateToSection(section);
  }, [navigateToSection]);

  const resetToSection = useCallback((section) => {
    console.log(`🔄 resetToSection called with: ${section}`);
    setCurrentSection(section);
    setPreviousSection(null);
    setSectionHistory([section]);
  }, []);

  return {
    currentSection,
    previousSection,
    sectionHistory,
    navigateToSection,
    goBack,
    goToSection,
    resetToSection
  };
};
