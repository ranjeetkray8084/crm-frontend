import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component
 *
 * @param {object} props
 * @param {number} props.currentPage - Current page (0-based index)
 * @param {object} props.pagination - Contains totalPages, totalElements, size (pageSize)
 * @param {function} props.onPageChange - Callback for page change
 */
const Pagination = ({ currentPage, pagination, onPageChange }) => {
    const { totalPages, totalElements, size = 10 } = pagination;

    if (totalPages <= 1) return null;

    // Generate page numbers around the current page with ellipses
    const getVisiblePages = () => {
        const pages = new Set();

        pages.add(1); // Always show first
        for (let i = -1; i <= 1; i++) {
            const page = currentPage + 1 + i;
            if (page > 1 && page < totalPages) {
                pages.add(page);
            }
        }
        pages.add(totalPages); // Always show last

        const sortedPages = Array.from(pages).sort((a, b) => a - b);
        const range = [];

        let last = 0;
        for (const page of sortedPages) {
            if (last && page - last > 1) {
                range.push('...');
            }
            range.push(page);
            last = page;
        }

        return range;
    };

    const visiblePages = getVisiblePages();
    const fromResult = currentPage * size + 1;
    const toResult = Math.min((currentPage + 1) * size, totalElements);

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6 mr-20">
            {/* Mobile Pagination */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{fromResult}</span> to{' '}
                        <span className="font-medium">{toResult}</span> of{' '}
                        <span className="font-medium">{totalElements}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {visiblePages.map((page, index) =>
                            page === '...' ? (
                                <span
                                    key={`dots-${index}`}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-500"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page - 1)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                                        currentPage === page - 1
                                            ? 'z-10 bg-blue-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    aria-current={currentPage === page - 1 ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
