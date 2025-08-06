import { useState, useCallback, useMemo } from 'react';
import { PropertyService } from '../services/property.service';
import { customAlert } from '../utils/alertUtils';



/**
 * Applies role-based visibility rules for properties
 * - Director: Can see unit and owner number for all properties
 * - Admin: Can see properties they created and properties assigned to users
 * - User: Can only see properties they created
 * Note: This function only adds metadata for UI display, server should handle filtering
 */
const applyVisibilityRules = (properties, role, userId) => {
  console.log('🔍 Applying visibility rules:', { role, userId, propertiesCount: properties.length });
  
  return properties.map(property => {
    const propertyCreatedById = property.createdById || property.createdBy?.id;
    const isOwner = String(propertyCreatedById) === String(userId);
    
    console.log('🏠 Property check:', {
      propertyId: property.id || property.propertyId,
      propertyName: property.propertyName,
      propertyCreatedById,
      currentUserId: userId,
      isOwner,
      role
    });
    
    // Role-based visibility logic for UI display
    let canViewPrivateFields = false;
    
    switch (role) {
      case 'DIRECTOR':
        // Director can see unit and owner number for all properties
        canViewPrivateFields = true;
        break;
        
      case 'ADMIN':
        // Admin can see properties they created and assigned properties
        canViewPrivateFields = isOwner || property.assignedToUserId === userId;
        break;
        
      case 'USER':
      default:
        // User can only see properties they created
        canViewPrivateFields = isOwner;
        break;
    }

    return {
      ...property,
      _isOwner: isOwner,
      _canViewPrivateFields: canViewPrivateFields,
    };
  });
};

export const useProperties = (companyId, userId, userRole) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const userInfo = useMemo(() => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userIdFromStorage = localStorage.getItem('userId');
    const finalUserId = userId || localUser.userId || localUser.id || (userIdFromStorage ? parseInt(userIdFromStorage) : null);

    console.log('👤 User info debug:', {
      propUserId: userId,
      localUserUserId: localUser.userId,
      localUserId: localUser.id,
      userIdFromStorage,
      finalUserId,
      role: userRole || localUser.role,
      companyId: companyId || localUser.companyId
    });

    return {
      companyId: companyId || localUser.companyId,
      userId: finalUserId,
      role: userRole || localUser.role,
    };
  }, [companyId, userId, userRole]);

  const loadProperties = useCallback(
    async (page = 0, size = 10, searchParams = null) => {
      if (!userInfo.companyId) {
        setError('Company ID is missing.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let result;
        
        // Prepare role-based parameters
        const roleParams = {
          userId: userInfo.userId,
          role: userInfo.role
        };
        
        if (searchParams && Object.keys(searchParams).some(key => searchParams[key])) {
          // Use search API if filters are applied
          result = await PropertyService.searchProperties(
            userInfo.companyId, 
            { ...searchParams, ...roleParams }, 
            { page, size }
          );
        } else {
          // Use regular API if no filters
          result = await PropertyService.getPropertiesByCompany(userInfo.companyId, page, size, roleParams);
        }

        if (result.success) {
          const propertiesData = result.data.content || result.data || [];
          console.log('📊 Raw properties from API:', propertiesData.length, propertiesData);
          
          const propertiesWithVisibility = applyVisibilityRules(propertiesData, userInfo.role, userInfo.userId);
          
          console.log('✅ Properties with visibility rules applied:', propertiesWithVisibility.length, propertiesWithVisibility);

          // Don't filter here - let the server handle pagination
          // The visibility rules are applied for UI display purposes only
          setProperties(propertiesWithVisibility);
          
          const paginationData = {
            page: result.data.number ?? page,
            size: result.data.size ?? size,
            totalElements: result.data.totalElements ?? propertiesData.length,
            totalPages: result.data.totalPages ?? Math.ceil((result.data.totalElements || propertiesData.length) / size),
          };
          
          console.log('📄 Setting pagination data:', paginationData);
          console.log('📄 Raw API pagination:', {
            number: result.data.number,
            size: result.data.size,
            totalElements: result.data.totalElements,
            totalPages: result.data.totalPages
          });
          
          setPagination(paginationData);
        } else {
          throw new Error(result.error || 'Failed to fetch data.');
        }
      } catch (err) {
        const errorMsg = err.message || 'An unknown error occurred while fetching properties.';
        setError(errorMsg);
        customAlert(`❌ ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    },
    [userInfo]
  );

  const executeApiCall = async (apiCall, successMsg, errorMsg) => {
    if (!userInfo.companyId) {
      customAlert('Company ID is missing.');
      return { success: false, error: 'Company ID missing' };
    }
    try {
      const result = await apiCall();
      if (result.success) {
        customAlert(`✅ ${successMsg}`);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || errorMsg);
      }
    } catch (err) {
      customAlert(`❌ ${err.message || errorMsg}`);
      return { success: false, error: err.message };
    }
  };

  const createProperty = (data) =>
    executeApiCall(
      () => PropertyService.createProperty(userInfo.companyId, data),
      'Property created successfully',
      'Failed to create property'
    );

  const updateProperty = (id, data) =>
    executeApiCall(
      () => PropertyService.updateProperty(userInfo.companyId, id, data),
      'Property updated successfully',
      'Failed to update property'
    );

  const deleteProperty = (id) =>
    executeApiCall(
      () => PropertyService.deleteProperty(userInfo.companyId, id),
      'Property deleted successfully',
      'Failed to delete property'
    );

  const addRemark = useCallback(
    async (propertyId, remarkData) => {
      if (!userInfo.userId) return { success: false, error: 'User ID is missing.' };
      const enrichedData = { ...remarkData, userId: userInfo.userId.toString() };

      return executeApiCall(
        () => PropertyService.addRemarkToProperty(userInfo.companyId, propertyId, enrichedData),
        'Remark added successfully',
        'Failed to add remark'
      );
    },
    [userInfo, executeApiCall]
  );

  const getRemarks = useCallback(
    async (propertyId) => {
      if (!userInfo.companyId) return { success: false, data: [], error: 'Company ID is missing.' };
      try {
        return await PropertyService.getRemarksByPropertyId(userInfo.companyId, propertyId);
      } catch (err) {
        console.error('Error in getRemarks:', err);
        return { success: false, data: [], error: 'Failed to get remarks' };
      }
    },
    [userInfo]
  );

  const searchProperties = useCallback(
    async (searchParams, page = 0, size = 10) => {
      return loadProperties(page, size, searchParams);
    },
    [loadProperties]
  );

  return {
    properties,
    loading,
    error,
    pagination,
    loadProperties,
    searchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    addRemark,
    getRemarks,
  };
};
