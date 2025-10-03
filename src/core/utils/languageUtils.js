// Language detection and utility functions

export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'english';
  
  // Hindi detection based on Devanagari script
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(text) ? 'hindi' : 'english';
};

export const getLanguageSpecificGreeting = (userName, language = 'english') => {
  if (language === 'hindi') {
    return `नमस्ते ${userName || 'वहां'}! 👋 मैं आपका रियल एस्टेट CRM के लिए AI असिस्टेंट हूं।`;
  }
  return `Hello ${userName || 'there'}! 👋 I'm your AI assistant for real estate CRM.`;
};

export const getLanguageSpecificCommands = (language = 'english') => {
  if (language === 'hindi') {
    return {
      search: "प्रॉपर्टी खोजें",
      analytics: "एनालिटिक्स दिखाएं", 
      leads: "लीड दिखाएं",
      help: "मदद चाहिए"
    };
  }
  return {
    search: "Search properties",
    analytics: "Show analytics",
    leads: "Show leads", 
    help: "Need help"
  };
};

export const translateCommonTerms = (term, language = 'english') => {
  const translations = {
    'property': { hindi: 'प्रॉपर्टी', english: 'property' },
    'lead': { hindi: 'लीड', english: 'lead' },
    'analytics': { hindi: 'एनालिटिक्स', english: 'analytics' },
    'search': { hindi: 'खोज', english: 'search' },
    'report': { hindi: 'रिपोर्ट', english: 'report' },
    'price': { hindi: 'कीमत', english: 'price' },
    'location': { hindi: 'स्थान', english: 'location' }
  };
  
  return translations[term.toLowerCase()]?.[language] || term;
};
