// Example test cases for intent analysis

export const INTENT_EXAMPLES = {
  SEARCH: {
    english: [
      "I want to find properties in Gurgaon under 50 lakhs",
      "Show me 2BHK apartments in Delhi",
      "Search for commercial properties in Mumbai",
      "Find properties near metro station",
      "I need a villa in Bangalore"
    ],
    hindi: [
      "गुड़गांव में 50 लाख के तहत प्रॉपर्टी ढूंढनी है",
      "दिल्ली में 2BHK अपार्टमेंट दिखाओ",
      "मुंबई में कमर्शियल प्रॉपर्टी खोजें",
      "मेट्रो स्टेशन के पास प्रॉपर्टी ढूंढें",
      "बैंगलोर में विला चाहिए"
    ]
  },
  
  ANALYTICS: {
    english: [
      "Show me property analytics",
      "Generate a report on my performance",
      "What are my lead conversion rates?",
      "Show team performance graphs",
      "I need monthly sales data"
    ],
    hindi: [
      "प्रॉपर्टी एनालिटिक्स दिखाएं",
      "मेरे प्रदर्शन पर रिपोर्ट बनाएं",
      "मेरे लीड कन्वर्जन रेट क्या हैं?",
      "टीम प्रदर्शन ग्राफ दिखाएं",
      "मासिक सेल्स डेटा चाहिए"
    ]
  },
  
  MANAGEMENT: {
    english: [
      "Show my leads",
      "Update lead status",
      "Schedule follow-up calls",
      "Assign this lead to my team",
      "Create a new property listing"
    ],
    hindi: [
      "मेरे लीड दिखाएं",
      "लीड स्टेटस अपडेट करें",
      "फॉलो-अप कॉल शेड्यूल करें",
      "इस लीड को मेरी टीम को असाइन करें",
      "नई प्रॉपर्टी लिस्टिंग बनाएं"
    ]
  },
  
  HELP: {
    english: [
      "What can you help me with?",
      "How do I search for properties?",
      "Can you show me available commands?",
      "I need help with the system",
      "What features are available?"
    ],
    hindi: [
      "आप क्या मदद कर सकते हैं?",
      "प्रॉपर्टी कैसे खोजूं?",
      "उपलब्ध कमांड दिखा सकते हैं?",
      "सिस्टम में मदद चाहिए",
      "कौन से फीचर उपलब्ध हैं?"
    ]
  }
};

// Test function to validate intent detection
export const testIntentDetection = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const [intent, examples] of Object.entries(INTENT_EXAMPLES)) {
    for (const langExamples of Object.values(examples)) {
      if (langExamples.some(example => lowerMessage.includes(example.toLowerCase()))) {
        return {
          detectedIntent: intent,
          confidence: 0.9,
          matchedExample: langExamples.find(example => lowerMessage.includes(example.toLowerCase()))
        };
      }
    }
  }
  
  return {
    detectedIntent: 'GENERAL',
    confidence: 0.3,
    matchedExample: null
  };
};
