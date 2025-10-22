// Property Service - Reusable for Web & Mobile
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class PropertyService {
  static async getPropertiesByCompany(companyId, page = 0, size = 10, roleParams = {}) {
    try {
      // Use the existing paged endpoint with role and userId parameters
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_PAGED(companyId), {
        params: { 
          page, 
          size, 
          role: roleParams.role,
          userId: roleParams.userId
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load properties' };
    }
  }

  static async getPropertyById(companyId, propertyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_BY_ID(companyId, propertyId));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load property' };
    }
  }

  static async createProperty(companyId, propertyData) {
    try {
      const response = await axios.post(API_ENDPOINTS.PROPERTIES.CREATE(companyId), propertyData);
      
      // Check if response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          message: 'Property created successfully'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Failed to create property'
        };
      }
    } catch (error) {

      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                            error.response.data || 
                            `Server error: ${error.response.status}`;
        return {
          success: false,
          error: errorMessage
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'Network error. Please check your connection.'
        };
      } else {
        // Other error
        return {
          success: false,
          error: error.message || 'Failed to create property'
        };
      }
    }
  }

  static async updateProperty(companyId, propertyId, propertyData) {
    try {
      const response = await axios.put(API_ENDPOINTS.PROPERTIES.UPDATE(companyId, propertyId), propertyData);
      return { success: true, data: response.data, message: 'Property updated successfully' };
    } catch (error) {

      return { success: false, error: error.response?.data?.message || 'Failed to update property' };
    }
  }

  static async updatePropertyCode(companyId, propertyId, externalPropertyId) {
    try {
      console.log('🔗 API Call: PUT /api/companies/' + companyId + '/properties/' + propertyId + '/property-code');
      console.log('📤 Request Body:', { externalPropertyId });
      
      const response = await axios.put(`/api/companies/${companyId}/properties/${propertyId}/property-code`, {
        externalPropertyId: externalPropertyId
      });
      
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', response.data);
      
      return { success: true, data: response.data, message: 'Property code updated successfully' };
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('❌ Error Response:', error.response?.data);
      console.error('❌ Error Status:', error.response?.status);
      
      return { success: false, error: error.response?.data?.message || 'Failed to update property code' };
    }
  }

  static async deleteProperty(companyId, propertyId) {
    try {
      await axios.delete(API_ENDPOINTS.PROPERTIES.DELETE(companyId, propertyId));
      return { success: true, message: 'Property deleted successfully' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete property' };
    }
  }

  static async getPropertiesByStatus(companyId, status) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_BY_STATUS(companyId, status));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load properties by status' };
    }
  }

  static async getPropertiesByType(companyId, type) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_BY_TYPE(companyId, type));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load properties by type' };
    }
  }

  static async getPropertiesBySector(companyId, sector) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_BY_SECTOR(companyId, sector));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load properties by sector' };
    }
  }

  static async getPropertiesBySource(companyId, source) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_BY_SOURCE(companyId, source));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load properties by source' };
    }
  }

  static async getPropertiesByBHK(companyId, bhk) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_BY_BHK(companyId, bhk));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load properties by BHK' };
    }
  }

  static async getPropertiesByOwnerContact(companyId, contact) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_BY_OWNER_CONTACT(companyId, contact));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load properties by contact' };
    }
  }

  static async getPropertyName(companyId, propertyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_NAME(companyId, propertyId));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to get property name' };
    }
  }

  static async getPropertyCount(companyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_COUNT(companyId));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to get property count' };
    }
  }

  static async getPropertyCountByUser(companyId, userId) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.COUNT_BY_USER(companyId, userId));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to get property count by user' };
    }
  }

  static async searchProperties(companyId, searchParams = {}, pageable = {}) {
    try {
      // Check if token exists
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please login again.'
        };
      }
      
      const params = {
        // Add pagination
        page: pageable.page || 0,
        size: pageable.size || 10,
        
        // Add role-based parameters
        role: searchParams.role,
        userId: searchParams.userId
      };
      
      // Handle multiple keywords - send each keyword as a separate parameter
      if (searchParams.keywords && searchParams.keywords.trim()) {
        const keywords = searchParams.keywords.trim().split(/\s+/);
        keywords.forEach(keyword => {
          if (keyword.trim()) {
            // Add each keyword as a separate parameter using URLSearchParams
            if (!params.keywords) {
              params.keywords = [];
            }
            params.keywords.push(keyword.trim());
          }
        });
      }
      
      // Handle budget range - improved parsing
      if (searchParams.budgetRange) {
        const [minPrice, maxPrice] = searchParams.budgetRange.split('-').map(Number);
        if (!isNaN(minPrice)) params.minPrice = minPrice;
        if (!isNaN(maxPrice)) params.maxPrice = maxPrice;
      }
      
      // Add other filters with proper validation
      if (searchParams.status && searchParams.status.trim()) {
        params.status = searchParams.status.trim();
      }
      
      if (searchParams.type && searchParams.type.trim()) {
        params.type = searchParams.type.trim();
      }
      
      if (searchParams.bhk && searchParams.bhk.trim()) {
        params.bhk = searchParams.bhk.trim();
      }
      
      if (searchParams.source && searchParams.source.trim()) {
        params.source = searchParams.source.trim();
      }
      
      // Handle createdBy filter - map to createdByName for API
      if (searchParams.createdBy && searchParams.createdBy.trim()) {
        params.createdByName = searchParams.createdBy.trim();
      }

      // Remove any undefined or null values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      // Build URL with multiple keywords as separate parameters
      let url = API_ENDPOINTS.PROPERTIES.SEARCH_PAGED(companyId);
      const urlParams = new URLSearchParams();
      
      // Add all parameters except keywords
      Object.keys(params).forEach(key => {
        if (key !== 'keywords') {
          urlParams.append(key, params[key]);
        }
      });
      
      // Add keywords as separate parameters
      if (params.keywords && Array.isArray(params.keywords)) {
        params.keywords.forEach(keyword => {
          urlParams.append('keywords', keyword);
        });
      }
      
      // Construct final URL
      const finalUrl = `${url}?${urlParams.toString()}`;
      
      
      
      // Use the constructed URL directly
      const response = await axios.get(finalUrl);
      return { success: true, data: response.data };
  
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search properties',
      };
    }
  }
  

  static async addRemarkToProperty(companyId, propertyId, remarkData) {
    try {
      const response = await axios.post(API_ENDPOINTS.PROPERTIES.ADD_REMARK(companyId, propertyId), remarkData);
      return { success: true, data: response.data, message: 'Remark added successfully' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add remark' };
    }
  }

  static async getRemarksByPropertyId(companyId, propertyId) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_REMARKS(companyId, propertyId));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load remarks' };
    }
  }

  static async getPropertiesByCreatedBy(companyId, userId, pageable = {}) {
    try {
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.GET_BY_CREATED_BY(companyId, userId), {
        params: pageable
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load created properties' };
    }
  }

  // Reminder functionality - Only for RENT_OUT properties
  static async setReminderForRentOutProperty(companyId, propertyId, reminderDate) {
    try {
      const response = await axios.post(
        `/api/companies/${companyId}/properties/${propertyId}/set-reminder`,
        { reminderDate }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data || 'Failed to set reminder' 
      };
    }
  }
}
