/**
 * Utility functions for generating avatar placeholders
 */

/**
 * Generate a data URL for an SVG avatar with initials
 * @param {string} initials - The initials to display (1-2 characters)
 * @param {number} size - The size of the avatar in pixels
 * @param {string} bgColor - Background color (hex without #)
 * @param {string} textColor - Text color (hex without #)
 * @returns {string} Data URL for the SVG avatar
 */
export const generateAvatarDataUrl = (initials = 'U', size = 44, bgColor = '6B7280', textColor = 'FFFFFF') => {
  const fontSize = Math.floor(size * 0.4); // 40% of size for good proportion
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#${bgColor}" rx="${size/2}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="#${textColor}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="600">
        ${initials.toUpperCase()}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate avatar initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (1-2 characters)
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a color based on a string (for consistent user colors)
 * @param {string} str - Input string (like username)
 * @returns {string} Hex color without #
 */
export const generateColorFromString = (str) => {
  if (!str) return '6B7280'; // Default gray
  
  const colors = [
    '3B82F6', // Blue
    '10B981', // Green
    'F59E0B', // Yellow
    'EF4444', // Red
    '8B5CF6', // Purple
    'F97316', // Orange
    '06B6D4', // Cyan
    'EC4899', // Pink
    '84CC16', // Lime
    '6366F1', // Indigo
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Create a fallback avatar URL for a user
 * @param {string} userName - User's name
 * @param {number} size - Avatar size
 * @returns {string} Data URL for the avatar
 */
export const createFallbackAvatar = (userName, size = 44) => {
  const initials = getInitials(userName);
  const bgColor = generateColorFromString(userName);
  return generateAvatarDataUrl(initials, size, bgColor, 'FFFFFF');
};