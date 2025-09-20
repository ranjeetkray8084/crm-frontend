import { X, Filter } from "lucide-react";

const LeadFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  isMobile = false,
  hasActiveFilters = false,
  autoApply = false,
  userRole = null,
  userId = null,
  companyId = null,
  availableUsers = []
}) => {
  const handleFilter = (key, value) => onFilterChange(key, value);

  const commonSelectClasses = "border rounded-md bg-white focus:outline-none focus:ring-blue-500";
  const mobileClasses = `w-full px-3 py-2 ${commonSelectClasses}`;
  const desktopClasses = `px-3 py-2 text-sm min-w-[120px] ${commonSelectClasses}`;

  const options = {
    status: [
      { value: "", label: "Status" },
      { value: "NEW", label: "New" },
      { value: "CONTACTED", label: "Contacted" },
      { value: "CLOSED", label: "Closed" },
      { value: "DROPED", label: "Dropped" }
    ],
    budget: [
      { value: "", label: "Budgets" },
      { value: "0-500000", label: "Below ₹5L" },
      { value: "500000-1000000", label: "₹5L–10L" },
      { value: "1000000-2000000", label: "₹10L–20L" },
      { value: "2000000-5000000", label: "₹20L–50L" },
      { value: "5000000-10000000", label: "₹50L–1Cr" },
      { value: "10000000-99999999", label: "Above ₹1Cr" }
    ],
    source: [
      { value: "", label: "Sources" },
      { value: "INSTAGRAM", label: "Instagram" },
      { value: "FACEBOOK", label: "Facebook" },
      { value: "YOUTUBE", label: "YouTube" },
      { value: "REFERENCE", label: "Reference" },
      { value: "NINETY_NINE_ACRES", label: "99acres" },
      { value: "MAGIC_BRICKS", label: "MagicBricks" }
    ],
    assignedTo: [
      { value: "", label: "Assignments" },
      { value: "assigned", label: "Assigned" },
      { value: "unassigned", label: "Unassigned" }
    ],
   
  };

  const getCreatedByOptions = () => {
    const list = [{ value: "", label: "All Created By", key: "all" }];
    if (userRole === "USER") return [];

    if (userRole === "ADMIN" || userRole === "DIRECTOR") {
      list.push({
        value: userId?.toString(),
        label: "Me",
        key: `me-${userId}`
      });
    }

    availableUsers?.forEach((user, idx) => {
      const uid = user.userId || user.id;
      if (uid !== userId) {
        list.push({
          value: uid?.toString(),
          label: user.name || user.username || `User ${uid}`,
          key: `user-${uid}-${idx}`
        });
      }
    });

    return list;
  };

  const createdByOptions = getCreatedByOptions();
  const showCreatedByFilter = userRole !== "USER" && createdByOptions.length > 1;

  return (
    <div className={isMobile ? "bg-gray-50 border p-4 rounded-lg mb-4 space-y-3" : "mb-4"}>
      {/* Filters Section */}
      <div className={isMobile ? "space-y-3" : "flex flex-wrap gap-2"}>
        {/* Render each select dropdown */}
        {Object.entries(options).map(([key, list]) => (
          <select
            key={key}
            value={filters[key] || ""}
            onChange={(e) => handleFilter(key, e.target.value)}
            className={isMobile ? mobileClasses : desktopClasses}
          >
            {list.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {/* Created By Filter (visible for Admin/Director) */}
        {showCreatedByFilter && (
          <select
            value={filters.createdBy || ""}
            onChange={(e) => handleFilter("createdBy", e.target.value)}
            className={isMobile ? mobileClasses : desktopClasses}
          >
            {createdByOptions.map((opt) => (
              <option key={opt.key} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className={`${
              isMobile
                ? "w-full justify-center gap-2"
                : "text-sm gap-1"
            } text-red-600 border border-red-500 px-3 py-2 rounded hover:bg-red-50 transition-colors flex items-center`}
          >
            <X size={isMobile ? 16 : 14} />
            {isMobile ? "Clear All Filters" : "Clear"}
          </button>
        )}
      </div>

      {/* Auto Apply Indicator */}
      {autoApply && hasActiveFilters && (
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Filters applied automatically
        </div>
      )}
    </div>
  );
};

export default LeadFilters;
