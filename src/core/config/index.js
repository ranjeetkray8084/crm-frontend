// Configuration for Web & Mobile compatibility
export const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'https://backend.leadstracker.in/api',
    timeout: 30000,
    retries: 3
  },

  // Storage Configuration (can be adapted for mobile)
  storage: {
    tokenKey: 'token',
    userKey: 'user',
    // For mobile, these could be AsyncStorage keys
    prefix: 'crm_'
  },

  // UI Configuration
  ui: {
    // Responsive breakpoints
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    },
    
    // Animation durations
    animations: {
      fast: 200,
      normal: 300,
      slow: 500
    },

    // Colors (can be used in mobile themes)
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4'
    }
  },

  // Feature flags
  features: {
    enableNotifications: true,
    enableOfflineMode: false,
    enableBiometric: false, // For mobile
    enablePushNotifications: false // For mobile
  },

  // Platform detection
  platform: {
    isWeb: typeof window !== 'undefined',
    isMobile: typeof window !== 'undefined' && window.navigator.userAgent.includes('Mobile'),
    isTablet: typeof window !== 'undefined' && window.navigator.userAgent.includes('Tablet')
  }
};

// Environment-specific configurations
export const environments = {
  development: {
    api: {
      baseURL: 'https://backend.leadstracker.in/api'
    },
    debug: true
  },
  
  production: {
    api: {
      baseURL: 'https://backend.leadstracker.in/api'
    },
    debug: false
  },
  
  mobile: {
    api: {
      baseURL: 'https://backend.leadstracker.in/api'
    },
    storage: {
      // Use AsyncStorage for React Native
      type: 'async'
    }
  }
};