const SearchResultsSummary = ({ 
  totalResults, 
  currentPage, 
  pageSize, 
  searchFilters,
  onClearFilters 
}) => {
  const hasActiveFilters = searchFilters && Object.values(searchFilters).some(value => value && value.trim());
  
  if (!hasActiveFilters) return null;

  const startResult = (currentPage * pageSize) + 1;
  const endResult = Math.min((currentPage + 1) * pageSize, totalResults);

  const getActiveFiltersText = () => {
    const activeFilters = [];
    
    if (searchFilters.keywords) {
      activeFilters.push(`Keywords: "${searchFilters.keywords}"`);
    }
    if (searchFilters.budgetRange) {
      const [min, max] = searchFilters.budgetRange.split('-');
      const formatPrice = (price) => {
        const num = parseInt(price);
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
        return `₹${num.toLocaleString()}`;
      };
      activeFilters.push(`Budget: ${formatPrice(min)} - ${formatPrice(max)}`);
    }
    if (searchFilters.status) {
      const statusMap = {
        'AVAILABLE_FOR_SALE': 'For Sale',
        'AVAILABLE_FOR_RENT': 'For Rent',
        'RENT_OUT': 'Rented Out',
        'SOLD_OUT': 'Sold Out'
      };
      activeFilters.push(`Status: ${statusMap[searchFilters.status] || searchFilters.status}`);
    }
    if (searchFilters.type) {
      activeFilters.push(`Type: ${searchFilters.type}`);
    }
    if (searchFilters.bhk) {
      activeFilters.push(`BHK: ${searchFilters.bhk}`);
    }
    if (searchFilters.source) {
      activeFilters.push(`Source: ${searchFilters.source}`);
    }
    if (searchFilters.createdBy) {
      activeFilters.push(`Created By: ${searchFilters.createdBy}`);
    }
    
    return activeFilters.join(', ');
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-semibold text-blue-800">
              Search Results: {totalResults} properties found
            </span>
          </div>
          
          {totalResults > 0 && (
            <p className="text-sm text-blue-700 mb-2">
              Showing {startResult}-{endResult} of {totalResults} results
            </p>
          )}
          
          <div className="text-sm text-blue-600">
            <span className="font-medium">Active filters:</span> {getActiveFiltersText()}
          </div>
        </div>
        
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default SearchResultsSummary;