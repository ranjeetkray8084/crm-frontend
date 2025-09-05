import { useState, useCallback, useMemo, useEffect } from 'react';

export const usePropertySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTags, setSearchTags] = useState([]);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [filters, setFilters] = useState({
    budgetRange: '',
    status: '',
    type: '',
    bhk: '',
    source: '',
    createdBy: ''
  });

  // Derived state
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value && value.trim());
  }, [filters]);

  const isSearchActive = useMemo(() => {
    return searchTags.length > 0 || hasActiveFilters;
  }, [searchTags.length, hasActiveFilters]);

  const searchParams = useMemo(() => {
    const allKeywords = [...searchTags];
    if (searchTerm.trim()) {
      allKeywords.push(searchTerm.trim());
    }
    
    const params = {
      keywords: allKeywords.join(' '),
      ...filters
    };

    // Remove empty values and trim strings
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        delete params[key];
      } else if (typeof value === 'string') {
        params[key] = value.trim();
      }
    });

    return params;
  }, [searchTags, searchTerm, filters]);

  const activeSearchParams = useMemo(() => {
    return isSearchActive ? searchParams : null;
  }, [isSearchActive, searchParams]);

  // Note: Auto-trigger removed to prevent duplicate API calls
  // The component handles triggering search when needed

  // Actions
  const handleSearchEnter = useCallback(() => {
    if (searchTerm.trim()) {
      // Split by spaces and add each word as a separate tag
      const keywords = searchTerm.trim().split(/\s+/);
      const newTags = keywords.filter(keyword => 
        keyword.trim() && !searchTags.includes(keyword.trim())
      );
      
      if (newTags.length > 0) {
        setSearchTags(prev => [...prev, ...newTags]);
        setSearchTerm('');
      }
    }
  }, [searchTerm, searchTags]);

  const removeSearchTag = useCallback((tagToRemove) => {
    setSearchTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchTags([]);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      budgetRange: '',
      status: '',
      type: '',
      bhk: '',
      source: '',
      createdBy: ''
    });
  }, []);

  const clearAll = useCallback(() => {
    clearSearch();
    clearFilters();
  }, [clearSearch, clearFilters]);

  const applySearch = useCallback(() => {
    // Trigger a search by updating the trigger state
    setSearchTrigger(prev => prev + 1);
  }, []);

  const getActiveFiltersSummary = useCallback((currentUserId = null, availableUsers = []) => {
    const activeFilters = [];

    if (searchTags.length > 0) {
      activeFilters.push(`Keywords: ${searchTags.join(', ')}`);
    }

    if (filters.budgetRange) {
      const [min, max] = filters.budgetRange.split('-');
      const formatPrice = (price) => {
        const num = parseInt(price);
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
        return `₹${num.toLocaleString()}`;
      };
      activeFilters.push(`Budget: ${formatPrice(min)} - ${formatPrice(max)}`);
    }

    if (filters.status) {
      const statusMap = {
        'AVAILABLE_FOR_SALE': 'For Sale',
        'AVAILABLE_FOR_RENT': 'For Rent',
        'RENT_OUT': 'Rented Out',
        'SOLD_OUT': 'Sold Out'
      };
      activeFilters.push(`Status: ${statusMap[filters.status] || filters.status}`);
    }

    if (filters.type) {
      activeFilters.push(`Type: ${filters.type}`);
    }

    if (filters.bhk) {
      activeFilters.push(`BHK: ${filters.bhk}`);
    }

    if (filters.source) {
      activeFilters.push(`Source: ${filters.source}`);
    }

    if (filters.createdBy) {
      let createdByLabel = filters.createdBy;
      if (currentUserId && filters.createdBy === currentUserId.toString()) {
        createdByLabel = "Me";
      } else if (availableUsers.length > 0) {
        const user = availableUsers.find(u => (u.id || u.userId)?.toString() === filters.createdBy);
        if (user) {
          createdByLabel = user.name || user.username || `User ${user.id || user.userId}`;
        }
      }
      activeFilters.push(`Created By: ${createdByLabel}`);
    }

    return activeFilters.join(', ');
  }, [searchTags, filters]);

  return {
    // State
    searchTerm,
    searchTags,
    filters,
    isSearchActive,
    hasActiveFilters,
    searchParams,
    activeSearchParams,
    searchTrigger,

    // Actions
    setSearchTerm,
    handleSearchEnter,
    removeSearchTag,
    updateFilter,
    clearSearch,
    clearFilters,
    clearAll,
    applySearch,
    getActiveFiltersSummary
  };
};