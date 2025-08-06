import { AlertCircle, Users } from 'lucide-react';

// Reusable Skeleton Table Row
const SkeletonTableRow = () => (
  <tr className="animate-pulse">
    {[
      "w-32", "w-28", "w-20", "w-24", "w-36", "w-28", "w-20", "w-24", "w-8"
    ].map((width, idx) => (
      <td key={idx} className="px-4 py-4 whitespace-nowrap">
        <div className={`h-4 bg-gray-200 rounded ${width}`}></div>
      </td>
    ))}
  </tr>
);

// Desktop Skeleton Table
const SkeletonTable = () => (
  <div className="hidden md:block overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          {[
            "Lead Name", "Phone", "Status", "Budget", "Requirement",
            "Location", "Created", "Assigned To", "Actions"
          ].map((heading) => (
            <th
              key={heading}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {[...Array(8)].map((_, index) => (
          <SkeletonTableRow key={index} />
        ))}
      </tbody>
    </table>
  </div>
);

// Mobile Skeleton Card
const SkeletonMobileCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse space-y-4">
    <div className="flex justify-between">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-40"></div>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          <div className="h-5 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>
      <div className="h-6 w-6 bg-gray-200 rounded"></div>
    </div>

    <div className="space-y-2">
      {[24, 32, 28].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className={`h-4 bg-gray-200 rounded w-${w}`}></div>
        </div>
      ))}
    </div>

    <div className="pt-3 border-t border-gray-100">
      <div className="h-3 w-48 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Mobile Skeleton List
const SkeletonMobileList = () => (
  <div className="md:hidden space-y-4">
    {[...Array(6)].map((_, index) => (
      <SkeletonMobileCard key={index} />
    ))}
  </div>
);

// Main Feedback Component
const LeadsFeedback = ({ loading, error, isEmpty }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonTable />
        <SkeletonMobileList />
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Loading leads...
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
          <p className="text-red-600 font-medium mb-2">Error loading leads</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 font-medium mb-2">No leads found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search criteria or add new leads.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default LeadsFeedback;
