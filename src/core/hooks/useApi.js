// useApi Hook - Generic API hook for Web & Mobile
import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call wrapper
  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (err) {
      const errorMsg = err.message || 'An unexpected error occurred';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // API call with loading state management
  const apiCallWithLoading = useCallback(async (apiFunction, ...args) => {
    const result = await apiCall(apiFunction, ...args);
    return result;
  }, [apiCall]);

  // API call without loading state (for background operations)
  const apiCallSilent = useCallback(async (apiFunction, ...args) => {
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred'
      };
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    apiCall,
    apiCallWithLoading,
    apiCallSilent,
    clearError
  };
};