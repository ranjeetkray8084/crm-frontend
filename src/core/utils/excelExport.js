/**
 * Common Excel Export Utility
 * Provides functionality to export table data to Excel format
 */

import * as XLSX from 'xlsx';

/**
 * Format value for export
 * @param {*} value - Value to format
 * @param {string} key - Column key for special formatting
 * @returns {string} Formatted value
 */
const formatValue = (value, key) => {
  if (value === null || value === undefined) {
    return '';
  }

  // Format dates
  if (key === 'createdAt' && value) {
    try {
      return new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return String(value);
    }
  }

  // Format currency values
  if ((key === 'budget' || key === 'price') && value) {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(value);
    } catch (e) {
      return String(value);
    }
  }

  // Format status values
  if (key === 'status' && value) {
    const statusMap = {
      'NEW': 'New',
      'CONTACTED': 'Contacted',
      'CLOSED': 'Closed',
      'DROPED': 'Dropped',
      'AVAILABLE_FOR_SALE': 'For Sale',
      'AVAILABLE_FOR_RENT': 'For Rent',
      'SOLD_OUT': 'Sold Out',
      'RENT_OUT': 'Rented Out'
    };
    return statusMap[value] || value;
  }

  return String(value);
};

/**
 * Convert data to Excel format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions with key and header
 * @returns {Object} Excel workbook object
 */
const convertToExcel = (data, columns) => {
  if (!data || data.length === 0) return null;
  
  // Create worksheet data
  const worksheetData = [];
  
  // Add header row
  const headers = columns.map(col => col.header);
  worksheetData.push(headers);
  
  // Add data rows
  data.forEach(item => {
    const row = columns.map(col => {
      let value = item[col.key];
      
      // Handle nested properties (e.g., 'user.name')
      if (col.key.includes('.')) {
        value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
      }
      
      // Format the value
      return formatValue(value, col.key);
    });
    worksheetData.push(row);
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const columnWidths = columns.map(col => ({ wch: Math.max(col.header.length, 15) }));
  worksheet['!cols'] = columnWidths;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  return workbook;
};

/**
 * Download Excel file
 * @param {Object} workbook - Excel workbook object
 * @param {string} filename - Name of the file to download
 */
const downloadExcel = (workbook, filename) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}_${timestamp}.xlsx`;
  
  // Convert workbook to buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create blob and download
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export table data to Excel format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions
 * @param {string} filename - Name of the exported file
 */
export const exportToExcel = (data, columns, filename) => {
  try {
    // Validate inputs
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error('Columns must be a non-empty array');
    }
    
    if (!filename || typeof filename !== 'string') {
      throw new Error('Filename must be a non-empty string');
    }
    
    const workbook = convertToExcel(data, columns);
    if (!workbook) {
      throw new Error('Failed to create Excel workbook');
    }
    
    downloadExcel(workbook, filename);
    
    return { success: true, message: `Exported ${data.length} records to ${filename}.xlsx` };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, message: `Export failed: ${error.message}` };
  }
};

/**
 * Predefined column configurations for common tables
 */
export const COLUMN_CONFIGS = {
  leads: [
    { key: 'name', header: 'Lead Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status' },
    { key: 'budget', header: 'Budget' },
    { key: 'requirement', header: 'Requirement' },
    { key: 'location', header: 'Location' },
    { key: 'source', header: 'Source' },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'assignedToSummary.name', header: 'Assigned To' }
  ],
  
  properties: [
    { key: 'propertyName', header: 'Property Name' },
    { key: 'status', header: 'Status' },
    { key: 'type', header: 'Type' },
    { key: 'price', header: 'Price' },
    { key: 'location', header: 'Location' },
    { key: 'sector', header: 'Sector' },
    { key: 'bhk', header: 'BHK' },
    { key: 'unitDetails', header: 'Unit Details' },
    { key: 'floor', header: 'Floor' },
    { key: 'ownerContact', header: 'Owner Contact' },
    { key: 'source', header: 'Source' },
    { key: 'createdAt', header: 'Created Date' }
  ]
};

/**
 * Role-based column configurations for properties
 * Different roles see different levels of detail
 */
export const ROLE_BASED_PROPERTY_COLUMNS = {
  DIRECTOR: [
    { key: 'propertyName', header: 'Property Name' },
    { key: 'status', header: 'Status' },
    { key: 'type', header: 'Type' },
    { key: 'price', header: 'Price' },
    { key: 'location', header: 'Location' },
    { key: 'sector', header: 'Sector' },
    { key: 'bhk', header: 'BHK' },
    { key: 'unitDetails', header: 'Unit Details' },
    { key: 'floor', header: 'Floor' },
    { key: 'ownerName', header: 'Owner Name' },
    { key: 'ownerContact', header: 'Owner Contact' },
    { key: 'source', header: 'Source' },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'createdBy.name', header: 'Created By' },
    { key: 'size', header: 'Size' },
    { key: 'address', header: 'Address' }
  ],
  
  ADMIN: [
    { key: 'propertyName', header: 'Property Name' },
    { key: 'status', header: 'Status' },
    { key: 'type', header: 'Type' },
    { key: 'price', header: 'Price' },
    { key: 'location', header: 'Location' },
    { key: 'sector', header: 'Sector' },
    { key: 'bhk', header: 'BHK' },
    { key: 'unitDetails', header: 'Unit Details' },
    { key: 'floor', header: 'Floor' },
    { key: 'ownerContact', header: 'Owner Contact' },
    { key: 'source', header: 'Source' },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'createdBy.name', header: 'Created By' },
    { key: 'size', header: 'Size' }
  ],
  
  USER: [
    { key: 'propertyName', header: 'Property Name' },
    { key: 'status', header: 'Status' },
    { key: 'type', header: 'Type' },
    { key: 'price', header: 'Price' },
    { key: 'location', header: 'Location' },
    { key: 'sector', header: 'Sector' },
    { key: 'bhk', header: 'BHK' },
    { key: 'unitDetails', header: 'Unit Details' },
    { key: 'floor', header: 'Floor' },
    { key: 'source', header: 'Source' },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'size', header: 'Size' }
  ]
};

/**
 * Role-based column configurations for leads
 * Different roles see different levels of detail
 */
export const ROLE_BASED_LEAD_COLUMNS = {
  DIRECTOR: [
    { key: 'name', header: 'Lead Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
    { key: 'budget', header: 'Budget' },
    { key: 'requirement', header: 'Requirement' },
    { key: 'location', header: 'Location' },
    { key: 'source', header: 'Source' },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'assignedToSummary.name', header: 'Assigned To' },
    { key: 'createdBy.name', header: 'Created By' },
    { key: 'notes', header: 'Notes' },
    { key: 'followUpDate', header: 'Follow Up Date' },
    { key: 'priority', header: 'Priority' }
  ],
  
  ADMIN: [
    { key: 'name', header: 'Lead Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
    { key: 'budget', header: 'Budget' },
    { key: 'requirement', header: 'Requirement' },
    { key: 'location', header: 'Location' },
    { key: 'source', header: 'Source' },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'assignedToSummary.name', header: 'Assigned To' },
    { key: 'createdBy.name', header: 'Created By' },
    { key: 'notes', header: 'Notes' },
    { key: 'followUpDate', header: 'Follow Up Date' }
  ],
  
  USER: [
    { key: 'name', header: 'Lead Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
    { key: 'budget', header: 'Budget' },
    { key: 'requirement', header: 'Requirement' },
    { key: 'location', header: 'Location' },
    { key: 'source', header: 'Source' },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'assignedToSummary.name', header: 'Assigned To' },
    { key: 'notes', header: 'Notes' },
    { key: 'followUpDate', header: 'Follow Up Date' }
  ]
};

/**
 * Helper function to export leads data
 * @param {Array} leads - Array of lead objects
 */
export const exportLeads = (leads) => {
  return exportToExcel(leads, COLUMN_CONFIGS.leads, 'leads_export');
};

/**
 * Helper function to export leads data with role-based columns
 * @param {Array} leads - Array of lead objects
 * @param {string} userRole - User role (DIRECTOR, ADMIN, USER)
 * @param {string} filename - Optional custom filename
 */
export const exportLeadsWithRole = (leads, userRole = 'USER', filename = 'leads_export') => {
  const roleColumns = ROLE_BASED_LEAD_COLUMNS[userRole] || ROLE_BASED_LEAD_COLUMNS.USER;
  const roleFilename = `${filename}_${userRole.toLowerCase()}`;
  return exportToExcel(leads, roleColumns, roleFilename);
};

/**
 * Get role-based columns for leads
 * @param {string} userRole - User role (DIRECTOR, ADMIN, USER)
 * @returns {Array} Array of column definitions
 */
export const getRoleBasedLeadColumns = (userRole) => {
  return ROLE_BASED_LEAD_COLUMNS[userRole] || ROLE_BASED_LEAD_COLUMNS.USER;
};

/**
 * Helper function to export properties data
 * @param {Array} properties - Array of property objects
 */
export const exportProperties = (properties) => {
  return exportToExcel(properties, COLUMN_CONFIGS.properties, 'properties_export');
};

/**
 * Helper function to export properties data with role-based columns
 * @param {Array} properties - Array of property objects
 * @param {string} userRole - User role (DIRECTOR, ADMIN, USER)
 * @param {string} filename - Optional custom filename
 */
export const exportPropertiesWithRole = (properties, userRole = 'USER', filename = 'properties_export') => {
  const roleColumns = ROLE_BASED_PROPERTY_COLUMNS[userRole] || ROLE_BASED_PROPERTY_COLUMNS.USER;
  const roleFilename = `${filename}_${userRole.toLowerCase()}`;
  return exportToExcel(properties, roleColumns, roleFilename);
};

/**
 * Get role-based columns for properties
 * @param {string} userRole - User role (DIRECTOR, ADMIN, USER)
 * @returns {Array} Array of column definitions
 */
export const getRoleBasedPropertyColumns = (userRole) => {
  return ROLE_BASED_PROPERTY_COLUMNS[userRole] || ROLE_BASED_PROPERTY_COLUMNS.USER;
};
