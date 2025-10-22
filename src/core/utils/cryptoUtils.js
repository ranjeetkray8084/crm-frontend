/**
 * Browser-Compatible Crypto Utilities
 * Provides cryptographic functions that work in the browser environment
 */

import CryptoJS from 'crypto-js';

/**
 * Generate HMAC-SHA256 signature
 * @param {string} data - Data to sign
 * @param {string} key - Secret key
 * @returns {string} HMAC signature in hex format
 */
export function generateHMAC(data, key) {
  try {
    const signature = CryptoJS.HmacSHA256(data, key);
    return signature.toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('HMAC generation error:', error);
    throw new Error('Failed to generate HMAC signature');
  }
}

/**
 * Generate SHA256 hash
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash in hex format
 */
export function generateSHA256(data) {
  try {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('SHA256 generation error:', error);
    throw new Error('Failed to generate SHA256 hash');
  }
}

/**
 * Generate random string
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function generateRandomString(length = 32) {
  try {
    const randomWords = CryptoJS.lib.WordArray.random(length / 2);
    return randomWords.toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('Random string generation error:', error);
    // Fallback to Math.random if CryptoJS fails
    return Array.from({length}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}

/**
 * Generate secure nonce
 * @returns {string} Secure nonce
 */
export function generateNonce() {
  try {
    const timestamp = Date.now().toString();
    const random = generateRandomString(16);
    return `${timestamp}_${random}`;
  } catch (error) {
    console.error('Nonce generation error:', error);
    return `${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
}

/**
 * Generate request ID
 * @returns {string} Unique request ID
 */
export function generateRequestId() {
  try {
    const timestamp = Date.now();
    const random = generateRandomString(8);
    return `req_${timestamp}_${random}`;
  } catch (error) {
    console.error('Request ID generation error:', error);
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

/**
 * Validate HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Received signature
 * @param {string} key - Secret key
 * @returns {boolean} True if signature is valid
 */
export function validateHMAC(data, signature, key) {
  try {
    const expectedSignature = generateHMAC(data, key);
    return expectedSignature === signature;
  } catch (error) {
    console.error('HMAC validation error:', error);
    return false;
  }
}

/**
 * Simple base64 encoding
 * @param {string} data - Data to encode
 * @returns {string} Base64 encoded string
 */
export function base64Encode(data) {
  try {
    return CryptoJS.enc.Utf8.parse(data).toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Base64 encoding error:', error);
    // Fallback to browser's btoa
    return btoa(unescape(encodeURIComponent(data)));
  }
}

/**
 * Simple base64 decoding
 * @param {string} data - Base64 encoded data
 * @returns {string} Decoded string
 */
export function base64Decode(data) {
  try {
    const bytes = CryptoJS.enc.Base64.parse(data);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Base64 decoding error:', error);
    // Fallback to browser's atob
    return decodeURIComponent(escape(atob(data)));
  }
}

/**
 * Generate device fingerprint
 * @returns {Object} Device fingerprint data
 */
export function generateDeviceFingerprint() {
  try {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      timestamp: Date.now()
    };

    // Generate canvas fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
      fingerprint.canvas = canvas.toDataURL();
    } catch (canvasError) {
      fingerprint.canvas = 'unavailable';
    }

    return fingerprint;
  } catch (error) {
    console.error('Device fingerprint generation error:', error);
    return {
      userAgent: navigator.userAgent || 'unknown',
      timestamp: Date.now()
    };
  }
}

/**
 * Generate session ID
 * @returns {string} Session ID
 */
export function generateSessionId() {
  try {
    const timestamp = Date.now();
    const random = generateRandomString(16);
    return `sess_${timestamp}_${random}`;
  } catch (error) {
    console.error('Session ID generation error:', error);
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
}

/**
 * Simple string obfuscation (not encryption, just basic obfuscation)
 * @param {string} data - Data to obfuscate
 * @returns {string} Obfuscated data
 */
export function obfuscateString(data) {
  try {
    return CryptoJS.enc.Utf8.parse(data).toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('String obfuscation error:', error);
    return btoa(unescape(encodeURIComponent(data)));
  }
}

/**
 * Deobfuscate string
 * @param {string} data - Obfuscated data
 * @returns {string} Original data
 */
export function deobfuscateString(data) {
  try {
    const bytes = CryptoJS.enc.Base64.parse(data);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('String deobfuscation error:', error);
    try {
      return decodeURIComponent(escape(atob(data)));
    } catch (atobError) {
      return data; // Return original if all methods fail
    }
  }
}

export default {
  generateHMAC,
  generateSHA256,
  generateRandomString,
  generateNonce,
  generateRequestId,
  validateHMAC,
  base64Encode,
  base64Decode,
  generateDeviceFingerprint,
  generateSessionId,
  obfuscateString,
  deobfuscateString
};
