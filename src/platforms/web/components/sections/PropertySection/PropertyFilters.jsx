import { useUsers } from '../../../../../core/hooks/useUsers';

const PropertyFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  companyId,
  userId,
  isMobile = false,
  hasActiveFilters = false,
  activeFiltersSummary = '',
  autoApply = true,
  availableUsers = []
}) => {
  const { users: filterUsers } = useUsers(companyId);

  const handleFilterChange = (filterName, value) => {
    onFilterChange(filterName, value);
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const containerClass = isMobile 
    ? "bg-gray-50 p-3 rounded-lg mb-4 border" 
    : "bg-gray-50 p-4 rounded-lg mb-6 border";

  const gridClass = isMobile 
    ? "grid grid-cols-1 gap-3" 
    : "flex flex-wrap gap-3 items-center";

  return (
    <div className={containerClass}>
      {hasActiveFilters && !isMobile && (
        <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              <span className="font-medium">Active filters:</span> {activeFiltersSummary}
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
      
      <div className={gridClass}>

        {/* Budget Filter */}
        <select
          value={filters.budgetRange || ''}
          onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Budget</option>
          <option value="0-500000">Below ₹5 Lakh</option>
          <option value="500000-1000000">₹5 Lakh - ₹10 Lakh</option>
          <option value="1000000-1500000">₹10 Lakh - ₹15 Lakh</option>
          <option value="1500000-2000000">₹15 Lakh - ₹20 Lakh</option>
          <option value="2000000-2500000">₹20 Lakh - ₹25 Lakh</option>
          <option value="2500000-3000000">₹25 Lakh - ₹30 Lakh</option>
          <option value="3000000-3500000">₹30 Lakh - ₹35 Lakh</option>
          <option value="3500000-4000000">₹35 Lakh - ₹40 Lakh</option>
          <option value="4000000-4500000">₹40 Lakh - ₹45 Lakh</option>
          <option value="4500000-5000000">₹45 Lakh - ₹50 Lakh</option>
          <option value="5000000-10000000">₹50 Lakh - ₹1 Cr</option>
          <option value="10000000-20000000">₹1 Cr - ₹2 Cr</option>
          <option value="20000000-30000000">₹2 Cr - ₹3 Cr</option>
          <option value="30000000-40000000">₹3 Cr - ₹4 Cr</option>
          <option value="40000000-50000000">₹4 Cr - ₹5 Cr</option>
          <option value="50000000-100000000">₹5 Cr - ₹10 Cr</option>
          <option value="100000000-200000000">₹10 Cr - ₹20 Cr</option>
          <option value="200000000-300000000">₹20 Cr - ₹30 Cr</option>
          <option value="300000000-400000000">₹30 Cr - ₹40 Cr</option>
          <option value="400000000-500000000">₹40 Cr - ₹50 Cr</option>
          <option value="500000000-600000000">₹50 Cr - ₹60 Cr</option>
          <option value="600000000-700000000">₹60 Cr - ₹70 Cr</option>
          <option value="700000000-800000000">₹70 Cr - ₹80 Cr</option>
          <option value="800000000-900000000">₹80 Cr - ₹90 Cr</option>
          <option value="900000000-1000000000">₹90 Cr - ₹100 Cr</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Status</option>
          <option value="AVAILABLE_FOR_SALE">For Sale</option>
          <option value="AVAILABLE_FOR_RENT">For Rent</option>
          <option value="RENT_OUT">Rented Out</option>
          <option value="SOLD_OUT">Sold Out</option>
        </select>

        {/* Type Filter */}
        <select
          value={filters.type || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Type</option>
          <option value="Office">Office</option>
          <option value="Retail">Retail</option>
          <option value="Residential">Residential</option>
          <option value="Plot">Plot</option>
        </select>

        {/* BHK Filter */}
        <select
          value={filters.bhk || ''}
          onChange={(e) => handleFilterChange('bhk', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4 BHK</option>
        </select>

        {/* Source Filter */}
        <select
          value={filters.source || ''}
          onChange={(e) => handleFilterChange('source', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Source</option>
          <option value="Social Media">Social Media</option>
          <option value="Cold Call">Cold Call</option>
          <option value="Reference">Reference</option>
          <option value="Broker">Broker</option>
        </select>

        {/* Created By Filter */}
        <select
          value={filters.createdBy || ''}
          onChange={(e) => handleFilterChange('createdBy', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Created By</option>
          {(() => {
            const users = availableUsers.length > 0 ? availableUsers : filterUsers;
            const currentUser = users.find(user => {
              const userIdValue = user.id || user.userId;
              return userId && (userIdValue?.toString() === userId?.toString());
            });
            const otherUsers = users.filter(user => {
              const userIdValue = user.id || user.userId;
              return !(userId && (userIdValue?.toString() === userId?.toString()));
            });
            
            // Put "Me" option first, then other users
            const sortedUsers = currentUser ? [currentUser, ...otherUsers] : users;
            
            return sortedUsers.map(user => {
              const userIdValue = user.id || user.userId;
              const isCurrentUser = userId && (userIdValue?.toString() === userId?.toString());
              const displayName = isCurrentUser ? 'Me' : (user.name || user.username || `User ${userIdValue}`);
              
              return (
                <option key={userIdValue} value={userIdValue}>
                  {displayName}
                </option>
              );
            });
          })()}
        </select>

        {/* Clear Filters Button */}
        {!autoApply && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition duration-300"
          >
            Clear All Filters
          </button>
        )}
      </div>
      
      {isMobile && hasActiveFilters && (
        <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
          <div className="text-sm text-blue-700">
            <span className="font-medium">Active filters:</span> {activeFiltersSummary}
          </div>
          <button
            onClick={handleClearFilters}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;