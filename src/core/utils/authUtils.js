// Authentication Utilities - Platform Independent
import { AuthService } from '../services';

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return AuthService.isAuthenticated();
};

/**
 * Get current user from storage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  return AuthService.getCurrentUser();
};

/**
 * Get current user token
 * @returns {string|null}
 */
export const getToken = () => {
  return AuthService.getToken();
};

/**
 * Save user session
 * @param {Object} userData 
 * @param {string} token 
 */
export const saveSession = (userData, token) => {
  AuthService.saveSession(userData, token);
};

/**
 * Clear user session
 */
export const clearSession = () => {
  AuthService.logout();
};

/**
 * Check if user has specific role
 * @param {string} role 
 * @returns {boolean}
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

/**
 * Check if user is admin
 * @returns {boolean}
 */
export const isAdmin = () => {
  return hasRole('ADMIN');
};

/**
 * Check if user is director
 * @returns {boolean}
 */
export const isDirector = () => {
  return hasRole('DIRECTOR');
};

/**
 * Check if user is regular user
 * @returns {boolean}
 */
export const isUser = () => {
  return hasRole('USER');
};

/**
 * Check if user is developer
 * @returns {boolean}
 */
export const isDeveloper = () => {
  return hasRole('DEVELOPER');
};

/**
 * Get user's company ID
 * @returns {number|null}
 */
export const getUserCompanyId = () => {
  const user = getCurrentUser();
  return user ? user.companyId : null;
};

/**
 * Get company ID (alias for getUserCompanyId)
 * @returns {number|null}
 */
export const getCompanyId = () => {
  return getUserCompanyId();
};

/**
 * Get user's company name
 * @returns {string|null}
 */
export const getUserCompanyName = () => {
  const user = getCurrentUser();
  return user ? user.companyName : null;
};

/**
 * Format user display name
 * @param {Object} user 
 * @returns {string}
 */
export const formatUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  return user.name || user.email || 'Unknown User';
};

/**
 * Check if token is expired (basic check)
 * @param {string} token 
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Auto-logout if token is expired
 */
export const checkTokenExpiration = () => {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    clearSession();
    return true; // Token was expired and session cleared
  }
  return false; // Token is still valid
};