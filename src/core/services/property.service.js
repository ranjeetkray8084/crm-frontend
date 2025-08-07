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
      return { success: true, data: response.data, message: 'Property created successfully' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create property' };
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
      const params = {
        // Add pagination
        page: pageable.page || 0,
        size: pageable.size || 10,
        
        // Add role-based parameters
        role: searchParams.role,
        userId: searchParams.userId
      };
      
      // Handle keywords search - split by space and add multiple keywords
      if (searchParams.keywords && searchParams.keywords.trim()) {
        params.keywords = searchParams.keywords.trim();
      }
      
      // Handle budget range
      if (searchParams.budgetRange) {
        const [minPrice, maxPrice] = searchParams.budgetRange.split('-').map(Number);
        if (!isNaN(minPrice)) params.minPrice = minPrice;
        if (!isNaN(maxPrice)) params.maxPrice = maxPrice;
      }
      
      // Add other filters
      if (searchParams.status) params.status = searchParams.status;
      if (searchParams.type) params.type = searchParams.type;
      if (searchParams.bhk) params.bhk = searchParams.bhk;
      if (searchParams.source) params.source = searchParams.source;
      if (searchParams.createdBy) params.createdByName = searchParams.createdBy;

      // Use the existing search-paged endpoint with role and userId parameters
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.SEARCH_PAGED(companyId), { params });
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
}
