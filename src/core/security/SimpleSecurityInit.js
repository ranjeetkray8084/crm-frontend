/**
 * Simple Security Initialization
 * Lightweight security initialization that works even if some modules fail to load
 */

/**
 * Initialize basic security features
 */
export async function initializeBasicSecurity() {
  try {
    console.log('🔒 Initializing basic security features...');
    
    // Initialize basic session
    if (!sessionStorage.getItem('crm_session_id')) {
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('crm_session_id', sessionId);
      console.log('✅ Session ID initialized');
    }
    
    // Setup basic security headers
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Client-Version': '1.0.0',
      'X-Platform': 'web'
    };
    
    // Store security headers for use in API calls
    sessionStorage.setItem('crm_security_headers', JSON.stringify(securityHeaders));
    console.log('✅ Security headers initialized');
    
    // Setup basic error monitoring
    window.addEventListener('error', (event) => {
      console.warn('🚨 Window Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        timestamp: Date.now()
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('🚨 Unhandled Promise Rejection:', {
        reason: event.reason?.toString(),
        timestamp: Date.now()
      });
    });
    
    console.log('✅ Error monitoring initialized');
    
    // Log security initialization
    console.log('✅ Basic security features initialized successfully');
    
    return true;
    
  } catch (error) {
    console.error('❌ Basic security initialization failed:', error);
    return false;
  }
}

/**
 * Get basic security headers
 */
export function getBasicSecurityHeaders() {
  try {
    const headers = sessionStorage.getItem('crm_security_headers');
    return headers ? JSON.parse(headers) : {};
  } catch (error) {
    console.error('Error getting security headers:', error);
    return {};
  }
}

/**
 * Check if security is initialized
 */
export function isSecurityInitialized() {
  return !!sessionStorage.getItem('crm_session_id');
}

/**
 * Get session ID
 */
export function getSessionId() {
  let sessionId = sessionStorage.getItem('crm_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('crm_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Enhanced input sanitization with comprehensive XSS and SQL injection protection
 * Now includes email-friendly sanitization for login credentials
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  let sanitized = input;
  
  // Step 1: SQL Injection Protection
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/gi,
    /(\bOR\s+['"]?1['"]?\s*=\s*['"]?1['"]?)/gi,
    /(\bAND\s+['"]?1['"]?\s*=\s*['"]?1['"]?)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\bUNION\s+SELECT\b)/gi,
    /(\bDROP\s+TABLE\b)/gi,
    /(\bINSERT\s+INTO\b)/gi,
    /(\bUPDATE\s+SET\b)/gi,
    /(\bDELETE\s+FROM\b)/gi,
    /(\bEXEC\s*\()/gi,
    /(\bXP_CMDSHELL\b)/gi,
    /(\bSP_EXECUTESQL\b)/gi,
    /(\bWAITFOR\s+DELAY\b)/gi,
    /(\bBENCHMARK\b)/gi,
    /(\bLOAD_FILE\b)/gi,
    /(\bINTO\s+OUTFILE\b)/gi,
    /(\bINTO\s+DUMPFILE\b)/gi,
    /(\bSHUTDOWN\b)/gi,
    /(\bKILL\b)/gi,
    /(\bTRUNCATE\b)/gi,
    /(\bGRANT\b)/gi,
    /(\bREVOKE\b)/gi,
    /(\bIMPORT\b)/gi,
    /(\bEXPORT\b)/gi
  ];
  
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[BLOCKED]');
  });
  
  // Step 2: Comprehensive XSS Prevention (but preserve email-friendly characters)
  const xssPatterns = [
    // Script tags (all variants) - Most aggressive blocking
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*>/gi,
    /<\/script>/gi,
    /<script/gi,
    /script>/gi,
    /script/gi, // Block the word "script" anywhere
    
    // Event handlers (all variants)
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^>\s]+/gi,
    /on\w+\s*=/gi,
    /onload/gi,
    /onerror/gi,
    /onclick/gi,
    /onfocus/gi,
    /onmouseover/gi,
    /onloadstart/gi,
    /oncanplay/gi,
    /onchange/gi,
    /onsubmit/gi,
    /onreset/gi,
    /onselect/gi,
    /onblur/gi,
    /onkeydown/gi,
    /onkeyup/gi,
    /onkeypress/gi,
    /onmousedown/gi,
    /onmouseup/gi,
    /onmousemove/gi,
    /onmouseout/gi,
    /onmouseenter/gi,
    /onmouseleave/gi,
    /oncontextmenu/gi,
    /ondblclick/gi,
    /onwheel/gi,
    /oninput/gi,
    /oninvalid/gi,
    /onreset/gi,
    /onsearch/gi,
    /onselectstart/gi,
    /ontoggle/gi,
    /onvolumechange/gi,
    /onwaiting/gi,
    /onabort/gi,
    /oncanplaythrough/gi,
    /ondurationchange/gi,
    /onemptied/gi,
    /onended/gi,
    /onloadeddata/gi,
    /onloadedmetadata/gi,
    /onpause/gi,
    /onplay/gi,
    /onplaying/gi,
    /onprogress/gi,
    /onratechange/gi,
    /onseeked/gi,
    /onseeking/gi,
    /onstalled/gi,
    /onsuspend/gi,
    /ontimeupdate/gi,
    
    // JavaScript protocols
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:\s*text\/html/gi,
    /data\s*:\s*text\/javascript/gi,
    /data\s*:\s*application\/javascript/gi,
    /javascript/gi,
    /vbscript/gi,
    /alert\s*\(/gi, // Block alert function
    /alert/gi, // Block alert keyword
    
    // Dangerous HTML elements
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<iframe[^>]*>/gi,
    /<\/iframe>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    /<object[^>]*>/gi,
    /<\/object>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /<form[^>]*>/gi,
    /<input[^>]*>/gi,
    /<textarea[^>]*>/gi,
    /<select[^>]*>/gi,
    /<option[^>]*>/gi,
    /<button[^>]*>/gi,
    /<svg[^>]*>/gi,
    /<math[^>]*>/gi,
    /<video[^>]*>/gi,
    /<audio[^>]*>/gi,
    /<source[^>]*>/gi,
    /<track[^>]*>/gi,
    /<applet[^>]*>/gi,
    /<base[^>]*>/gi,
    /<body[^>]*>/gi,
    /<head[^>]*>/gi,
    /<html[^>]*>/gi,
    /<title[^>]*>/gi,
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    /<style[^>]*>/gi,
    /<\/style>/gi,
    
    // Style attributes and CSS
    /style\s*=\s*["'][^"']*["']/gi,
    /style\s*=/gi,
    /expression\s*\(/gi,
    /behavior\s*:/gi,
    /@import/gi,
    /url\s*\(\s*["']?javascript:/gi,
    /url\s*\(\s*["']?data:/gi,
    
    // Base64 and data URLs
    /data\s*:\s*text\/plain;base64/gi,
    /data\s*:\s*text\/html;base64/gi,
    /data\s*:\s*application\/javascript;base64/gi,
    /data\s*:\s*text\/javascript;base64/gi,
    
    // HTML entities and encoding
    /&#x?[0-9a-f]+;/gi,
    /&#[0-9]+;/gi,
    /&lt;script/gi,
    /&lt;\/script/gi,
    /&lt;iframe/gi,
    /&lt;\/iframe/gi,
    /&lt;object/gi,
    /&lt;\/object/gi,
    /&lt;embed/gi,
    /&lt;link/gi,
    /&lt;meta/gi,
    /&lt;form/gi,
    /&lt;input/gi,
    /&lt;textarea/gi,
    /&lt;select/gi,
    /&lt;option/gi,
    /&lt;button/gi,
    /&lt;svg/gi,
    /&lt;math/gi,
    /&lt;video/gi,
    /&lt;audio/gi,
    /&lt;source/gi,
    /&lt;track/gi,
    /&lt;applet/gi,
    /&lt;base/gi,
    /&lt;body/gi,
    /&lt;head/gi,
    /&lt;html/gi,
    /&lt;title/gi,
    /&lt;style/gi,
    /&lt;\/style/gi,
    
    // Dangerous characters and patterns (but preserve email-friendly characters)
    /<[^>]*>/g,
    /[<>]/g,
    /["']/g,
    /&/g,
    /%/g,
    /\$/g,
    /\\/g,
    /\|/g,
    /\^/g,
    /`/g,
    /~/g,
    /!/g,
    // Removed /@/g to allow @ symbol for emails
    /#/g,
    /\*/g,
    /\+/g,
    /=/g,
    /\?/g,
    /\[/g,
    /\]/g,
    /\{/g,
    /\}/g,
    /\(/g,
    /\)/g,
    /;/g,
    /:/g,
    /,/g,
    // Removed /\./g to allow dots for emails
    // Removed /\//g to allow forward slashes in some contexts
  ];
  
  // Apply XSS protection patterns
  xssPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[BLOCKED]');
  });
  
  // Step 3: Final cleanup
  sanitized = sanitized
    .replace(/\[BLOCKED\]/g, '') // Remove blocked markers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Step 4: Security logging - only log actual threats, not normal sanitization
  if (input !== sanitized) {
    // Only log if there was an actual security threat detected
    const hasActualThreat = input.includes('<script') || 
                            input.includes('javascript:') || 
                            input.includes('onerror=') || 
                            input.includes('onload=') ||
                            input.match(/(union\s+select|drop\s+table|delete\s+from)/i);
    
    if (hasActualThreat) {
      console.warn('🚨 Security threat detected and blocked:', {
        original: input.substring(0, 100),
        sanitized: sanitized.substring(0, 100),
        threatType: 'XSS or SQL Injection attempt'
      });
    }
    // Don't log for normal sanitization (like removing brackets or other harmless patterns)
  }
  
  return sanitized;
}

/**
 * Validate API base URL
 */
export function validateApiUrl(url) {
  const allowedDomains = [
    'leadstracker.in',
    'backend.leadstracker.in',
    'crm.leadstracker.in',
    'localhost',
    '127.0.0.1'
  ];
  
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (error) {
    return false;
  }
}

/**
 * Get secure API base URL
 */
export function getSecureApiUrl() {
  const envUrl = 'https://backend.leadstracker.in'; // ALWAYS USE PRODUCTION
  const defaultUrl = 'https://backend.leadstracker.in';
  
  if (envUrl && validateApiUrl(envUrl)) {
    return envUrl;
  }
  
  return defaultUrl;
}

export default {
  initializeBasicSecurity,
  getBasicSecurityHeaders,
  isSecurityInitialized,
  getSessionId,
  sanitizeInput,
  validateApiUrl,
  getSecureApiUrl
};
