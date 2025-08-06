import { useState, useCallback, useMemo } from 'react';

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
    const params = {
      keywords: searchTags.join(' '),
      ...filters
    };
    
    // Remove empty values
    Object.keys(params).forEach(key => {
      if (!params[key] || params[key].trim() === '') {
        delete params[key];
      }
    });
    
    return params;
  }, [searchTags, filters]);

  const activeSearchParams = useMemo(() => {
    return isSearchActive ? searchParams : null;
  }, [isSearchActive, searchParams]);

  // Actions
  const handleSearchEnter = useCallback(() => {
    if (searchTerm.trim() && !searchTags.includes(searchTerm.trim())) {
      setSearchTags(prev => [...prev, searchTerm.trim()]);
      setSearchTerm('');
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
    console.log('applySearch called - triggering search');
    setSearchTrigger(prev => prev + 1);
  }, []);

  const getActiveFiltersSummary = useCallback(() => {
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
      activeFilters.push(`Created By: ${filters.createdBy}`);
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