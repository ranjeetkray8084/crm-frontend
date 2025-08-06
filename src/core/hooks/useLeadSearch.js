import { useState, useCallback, useMemo } from 'react';

export const useLeadSearch = () => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTags, setSearchTags] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    budget: "",
    source: "",
    assignedTo: "",
    createdBy: "",
    dateRange: ""
  });
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [activeSearchParams, setActiveSearchParams] = useState(null);

  // Memoized search parameters
  const searchParams = useMemo(() => {
    const params = {};

    // Add search tags and current search term as combined query
    const allSearchTerms = [...searchTags];
    if (searchTerm.trim()) {
      allSearchTerms.push(searchTerm.trim());
    }

    if (allSearchTerms.length > 0) {
      params.query = allSearchTerms.join(' ');
    }

    // Add filters if they have values
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        // Map frontend filter names to backend parameter names
        switch(key) {
          case 'assignedTo':
            params.assignedTo = value.trim();
            break;
          case 'createdBy':
            params.createdBy = value.trim();
            break;
          case 'status':
            params.status = value.trim();
            break;
          case 'source':
            params.source = value.trim();
            break;
          case 'budget':
            params.budget = value.trim();
            break;

          case 'dateRange':
            params.dateRange = value.trim();
            break;
          default:
            params[key] = value.trim();
        }
      }
    });

    return params;
  }, [searchTerm, searchTags, filters]);

  // Check if any search/filter is active
  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() || searchTags.length > 0 || Object.values(filters).some(value => value && value.trim());
  }, [searchTerm, searchTags, filters]);

  // Update individual filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Clear all filters and search
  const clearAll = useCallback(() => {
    setSearchTerm("");
    setSearchTags([]);
    setFilters({
      status: "",
      budget: "",
      source: "",
      assignedTo: "",
      createdBy: "",
      dateRange: ""
    });
    setIsSearchActive(false);
    setActiveSearchParams(null);
  }, []);

  // Clear only search term
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchTags([]);
  }, []);

  // Add search tag
  const addSearchTag = useCallback((tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !searchTags.includes(trimmedTag)) {
      setSearchTags(prev => [...prev, trimmedTag]);
      setSearchTerm(""); // Clear input after adding tag
    }
  }, [searchTags]);

  // Remove search tag
  const removeSearchTag = useCallback((tagToRemove) => {
    setSearchTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  // Handle Enter key to add tag
  const handleSearchEnter = useCallback(() => {
    if (searchTerm.trim()) {
      addSearchTag(searchTerm);
    }
  }, [searchTerm, addSearchTag]);

  // Clear only filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: "",
      budget: "",
      source: "",
      assignedTo: "",
      createdBy: "",
      dateRange: ""
    });
  }, []);

  // Apply search/filters
  const applySearch = useCallback(() => {
    if (hasActiveFilters) {
      setActiveSearchParams(searchParams);
      setIsSearchActive(true);
    } else {
      setActiveSearchParams(null);
      setIsSearchActive(false);
    }
  }, [hasActiveFilters, searchParams]);

  // Auto-apply search when parameters change (debounced effect can be added)
  const autoApplySearch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      applySearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [applySearch]);

  // Apply quick filters
  const applyQuickFilters = useCallback((quickFilters) => {
    // Clear existing filters first
    setSearchTerm("");
    setSearchTags([]);
    setFilters({
      status: "",
      budget: "",
      source: "",
      assignedTo: "",
      createdBy: "",
      dateRange: ""
    });

    // Apply new filters
    setFilters(prev => ({
      ...prev,
      ...quickFilters
    }));

    // Apply search immediately
    const newParams = { ...quickFilters };
    setActiveSearchParams(newParams);
    setIsSearchActive(true);

    return newParams;
  }, []);

  // Get budget range display text
  const getBudgetRangeText = useCallback((budgetValue) => {
    const budgetRanges = {
      "0-500000": "Below ₹5 Lakh",
      "500000-1000000": "₹5-10 Lakh",
      "1000000-2000000": "₹10-20 Lakh",
      "2000000-5000000": "₹20-50 Lakh",
      "5000000-10000000": "₹50L-1 Crore",
      "10000000-99999999": "Above ₹1 Crore"
    };
    return budgetRanges[budgetValue] || budgetValue;
  }, []);

  // Get active filters summary for display
  const getActiveFiltersSummary = useCallback((currentUserId = null, availableUsers = []) => {
    const summary = [];

    if (searchTags.length > 0) {
      summary.push(`Search Tags: ${searchTags.join(', ')}`);
    }

    if (searchTerm.trim()) {
      summary.push(`Search: "${searchTerm.trim()}"`);
    }

    if (filters.status) {
      summary.push(`Status: ${filters.status}`);
    }

    if (filters.budget) {
      summary.push(`Budget: ${getBudgetRangeText(filters.budget)}`);
    }

    if (filters.source) {
      summary.push(`Source: ${filters.source}`);
    }

    if (filters.assignedTo) {
      summary.push(`Assigned: ${filters.assignedTo}`);
    }

    if (filters.createdBy) {
      let createdByLabel = filters.createdBy;
      if (currentUserId && filters.createdBy === currentUserId.toString()) {
        createdByLabel = "Me";
      } else if (availableUsers.length > 0) {
        const user = availableUsers.find(u => u.id?.toString() === filters.createdBy);
        if (user) {
          createdByLabel = user.name || user.username || `User ${user.id}`;
        }
      }
      summary.push(`Created By: ${createdByLabel}`);
    }

    return summary;
  }, [searchTerm, searchTags, filters, getBudgetRangeText]);

  return {
    // State
    searchTerm,
    searchTags,
    filters,
    isSearchActive,
    activeSearchParams,
    hasActiveFilters,

    // Computed
    searchParams,
    getActiveFiltersSummary,
    getBudgetRangeText,

    // Actions
    setSearchTerm,
    addSearchTag,
    removeSearchTag,
    handleSearchEnter,
    updateFilter,
    updateFilters,
    clearAll,
    clearSearch,
    clearFilters,
    applySearch,
    autoApplySearch,
    applyQuickFilters
  };
};