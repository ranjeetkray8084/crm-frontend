// Company Hook - Refactored for Web & Mobile
import { useState, useEffect, useCallback } from 'react';
import { CompanyService } from '../services/company.service';
import { customAlert } from '../utils/alertUtils'; // Assuming you have this for alerts

export const useCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // STEP 1: Create a single, generic helper for loading companies.
  // This handles both "all companies" and "my companies".
  const fetchCompanies = useCallback(async (fetcher, errorMsg) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (result.success) {
        setCompanies(result.data);
      } else {
        setError(result.error);
        customAlert(`❌ ${result.error || errorMsg}`);
      }
    } catch (err) {
      setError(errorMsg);
      customAlert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Functions to load companies now use the generic helper.
  const loadAllCompanies = useCallback(() => 
    fetchCompanies(CompanyService.getAllCompanies, 'Failed to load companies'), 
    [fetchCompanies]
  );

  const loadMyCompanies = useCallback(() => 
    fetchCompanies(CompanyService.getMyCompanies, 'Failed to load your companies'), 
    [fetchCompanies]
  );

  // STEP 2: Create a single helper function for all company actions.
  // This removes duplicate try...catch blocks and centralizes logic.
  const executeCompanyAction = useCallback(async (apiCall, successMsg, errorMsg, shouldReload = true) => {
    setLoading(true); // Set loading for the action
    try {
      const result = await apiCall();
      if (result.success) {
        customAlert(`✅ ${successMsg}`);
        if (shouldReload) {
          await loadAllCompanies(); // Reload the list
        }
        return { success: true, message: result.message, data: result.data };
      } else {
        customAlert(`❌ ${result.error || errorMsg}`);
        return { success: false, error: result.error };
      }
    } catch (err) {
      customAlert(`❌ ${errorMsg}`);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadAllCompanies]); // Depends on the memoized loadAllCompanies

  // STEP 3: All action functions are now clean, one-line calls to the helper.
  const addCompany = (companyData) =>
    executeCompanyAction(
      () => CompanyService.addCompany(companyData),
      'Company added successfully',
      'Failed to add company'
    );

  const deleteCompany = (companyId) =>
    executeCompanyAction(
      () => CompanyService.deleteCompany(companyId),
      'Company deleted successfully',
      'Failed to delete company'
    );

  const revokeCompany = (companyId) =>
    executeCompanyAction(
      () => CompanyService.revokeCompany(companyId),
      'Company revoked successfully',
      'Failed to revoke company'
    );

  const unrevokeCompany = (companyId) =>
    executeCompanyAction(
      () => CompanyService.unrevokeCompany(companyId),
      'Company activated successfully',
      'Failed to activate company'
    );

  // This function doesn't modify state, so it can remain separate.
  const getCompanyName = async (companyId) => {
    try {
      return await CompanyService.getCompanyName(companyId);
    } catch (err) {
      return { success: false, error: 'Failed to get company name' };
    }
  };
  
  // By default, load all companies when the hook is first used.
  useEffect(() => {
    loadAllCompanies();
  }, [loadAllCompanies]);

  return {
    companies,
    loading,
    error,
    loadAllCompanies,
    loadMyCompanies,
    addCompany,
    deleteCompany,
    revokeCompany,
    unrevokeCompany,
    getCompanyName
  };
};
