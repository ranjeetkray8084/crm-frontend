import React, { useState, useEffect } from 'react';
import { Search, Filter, X, History, TrendingUp, Download } from 'lucide-react';
import { SearchService } from '../../../../core/services/SearchService';
import { useAuth } from '../../../../shared/contexts/AuthContext';

const SearchInterface = ({ onSearchResults, onClose }) => {
  const { user } = useAuth();
  const [searchKey, setSearchKey] = useState('property');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadSearchHistory();
    loadPopularSearches();
  }, [user?.userId]);

  const loadSearchHistory = () => {
    if (user?.userId) {
      const history = SearchService.getSearchHistory(user.userId);
      setSearchHistory(history);
    }
  };

  const loadPopularSearches = () => {
    const popular = SearchService.getPopularSearches();
    setPopularSearches(popular);
  };

  const handleSearchKeyChange = (key) => {
    setSearchKey(key);
    setSearchQuery('');
    setFilters({});
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    
    if (value.length > 1) {
      const newSuggestions = SearchService.getSearchSuggestions(value, searchKey, user);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const performSearch = async () => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      return;
    }

    setIsSearching(true);
    
    try {
      const searchParams = {
        query: searchQuery,
        filters: filters,
        page: 0,
        size: 20
      };

      const results = await SearchService.performSearch(searchKey, searchParams, user);
      
      if (results.success) {
        // Save to history
        SearchService.saveSearchToHistory(user.userId, searchKey, searchParams);
        loadSearchHistory();
        
        // Pass results to parent
        onSearchResults(results);
      } else {
        console.error('Search failed:', results.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch();
  };

  const handleHistoryClick = (historyItem) => {
    setSearchKey(historyItem.searchKey);
    setSearchQuery(historyItem.searchParams.query || '');
    setFilters(historyItem.searchParams.filters || {});
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const exportResults = (format) => {
    // This would be called from parent component with actual results
    console.log(`Exporting results in ${format} format`);
  };

  const renderSearchKeys = () => {
    return Object.entries(SearchService.SEARCH_KEYS).map(([key, config]) => (
      <button
        key={key}
        onClick={() => handleSearchKeyChange(key)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          searchKey === key
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {config.label}
      </button>
    ));
  };

  const renderFilters = () => {
    const availableFilters = SearchService.SEARCH_KEYS[searchKey]?.filters || [];
    
    return availableFilters.map(filterKey => {
      const filterConfig = SearchService.SEARCH_FILTERS[filterKey];
      if (!filterConfig) return null;

      return (
        <div key={filterKey} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {filterConfig.label}
          </label>
          
          {filterConfig.type === 'select' && (
            <select
              multiple={filterConfig.multiSelect}
              value={filters[filterKey] || (filterConfig.multiSelect ? [] : '')}
              onChange={(e) => {
                const value = filterConfig.multiSelect 
                  ? Array.from(e.target.selectedOptions, option => option.value)
                  : e.target.value;
                handleFilterChange(filterKey, value);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select {filterConfig.label}</option>
              {filterConfig.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}

          {filterConfig.type === 'range' && (
            <div className="space-y-2">
              <input
                type="range"
                min={filterConfig.min}
                max={filterConfig.max}
                step={filterConfig.step}
                value={filters[filterKey] || filterConfig.min}
                onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-600">
                ₹{filters[filterKey] || filterConfig.min} - ₹{filterConfig.max}
              </div>
            </div>
          )}

          {filterConfig.type === 'checkbox' && (
            <div className="grid grid-cols-2 gap-2">
              {filterConfig.options.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters[filterKey] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = filters[filterKey] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleFilterChange(filterKey, newValues);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Advanced Search</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Keys */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Search Type</h3>
        <div className="flex space-x-2">
          {renderSearchKeys()}
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={`Search ${SearchService.SEARCH_KEYS[searchKey]?.label.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {renderSuggestions()}
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {Object.keys(filters).length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          {renderFilters()}
        </div>
      )}

      {/* Search Button */}
      <div className="mb-6">
        <button
          onClick={performSearch}
          disabled={isSearching || (!searchQuery.trim() && Object.keys(filters).length === 0)}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Recent Searches</span>
          </h3>
          <div className="space-y-2">
            {searchHistory.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
              >
                <div className="font-medium">{SearchService.SEARCH_KEYS[item.searchKey]?.label}</div>
                <div className="text-gray-600">{item.searchParams.query || 'Filtered search'}</div>
                <div className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Popular Searches</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(search)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
