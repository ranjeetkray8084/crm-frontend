import { Funnel, Download, Search, X, RefreshCw } from "lucide-react";

const PropertyToolbar = ({ 
  searchTerm, 
  searchTags = [],
  onSearchTermChange, 
  onSearchEnter,
  onRemoveSearchTag,
  onSearch, 
  onExport, 
  onToggleMobileFilters,
  onClearSearch,
  onRefresh,
  isSearchActive = false,
  isLoading = false,
  autoSearch = false 
}) => {
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchTermChange(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onSearchEnter) {
        onSearchEnter();
      } else {
        onSearch();
      }
    }
  };

  const handleClearSearch = () => {
    onClearSearch();
  };

  const handleSearchClick = () => {
    // If there's a search term, add it as tags first, then search
    if (searchTerm.trim()) {
      onSearchEnter();
    }
    // Then trigger the search
    onSearch();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
      {/* Search Input and Tags */}
      <div className="flex-1 min-w-[300px] relative">
        {searchTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {searchTags.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border"
              >
                <span>{tag}</span>
                <button
                  onClick={() => onRemoveSearchTag && onRemoveSearchTag(tag)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5"
                  title={`Remove "${tag}" tag`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            placeholder={
              searchTags.length > 0
                ? "Add more search terms..."
                : "Search by property name, location, owner contact... (Press Enter to add multiple keywords)"
            }
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 pr-10 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {(searchTerm || searchTags.length > 0) && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear all search terms"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isSearchActive && (
          <div className="absolute -bottom-5 left-0 text-xs text-blue-600">
            Search active
          </div>
        )}
      </div>

      {/* Search Button */}
      {(!autoSearch || (searchTerm || searchTags.length > 0)) && (
        <button 
          onClick={handleSearchClick} 
          disabled={isLoading}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Search size={14} />
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      )}

      {/* Refresh */}
      <button 
        onClick={onRefresh} 
        disabled={isLoading}
        className="bg-gray-600 text-white px-3 sm:px-4 py-2 text-sm rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        title="Refresh properties"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        Refresh
      </button>

      {/* Export */}
      <button 
        onClick={onExport} 
        className="bg-green-600 text-white px-3 sm:px-4 py-2 text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-2"
        title="Export to Excel"
      >
        <Download size={14} />
        Export
      </button>

      {/* Toggle Mobile Filters */}
      <button 
        onClick={onToggleMobileFilters} 
        className="bg-gray-200 md:hidden px-3 py-2 rounded text-sm hover:bg-gray-300 transition-colors flex items-center gap-2"
        title="Show filters"
      >
        <Funnel size={14} />
        Filters
      </button>

      {/* Auto-search badge */}
      {autoSearch && (
        <div className="hidden md:flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          Auto-search
        </div>
      )}
    </div>
  );
};

export default PropertyToolbar;