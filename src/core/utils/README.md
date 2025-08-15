# Utility Functions

## Avatar Utils

The `avatarUtils.js` module provides utilities for generating fallback avatars when user profile images are not available or fail to load.

### Features

- **SVG-based avatars**: Generates lightweight SVG avatars with user initials
- **Consistent colors**: Uses deterministic color generation based on username
- **No external dependencies**: Eliminates network requests to external placeholder services
- **Responsive sizing**: Supports different avatar sizes
- **Fallback handling**: Gracefully handles missing or invalid user names

### Usage

```javascript
import { createFallbackAvatar, getInitials, generateColorFromString } from './avatarUtils';

// Create a fallback avatar for a user
const avatarUrl = createFallbackAvatar('John Doe', 44);

// Get initials from a name
const initials = getInitials('John Doe'); // Returns 'JD'

// Generate a consistent color for a user
const color = generateColorFromString('John Doe'); // Returns hex color
```

### Benefits

1. **Performance**: No network requests for placeholder images
2. **Reliability**: Works offline and doesn't depend on external services
3. **Consistency**: Same user always gets the same color and initials
4. **Accessibility**: Proper alt text and semantic markup
5. **Customizable**: Easy to modify colors, sizes, and styling

### Migration from External Services

This utility replaces external placeholder services like `via.placeholder.com` to:
- Eliminate `net::ERR_NAME_NOT_RESOLVED` errors
- Improve loading performance
- Reduce external dependencies
- Ensure consistent user experience