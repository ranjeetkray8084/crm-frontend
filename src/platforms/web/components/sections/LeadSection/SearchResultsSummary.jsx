import { Search, Filter, X } from "lucide-react";

/**
 * Displays a summary of current search and filter results.
 */
const SearchResultsSummary = ({
  totalResults,
  currentPage,
  pageSize,
  activeFiltersSummary = [],
  onClearAll,
}) => {
  const startResult = Math.min(currentPage * pageSize + 1, totalResults);
  const endResult = Math.min((currentPage + 1) * pageSize, totalResults);

  const shouldShowRange = totalResults > 0 && startResult <= endResult;

  return (
    <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
      {/* Header row */}
      <header className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-blue-800 text-sm font-semibold">
          <Search size={18} className="text-blue-600" />
          {shouldShowRange ? (
            <>
              Showing <span className="font-bold">{startResult}-{endResult}</span> of{" "}
              <span className="font-bold">{totalResults}</span> results
            </>
          ) : (
            <>No results found</>
          )}
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
        >
          <X size={14} />
          Clear All Filters
        </button>
      </header>

      {/* Filters summary */}
      {activeFiltersSummary.length > 0 && (
        <div className="border-t border-blue-200 pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-blue-700" />
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide">
              Active Filters:
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeFiltersSummary.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 bg-white border border-blue-300 text-blue-800 text-xs font-medium rounded-full"
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchResultsSummary;
