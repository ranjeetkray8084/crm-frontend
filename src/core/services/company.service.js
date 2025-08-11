// Company Service - Modern implementation
import axios from '../../legacy/api/axios';
import { API_ENDPOINTS } from './api.endpoints';

export class CompanyService {
  /**
   * Centralized error handler.
   * @param {Error} error - The error object from the catch block.
   * @param {string} fallbackMessage - A message to use if the API provides no error message.
   * @returns {{success: false, error: string}}
   */
  static handleError(error, fallbackMessage) {
    return {
      success: false,
      error: error?.response?.data?.message || fallbackMessage
    };
  }

  /**
   * A private helper method to execute API requests and handle responses/errors.
   * @param {Function} apiCall - A function that returns an Axios promise.
   * @param {string} fallbackErrorMessage - The fallback error message for this call.
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  static async _request(apiCall, fallbackErrorMessage) {
    try {
      const response = await apiCall();
      return {
        success: true,
        data: response?.data,
        message: response?.data?.message || 'Operation successful'
      };
    } catch (error) {
      return CompanyService.handleError(error, fallbackErrorMessage);
    }
  }

  /**
   * Get all companies.
   */
  static getAllCompanies() {
    return CompanyService._request(
      () => axios.get(API_ENDPOINTS.COMPANIES.GET_ALL),
      'Failed to load companies'
    );
  }

  /**
   * Get user's company.
   */
  static getMyCompany() {
    return CompanyService._request(
      () => axios.get(API_ENDPOINTS.COMPANIES.GET_MY),
      'Failed to load company'
    );
  }

  /**
   * Add a new company.
   */
  static addCompany(companyData) {
    return CompanyService._request(
      () => axios.post(API_ENDPOINTS.COMPANIES.ADD, companyData),
      'Failed to add company'
    );
  }

  /**
   * Delete a company.
   */
  static deleteCompany(companyId) {
    return CompanyService._request(
      () => axios.delete(API_ENDPOINTS.COMPANIES.DELETE(companyId)),
      'Failed to delete company'
    );
  }

  /**
   * Revoke a company's access.
   */
  static revokeCompany(companyId) {
    return CompanyService._request(
      () => axios.put(API_ENDPOINTS.COMPANIES.REVOKE(companyId)),
      'Failed to revoke company'
    );
  }

  /**
   * Unrevoke a company's access.
   */
  static unrevokeCompany(companyId) {
    return CompanyService._request(
      () => axios.put(API_ENDPOINTS.COMPANIES.UNREVOKE(companyId)),
      'Failed to activate company'
    );
  }

  /**
   * Get company name by ID.
   */
  static getCompanyName(companyId) {
    return CompanyService._request(
      () => axios.get(API_ENDPOINTS.COMPANIES.GET_NAME(companyId)),
      'Failed to get company name'
    );
  }
}