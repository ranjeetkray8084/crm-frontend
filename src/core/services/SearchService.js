import { PropertyService } from './property.service';
import { LeadService } from './lead.service';
import { UserService } from './user.service';

export class SearchService {
  // Search Keys Configuration
  static SEARCH_KEYS = {
    PROPERTY: {
      key: 'property',
      label: 'Property Search',
      hindi: 'प्रॉपर्टी खोज',
      fields: ['propertyName', 'location', 'type', 'bhk', 'price', 'status', 'description'],
      filters: ['location', 'type', 'bhk', 'priceRange', 'status', 'amenities'],
      suggestions: ['Gurgaon', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Noida']
    },
    LEAD: {
      key: 'lead',
      label: 'Lead Search',
      hindi: 'लीड खोज',
      fields: ['name', 'phone', 'email', 'status', 'source', 'notes'],
      filters: ['status', 'source', 'dateRange', 'assignedTo'],
      suggestions: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
    },
    USER: {
      key: 'user',
      label: 'User Search',
      hindi: 'यूजर खोज',
      fields: ['name', 'email', 'phone', 'role', 'department'],
      filters: ['role', 'department', 'status', 'company'],
      suggestions: ['DEVELOPER', 'DIRECTOR', 'ADMIN', 'USER']
    }
  };

  // Search Filters Configuration
  static SEARCH_FILTERS = {
    location: {
      label: 'Location',
      hindi: 'स्थान',
      type: 'select',
      options: ['Gurgaon', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad'],
      multiSelect: true
    },
    type: {
      label: 'Property Type',
      hindi: 'प्रॉपर्टी प्रकार',
      type: 'select',
      options: ['Apartment', 'Flat', 'Villa', 'Plot', 'Commercial', 'House', 'Office', 'Shop'],
      multiSelect: true
    },
    bhk: {
      label: 'BHK',
      hindi: 'BHK',
      type: 'select',
      options: ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', '6BHK+'],
      multiSelect: true
    },
    priceRange: {
      label: 'Price Range',
      hindi: 'कीमत रेंज',
      type: 'range',
      min: 0,
      max: 100000000,
      step: 100000,
      format: 'currency'
    },
    status: {
      label: 'Status',
      hindi: 'स्थिति',
      type: 'select',
      options: ['Available', 'Sold', 'Rented', 'Under Construction', 'Ready to Move'],
      multiSelect: true
    },
    amenities: {
      label: 'Amenities',
      hindi: 'सुविधाएं',
      type: 'checkbox',
      options: ['Parking', 'Garden', 'Gym', 'Swimming Pool', 'Security', 'Lift', 'Power Backup', 'Water Supply'],
      multiSelect: true
    }
  };

  // Search Suggestions based on user input
  static getSearchSuggestions(input, searchKey, userContext) {
    const suggestions = [];
    const lowerInput = input.toLowerCase();

    if (searchKey === 'property') {
      // Location suggestions
      if (lowerInput.includes('gurgaon') || lowerInput.includes('gurugram')) {
        suggestions.push('Gurgaon properties', 'Gurugram apartments', 'Gurgaon commercial');
      }
      if (lowerInput.includes('delhi')) {
        suggestions.push('Delhi properties', 'Delhi apartments', 'Delhi commercial');
      }
      if (lowerInput.includes('mumbai')) {
        suggestions.push('Mumbai properties', 'Mumbai apartments', 'Mumbai commercial');
      }

      // BHK suggestions
      if (lowerInput.includes('bhk') || lowerInput.includes('bedroom')) {
        suggestions.push('2BHK apartments', '3BHK apartments', '4BHK apartments');
      }

      // Price suggestions
      if (lowerInput.includes('lakh') || lowerInput.includes('crore') || lowerInput.includes('price')) {
        suggestions.push('Under 50 lakhs', '50 lakhs to 1 crore', '1 crore to 2 crores');
      }

      // Type suggestions
      if (lowerInput.includes('apartment') || lowerInput.includes('flat')) {
        suggestions.push('2BHK apartments', '3BHK apartments', 'Premium apartments');
      }
      if (lowerInput.includes('villa') || lowerInput.includes('house')) {
        suggestions.push('Independent villas', 'Luxury villas', 'Budget villas');
      }
      if (lowerInput.includes('commercial')) {
        suggestions.push('Office spaces', 'Retail shops', 'Commercial plots');
      }
    }

    if (searchKey === 'lead') {
      // Status suggestions
      if (lowerInput.includes('new') || lowerInput.includes('fresh')) {
        suggestions.push('New leads', 'Fresh inquiries', 'Recent leads');
      }
      if (lowerInput.includes('contacted') || lowerInput.includes('called')) {
        suggestions.push('Contacted leads', 'Called leads', 'Follow-up leads');
      }
      if (lowerInput.includes('qualified') || lowerInput.includes('interested')) {
        suggestions.push('Qualified leads', 'Interested leads', 'Hot leads');
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // Perform search based on key and filters
  static async performSearch(searchKey, searchParams, userContext) {
    try {
      let results = { data: [], total: 0, filters: {} };

      switch (searchKey) {
        case 'property':
          results = await this.searchProperties(searchParams, userContext);
          break;
        case 'lead':
          results = await this.searchLeads(searchParams, userContext);
          break;
        case 'user':
          results = await this.searchUsers(searchParams, userContext);
          break;
        default:
          throw new Error('Invalid search key');
      }

      return {
        success: true,
        data: results.data,
        total: results.total,
        filters: results.filters,
        searchKey: searchKey,
        searchParams: searchParams
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: [],
        total: 0
      };
    }
  }

  // Property search implementation
  static async searchProperties(searchParams, userContext) {
    const { query, filters = {}, page = 0, size = 10 } = searchParams;
    
    // Build search parameters based on user role
    let searchOptions = {
      keywords: query || '',
      page: page,
      size: size,
      role: userContext.role,
      userId: userContext.userId
    };

    // Add filters
    if (filters.location) {
      searchOptions.location = Array.isArray(filters.location) ? filters.location.join(',') : filters.location;
    }
    if (filters.type) {
      searchOptions.type = Array.isArray(filters.type) ? filters.type.join(',') : filters.type;
    }
    if (filters.bhk) {
      searchOptions.bhk = Array.isArray(filters.bhk) ? filters.bhk.join(',') : filters.bhk;
    }
    if (filters.priceRange) {
      searchOptions.budgetRange = filters.priceRange;
    }
    if (filters.status) {
      searchOptions.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
    }

    // Perform search based on role
    let searchResult;
    switch (userContext.role) {
      case 'DEVELOPER':
        searchResult = await PropertyService.searchAllProperties(searchOptions);
        break;
      case 'DIRECTOR':
        searchResult = await PropertyService.searchProperties(userContext.companyId, searchOptions);
        break;
      case 'ADMIN':
        searchResult = await PropertyService.searchPropertiesByAdmin(userContext.companyId, userContext.userId, searchOptions);
        break;
      case 'USER':
        searchResult = await PropertyService.searchPropertiesByCreatedBy(userContext.companyId, userContext.userId, searchOptions);
        break;
      default:
        searchResult = { success: false, data: [] };
    }

    if (searchResult.success) {
      return {
        data: searchResult.data?.content || searchResult.data || [],
        total: searchResult.data?.totalElements || searchResult.data?.length || 0,
        filters: this.generateFilterSummary(filters)
      };
    }

    return { data: [], total: 0, filters: {} };
  }

  // Lead search implementation
  static async searchLeads(searchParams, userContext) {
    const { query, filters = {}, page = 0, size = 10 } = searchParams;
    
    let searchOptions = {
      search: query || '',
      page: page,
      size: size,
      role: userContext.role,
      userId: userContext.userId
    };

    // Add filters
    if (filters.status) {
      searchOptions.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
    }
    if (filters.source) {
      searchOptions.source = Array.isArray(filters.source) ? filters.source.join(',') : filters.source;
    }
    if (filters.dateRange) {
      searchOptions.dateRange = filters.dateRange;
    }

    // Perform search based on role
    let searchResult;
    switch (userContext.role) {
      case 'DEVELOPER':
        searchResult = await LeadService.searchAllLeads(searchOptions);
        break;
      case 'DIRECTOR':
        searchResult = await LeadService.searchLeads(userContext.companyId, searchOptions);
        break;
      case 'ADMIN':
        searchResult = await LeadService.searchLeadsVisibleToAdmin(userContext.companyId, userContext.userId, searchOptions);
        break;
      case 'USER':
        searchResult = await LeadService.searchLeadsCreatedOrAssigned(userContext.companyId, userContext.userId, searchOptions);
        break;
      default:
        searchResult = { success: false, data: [] };
    }

    if (searchResult.success) {
      return {
        data: searchResult.data?.content || searchResult.data || [],
        total: searchResult.data?.totalElements || searchResult.data?.length || 0,
        filters: this.generateFilterSummary(filters)
      };
    }

    return { data: [], total: 0, filters: {} };
  }

  // User search implementation
  static async searchUsers(searchParams, userContext) {
    const { query, filters = {}, page = 0, size = 10 } = searchParams;
    
    let searchOptions = {
      search: query || '',
      page: page,
      size: size,
      role: userContext.role,
      userId: userContext.userId
    };

    // Add filters
    if (filters.role) {
      searchOptions.role = Array.isArray(filters.role) ? filters.role.join(',') : filters.role;
    }
    if (filters.department) {
      searchOptions.department = Array.isArray(filters.department) ? filters.department.join(',') : filters.department;
    }

    // Perform search based on role
    let searchResult;
    switch (userContext.role) {
      case 'DEVELOPER':
        searchResult = await UserService.searchAllUsers(searchOptions);
        break;
      case 'DIRECTOR':
        searchResult = await UserService.searchUsersByCompany(userContext.companyId, searchOptions);
        break;
      case 'ADMIN':
        searchResult = await UserService.searchUsersByAdmin(userContext.userId, searchOptions);
        break;
      default:
        searchResult = { success: false, data: [] };
    }

    if (searchResult.success) {
      return {
        data: searchResult.data?.content || searchResult.data || [],
        total: searchResult.data?.totalElements || searchResult.data?.length || 0,
        filters: this.generateFilterSummary(filters)
      };
    }

    return { data: [], total: 0, filters: {} };
  }

  // Generate filter summary for display
  static generateFilterSummary(filters) {
    const summary = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        summary[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    });

    return summary;
  }

  // Get search history for user
  static getSearchHistory(userId) {
    const historyKey = `search_history_${userId}`;
    const history = sessionStorage.getItem(historyKey) || localStorage.getItem(historyKey);
    return history ? JSON.parse(history) : [];
  }

  // Save search to history
  static saveSearchToHistory(userId, searchKey, searchParams) {
    const historyKey = `search_history_${userId}`;
    const history = this.getSearchHistory(userId);
    
    const searchEntry = {
      id: Date.now(),
      searchKey: searchKey,
      searchParams: searchParams,
      timestamp: new Date().toISOString()
    };

    // Add to beginning of history
    history.unshift(searchEntry);
    
    // Keep only last 20 searches
    const limitedHistory = history.slice(0, 20);
    
    sessionStorage.setItem(historyKey, JSON.stringify(limitedHistory));
  }

  // Clear search history
  static clearSearchHistory(userId) {
    const historyKey = `search_history_${userId}`;
    sessionStorage.removeItem(historyKey);
    localStorage.removeItem(historyKey);
  }

  // Get popular searches
  static getPopularSearches() {
    return [
      '2BHK apartments in Gurgaon',
      '3BHK apartments under 50 lakhs',
      'Commercial properties in Delhi',
      'Villas in Mumbai',
      'New leads this month',
      'Qualified leads',
      'Team performance',
      'Property analytics'
    ];
  }

  // Export search results
  static exportSearchResults(results, format = 'csv') {
    if (!results.data || results.data.length === 0) {
      return null;
    }

    if (format === 'csv') {
      return this.convertToCSV(results.data);
    } else if (format === 'json') {
      return JSON.stringify(results.data, null, 2);
    }

    return null;
  }

  // Convert data to CSV format
  static convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }
}
