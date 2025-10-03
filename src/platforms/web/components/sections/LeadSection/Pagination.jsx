import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * A responsive and intelligent pagination component.
 */
const Pagination = ({ currentPage, pagination, onPageChange }) => {
  const { totalPages, totalElements, size = 10 } = pagination;

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = new Set();
    pages.add(1);

    for (let i = -1; i <= 1; i++) {
      const page = currentPage + 1 + i;
      if (page > 1 && page < totalPages) pages.add(page);
    }

    pages.add(totalPages);

    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const result = [];
    let last = 0;

    for (const page of sortedPages) {
      if (last && page - last > 1) result.push('...');
      result.push(page);
      last = page;
    }

    return result;
  };

  const visiblePages = getVisiblePages();
  const fromResult = currentPage * size + 1;
  const toResult = Math.min((currentPage + 1) * size, totalElements);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6 mr-20">
      
      {/* Mobile View */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{fromResult}</span> to <span className="font-medium">{toResult}</span> of{' '}
            <span className="font-medium">{totalElements}</span> results
          </p>
        </div>

        <div>
          <nav className="inline-flex items-center -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* Previous */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Page Numbers */}
            {visiblePages.map((page, index) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-500 ring-1 ring-inset ring-gray-300"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page - 1)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    currentPage === page - 1
                      ? 'z-10 bg-blue-600 text-white'
                      : 'text-gray-900'
                  }`}
                  aria-current={currentPage === page - 1 ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
