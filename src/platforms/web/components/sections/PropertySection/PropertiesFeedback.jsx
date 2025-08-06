import { AlertCircle, Building } from 'lucide-react';

const SkeletonTableRow = () => (
    <tr className="animate-pulse">
        {[...Array(11)].map((_, i) => (
            <td key={i} className="px-4 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </td>
        ))}
    </tr>
);

const SkeletonTable = () => (
    <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BHK</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(6)].map((_, i) => (
                    <SkeletonTableRow key={i} />
                ))}
            </tbody>
        </table>
    </div>
);

const SkeletonMobileCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    </div>
);

const SkeletonMobileList = () => (
    <div className="md:hidden space-y-4">
        {[...Array(5)].map((_, i) => (
            <SkeletonMobileCard key={i} />
        ))}
    </div>
);

/**
 * Displays skeletons while loading, error message on failure, or empty state.
 * @param {Object} props
 * @param {boolean} props.loading - Is data loading.
 * @param {string|null} props.error - Error message (if any).
 * @param {boolean} props.isEmpty - Whether the table has no data after load.
 * @param {Function} props.onRetry - Function to retry loading data.
 */
const PropertiesFeedback = ({ loading, error, isEmpty, onRetry }) => {
    if (loading) {
        return (
            <div className="space-y-4" aria-busy="true" role="status">
                <SkeletonTable />
                <SkeletonMobileList />
                <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading properties...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <p className="text-red-600 font-medium text-lg">Error loading properties</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                    <button
                        onClick={onRetry}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Building className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-700 font-medium text-lg">No properties found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
                </div>
            </div>
        );
    }

    return null;
};

export default PropertiesFeedback;
