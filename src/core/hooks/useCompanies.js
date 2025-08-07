// Companies Hook - Modern implementation
import { useState, useEffect, useCallback } from 'react';
import { CompanyService } from '../services/company.service';
import { customAlert } from '../utils/alertUtils';

export const useCompanies = (role) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load companies based on user role
    const loadCompanies = useCallback(async () => {
        if (!role) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result;

            if (role === 'DEVELOPER') {
                // Developer can see all companies
                result = await CompanyService.getAllCompanies();
            } else {
                // Other roles see their own company
                result = await CompanyService.getMyCompany();
                // Convert single company to array for consistent handling
                if (result.success && result.data) {
                    result.data = [result.data];
                }
            }

            if (result.success) {
                setCompanies(result.data || []);
            } else {
                setError(result.error);
                customAlert('❌ ' + result.error);
            }
        } catch (err) {
            const errorMsg = 'Failed to load companies';
            setError(errorMsg);
            customAlert('❌ ' + errorMsg);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    // Helper function to handle all API actions
    const executeCompanyAction = useCallback(async (apiCall, successMsg, errorMsg, shouldReload = true) => {
        try {
            const result = await apiCall();

            if (result.success) {
                customAlert(`✅ ${successMsg}`);
                if (shouldReload) {
                    await loadCompanies();
                }
                return { success: true, message: result.message };
            } else {
                customAlert(`❌ ${result.error || errorMsg}`);
                return { success: false, error: result.error };
            }
        } catch (error) {
            customAlert(`❌ ${errorMsg}`);
            return { success: false, error: errorMsg };
        }
    }, [loadCompanies]);

    // Company management functions
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
            'Company access revoked successfully',
            'Failed to revoke company access'
        );

    const unrevokeCompany = (companyId) =>
        executeCompanyAction(
            () => CompanyService.unrevokeCompany(companyId),
            'Company access restored successfully',
            'Failed to restore company access'
        );

    // Get all companies (for dropdowns, etc.)
    const getAllCompanies = async () => {
        try {
            return await CompanyService.getAllCompanies();
        } catch (error) {
            return { success: false, error: 'Failed to load all companies' };
        }
    };

    return {
        companies,
        loading,
        error,
        loadCompanies,
        addCompany,
        deleteCompany,
        revokeCompany,
        unrevokeCompany,
        getAllCompanies
    };
};