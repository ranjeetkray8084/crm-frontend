import CryptoJS from 'crypto-js';
import { generateRandomString, generateSHA256 } from '../utils/cryptoUtils.js';

/**
 * Data Encryption Service for Sensitive Information
 * Encrypts sensitive data before sending to API
 */
class DataEncryption {
  constructor() {
    this.encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    this.ivLength = 16; // AES block size
    
    // Validate encryption key
    if (this.encryptionKey === 'default-encryption-key-change-in-production') {
      console.warn('⚠️ Using default encryption key. Please set VITE_ENCRYPTION_KEY environment variable for production.');
    }
  }

  /**
   * Encrypt sensitive data
   * @param {any} data - Data to encrypt
   * @param {string} key - Encryption key (optional)
   * @returns {string} Encrypted data
   */
  encrypt(data, key = null) {
    try {
      const encryptionKey = key || this.encryptionKey;
      
      // Convert data to string if it's an object
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Generate random IV
      const iv = CryptoJS.lib.WordArray.random(this.ivLength);
      
      // Encrypt data
      const encrypted = CryptoJS.AES.encrypt(dataString, encryptionKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Combine IV and encrypted data
      const result = iv.concat(encrypted.ciphertext);
      
      return result.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - Encrypted data
   * @param {string} key - Decryption key (optional)
   * @returns {any} Decrypted data
   */
  decrypt(encryptedData, key = null) {
    try {
      const encryptionKey = key || this.encryptionKey;
      
      // Convert from Base64
      const combined = CryptoJS.enc.Base64.parse(encryptedData);
      
      // Extract IV and ciphertext
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, this.ivLength / 4));
      const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(this.ivLength / 4));
      
      // Decrypt data
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext },
        encryptionKey,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      // Try to parse as JSON, return as string if it fails
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (one-way encryption)
   * @param {string} data - Data to hash
   * @param {string} salt - Salt for hashing (optional)
   * @returns {string} Hashed data
   */
  hash(data, salt = null) {
    try {
      const saltToUse = salt || CryptoJS.lib.WordArray.random(16).toString();
      const hash = CryptoJS.PBKDF2(data, saltToUse, {
        keySize: 256 / 32,
        iterations: 10000
      });
      
      return `${saltToUse}:${hash.toString(CryptoJS.enc.Hex)}`;
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Verify hashed data
   * @param {string} data - Original data
   * @param {string} hashedData - Hashed data with salt
   * @returns {boolean} True if data matches hash
   */
  verifyHash(data, hashedData) {
    try {
      const [salt, hash] = hashedData.split(':');
      const newHash = CryptoJS.PBKDF2(data, salt, {
        keySize: 256 / 32,
        iterations: 10000
      });
      
      return newHash.toString(CryptoJS.enc.Hex) === hash;
    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }

  /**
   * Encrypt sensitive fields in an object
   * @param {Object} data - Object containing sensitive data
   * @param {Array} sensitiveFields - Array of field names to encrypt
   * @returns {Object} Object with encrypted sensitive fields
   */
  encryptSensitiveFields(data, sensitiveFields = ['password', 'phone', 'email', 'ssn', 'creditCard']) {
    try {
      const encrypted = { ...data };
      
      sensitiveFields.forEach(field => {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
          encrypted[field] = this.encrypt(encrypted[field]);
          encrypted[`${field}_encrypted`] = true; // Flag to indicate encryption
        }
      });
      
      return encrypted;
    } catch (error) {
      console.error('Error encrypting sensitive fields:', error);
      return data; // Return original data if encryption fails
    }
  }

  /**
   * Decrypt sensitive fields in an object
   * @param {Object} data - Object with encrypted sensitive data
   * @param {Array} sensitiveFields - Array of field names to decrypt
   * @returns {Object} Object with decrypted sensitive fields
   */
  decryptSensitiveFields(data, sensitiveFields = ['password', 'phone', 'email', 'ssn', 'creditCard']) {
    try {
      const decrypted = { ...data };
      
      sensitiveFields.forEach(field => {
        if (decrypted[`${field}_encrypted`] && decrypted[field]) {
          try {
            decrypted[field] = this.decrypt(decrypted[field]);
            delete decrypted[`${field}_encrypted`];
          } catch (error) {
            console.warn(`Failed to decrypt field ${field}:`, error);
          }
        }
      });
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting sensitive fields:', error);
      return data; // Return original data if decryption fails
    }
  }

  /**
   * Generate secure random string
   * @param {number} length - Length of random string
   * @returns {string} Random string
   */
  generateRandomString(length = 32) {
    return generateRandomString(length);
  }

  /**
   * Generate secure password
   * @param {number} length - Password length
   * @param {Object} options - Password options
   * @returns {string} Secure password
   */
  generateSecurePassword(length = 12, options = {}) {
    const defaults = {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    };
    
    const config = { ...defaults, ...options };
    let charset = '';
    
    if (config.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (config.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (config.includeNumbers) charset += '0123456789';
    if (config.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    const randomArray = CryptoJS.lib.WordArray.random(length);
    
    for (let i = 0; i < length; i++) {
      const randomIndex = randomArray.words[Math.floor(i / 4)] % charset.length;
      password += charset[randomIndex];
    }
    
    return password;
  }
}

// Export singleton instance
export const dataEncryption = new DataEncryption();
export default DataEncryption;
