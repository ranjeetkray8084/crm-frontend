import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchInterface from './SearchInterface';
import SearchResults from './SearchResults';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchResults, setSearchResults] = useState(null);
  const [currentSearchKey, setCurrentSearchKey] = useState('property');

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setCurrentSearchKey(results.searchKey);
  };

  const handleClose = () => {
    setSearchResults(null);
    onClose();
  };

  const handleNewSearch = () => {
    setSearchResults(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {!searchResults ? (
            <SearchInterface 
              onSearchResults={handleSearchResults}
              onClose={handleClose}
            />
          ) : (
            <SearchResults 
              results={searchResults}
              searchKey={currentSearchKey}
              onClose={handleClose}
              onNewSearch={handleNewSearch}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;

