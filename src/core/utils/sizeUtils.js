/**
 * Utility functions for handling property size with units
 */

/**
 * Parse size string to extract value and unit
 * @param {string} size - Size string like "1261 sqft" or "270 sqyd"
 * @returns {object} - { value: number, unit: string, display: string }
 */
export const parseSize = (size) => {
  if (!size) {
    return { value: 0, unit: '', display: 'N/A' };
  }

  const sizeStr = size.toString().trim();
  
  // Extract numeric value
  const numericMatch = sizeStr.match(/(\d+(?:\.\d+)?)/);
  const value = numericMatch ? parseFloat(numericMatch[1]) : 0;
  
  // Extract unit (sqft, sqyd, etc.)
  const unitMatch = sizeStr.match(/(sqft|sqyd|sqm|sq|square\s*feet|square\s*yards?|square\s*meters?)/i);
  const unit = unitMatch ? unitMatch[1].toLowerCase() : '';
  
  // Normalize unit names
  let normalizedUnit = '';
  if (unit.includes('sqft') || unit.includes('square feet')) {
    normalizedUnit = 'sqft';
  } else if (unit.includes('sqyd') || unit.includes('square yard')) {
    normalizedUnit = 'sqyd';
  } else if (unit.includes('sqm') || unit.includes('square meter')) {
    normalizedUnit = 'sqm';
  } else if (unit === 'sq') {
    normalizedUnit = 'sqft'; // Default to sqft if just 'sq'
  }
  
  // Create display string
  const display = value > 0 ? `${value} ${normalizedUnit}` : 'N/A';
  
  return {
    value,
    unit: normalizedUnit,
    display,
    original: sizeStr
  };
};

/**
 * Calculate price per square foot/yard
 * @param {number} price - Property price
 * @param {object} sizeData - Parsed size data from parseSize
 * @returns {number} - Price per unit
 */
export const calculatePricePerUnit = (price, sizeData) => {
  if (!price || !sizeData || sizeData.value <= 0) {
    return 0;
  }
  
  return price / sizeData.value;
};

/**
 * Format price per unit for display
 * @param {number} pricePerUnit - Price per unit
 * @param {string} unit - Unit (sqft, sqyd, etc.)
 * @returns {string} - Formatted string like "₹1,500/sqft"
 */
export const formatPricePerUnit = (pricePerUnit, unit) => {
  if (pricePerUnit <= 0 || !unit) {
    return '';
  }
  
  return `₹${Math.round(pricePerUnit).toLocaleString()}/${unit}`;
};

/**
 * Convert between different area units
 * @param {number} value - Value to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} - Converted value
 */
export const convertArea = (value, fromUnit, toUnit) => {
  if (!value || fromUnit === toUnit) {
    return value;
  }
  
  // Convert to square feet first
  let sqftValue = value;
  if (fromUnit === 'sqyd') {
    sqftValue = value * 9; // 1 sqyd = 9 sqft
  } else if (fromUnit === 'sqm') {
    sqftValue = value * 10.764; // 1 sqm = 10.764 sqft
  }
  
  // Convert from square feet to target unit
  if (toUnit === 'sqyd') {
    return sqftValue / 9;
  } else if (toUnit === 'sqm') {
    return sqftValue / 10.764;
  }
  
  return sqftValue; // Return in sqft
};
