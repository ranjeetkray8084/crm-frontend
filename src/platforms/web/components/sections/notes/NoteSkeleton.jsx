import React from 'react';

// Skeleton component for individual elements
const Skeleton = ({ className = "", width = "100%", height = "20px" }) => (
  <div 
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={{ width, height }}
  />
);

// Desktop table skeleton
export const NoteTableSkeleton = () => {
  return (
    <div className="overflow-x-auto bg-white h-screen rounded-lg shadow relative z-10">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created For</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(8)].map((_, index) => (
            <tr key={index}>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <Skeleton width="80%" height="16px" />
                  <Skeleton width="60%" height="16px" />
                </div>
              </td>
              <td className="px-6 py-4">
                <Skeleton width="80px" height="32px" className="rounded-md" />
              </td>
              <td className="px-6 py-4">
                <Skeleton width="90px" height="32px" className="rounded-md" />
              </td>
              <td className="px-6 py-4">
                <Skeleton width="60px" height="16px" />
              </td>
              <td className="px-6 py-4">
                <Skeleton width="100px" height="16px" />
              </td>
              <td className="px-6 py-4">
                <Skeleton width="110px" height="16px" />
              </td>
              <td className="px-6 py-4">
                <Skeleton width="120px" height="16px" />
              </td>
              <td className="px-6 py-4">
                <Skeleton width="120px" height="16px" />
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Skeleton width="24px" height="24px" className="rounded" />
                  <Skeleton width="24px" height="24px" className="rounded" />
                  <Skeleton width="24px" height="24px" className="rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Mobile card skeleton
export const NoteCardSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      {/* Content skeleton */}
      <div className="mb-3 space-y-2">
        <Skeleton width="100%" height="16px" />
        <Skeleton width="85%" height="16px" />
        <Skeleton width="70%" height="16px" />
      </div>

      {/* Status and Priority skeleton */}
      <div className="flex justify-between items-center mb-3 gap-2">
        <Skeleton width="80px" height="32px" className="rounded-md" />
        <Skeleton width="90px" height="32px" className="rounded-md" />
      </div>

      {/* Info skeleton */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width="40px" height="14px" />
          <Skeleton width="60px" height="14px" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width="70px" height="14px" />
          <Skeleton width="100px" height="14px" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width="60px" height="14px" />
          <Skeleton width="120px" height="14px" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex flex-wrap gap-2">
        <Skeleton width="50px" height="28px" className="rounded" />
        <Skeleton width="60px" height="28px" className="rounded" />
        <Skeleton width="80px" height="28px" className="rounded" />
        <Skeleton width="90px" height="28px" className="rounded" />
      </div>
    </div>
  );
};

// Mobile card list skeleton
export const NoteCardListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, index) => (
        <NoteCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Filter section skeleton
export const FilterSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input Skeleton */}
        <div className="lg:col-span-2">
          <Skeleton width="100px" height="16px" className="mb-1" />
          <Skeleton width="100%" height="40px" className="rounded-md" />
        </div>

        {/* Filter dropdowns skeleton */}
        {[...Array(3)].map((_, index) => (
          <div key={index}>
            <Skeleton width="60px" height="16px" className="mb-1" />
            <Skeleton width="100%" height="40px" className="rounded-md" />
          </div>
        ))}
      </div>

      {/* Filter Actions Skeleton */}
      <div className="flex justify-between items-center mt-4">
        <Skeleton width="150px" height="16px" />
        <Skeleton width="100px" height="32px" className="rounded-md" />
      </div>
    </div>
  );
};