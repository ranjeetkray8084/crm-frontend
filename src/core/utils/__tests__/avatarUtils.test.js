/**
 * Tests for avatar utility functions
 */

import { generateAvatarDataUrl, getInitials, generateColorFromString, createFallbackAvatar } from '../avatarUtils';

describe('Avatar Utils', () => {
  describe('getInitials', () => {
    test('should return single initial for single word', () => {
      expect(getInitials('John')).toBe('J');
    });

    test('should return two initials for multiple words', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('John Michael Doe')).toBe('JD');
    });

    test('should handle empty or invalid input', () => {
      expect(getInitials('')).toBe('U');
      expect(getInitials(null)).toBe('U');
      expect(getInitials(undefined)).toBe('U');
    });

    test('should handle extra whitespace', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });
  });

  describe('generateColorFromString', () => {
    test('should return consistent color for same string', () => {
      const color1 = generateColorFromString('John');
      const color2 = generateColorFromString('John');
      expect(color1).toBe(color2);
    });

    test('should return different colors for different strings', () => {
      const color1 = generateColorFromString('John');
      const color2 = generateColorFromString('Jane');
      expect(color1).not.toBe(color2);
    });

    test('should return default color for empty string', () => {
      expect(generateColorFromString('')).toBe('6B7280');
      expect(generateColorFromString(null)).toBe('6B7280');
    });
  });

  describe('generateAvatarDataUrl', () => {
    test('should generate valid data URL', () => {
      const dataUrl = generateAvatarDataUrl('JD', 44, '6B7280', 'FFFFFF');
      expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test('should include initials in SVG', () => {
      const dataUrl = generateAvatarDataUrl('AB', 44, '6B7280', 'FFFFFF');
      const svgContent = atob(dataUrl.split(',')[1]);
      expect(svgContent).toContain('AB');
    });
  });

  describe('createFallbackAvatar', () => {
    test('should create data URL for user', () => {
      const avatar = createFallbackAvatar('John Doe', 44);
      expect(avatar).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test('should handle empty username', () => {
      const avatar = createFallbackAvatar('', 44);
      expect(avatar).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });
});