import { useState, useCallback, useMemo } from 'react';
import { PropertyService } from '../services/property.service';
import { customAlert } from '../utils/alertUtils';



// Visibility logic removed - server now handles all filtering and visibility

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
    const localUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    const userIdFromStorage = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    const finalUserId = userId || localUser.userId || localUser.id || (userIdFromStorage ? parseInt(userIdFromStorage) : null);


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

      // Debug logging
      console.log('🔍 Properties API Call:', {
        page,
        size,
        searchParams,
        hasSearchParams: searchParams && Object.keys(searchParams).some(key => {
          const value = searchParams[key];
          return value && value.toString().trim() !== '';
        })
      });

      try {
        let result;

        // Prepare role-based parameters
        const roleParams = {
          userId: userInfo.userId,
          role: userInfo.role
        };

        // Check if we have search parameters or filters
        const hasSearchParams = searchParams && Object.keys(searchParams).some(key => {
          const value = searchParams[key];
          return value && value.toString().trim() !== '';
        });

        if (hasSearchParams) {
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

          // Server handles all filtering and visibility - no client-side processing needed
          setProperties(propertiesData);

          const paginationData = {
            page: result.data.number ?? page,
            size: result.data.size ?? size,
            totalElements: result.data.totalElements ?? propertiesData.length,
            totalPages: result.data.totalPages ?? Math.ceil((result.data.totalElements || propertiesData.length) / size),
          };

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

  const executeApiCall = async (apiCall, successMsg, errorMsg, shouldReloadProperties = false) => {
    if (!userInfo.companyId) {
      customAlert('Company ID is missing.');
      return { success: false, error: 'Company ID missing' };
    }
    try {
      const result = await apiCall();
      if (result.success) {
        customAlert(`✅ ${successMsg}`);
        if (shouldReloadProperties) {
          // Don't show error if reload fails, just log it
          try {
            await loadProperties(0, 10);
          } catch (reloadError) {
    
          }
        }
        return { success: true, data: result.data };
      } else {
        const errText = (result.error || errorMsg || '').toString().replace(/^([❌⚠️✅]\s*)+/, '').trim();
        // Avoid double ❌ and handle non-unique messaging uniformly
        const nonUnique = /Query did not return a unique result/i.test(errText) || /unique result: 2 results/i.test(errText);
        if (nonUnique) {
          customAlert('⚠️ Created but duplicate match detected.');
          if (shouldReloadProperties) {
            try { await loadProperties(0, 10); } catch {}
          }
          return { success: true };
        }
        customAlert(`❌ ${errText}`);
        return { success: false, error: errText };
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data;
      const finalErrorMsg = (serverMsg || err.message || errorMsg || '').toString().replace(/^([❌⚠️✅]\s*)+/, '').trim();
      const nonUnique = /Query did not return a unique result/i.test(finalErrorMsg) || /unique result: 2 results/i.test(finalErrorMsg);
      if (nonUnique) {
        customAlert('⚠️ Created but duplicate match detected.');
        if (shouldReloadProperties) {
          try { await loadProperties(0, 10); } catch {}
        }
        return { success: true };
      }
      customAlert(`❌ ${finalErrorMsg}`);
      return { success: false, error: finalErrorMsg };
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

  const setReminder = useCallback(
    async (propertyId, reminderDate) => {
      if (!userInfo.companyId) {
        customAlert('Company ID is missing.');
        return { success: false, error: 'Company ID missing' };
      }

      return executeApiCall(
        () => PropertyService.setReminderForRentOutProperty(userInfo.companyId, propertyId, reminderDate),
        'Reminder set successfully',
        'Failed to set reminder',
        true // Reload properties after setting reminder
      );
    },
    [userInfo, executeApiCall]
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
    setReminder,
  };
};
