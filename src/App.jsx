import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { NotesProvider } from './shared/contexts/NotesContext';
import { initializeBasicSecurity } from './core/security/SimpleSecurityInit.js';
import { httpsEnforcer } from './core/security/HTTPSEnforcer.js';
import { localhostSecurityConfig } from './core/security/LocalhostSecurityConfig.js';
import WebApp from './platforms/web/WebApp';

function App() {
  const [securityInitialized, setSecurityInitialized] = useState(false);
  const [securityError, setSecurityError] = useState(null);

  useEffect(() => {
    // Use environment-based security configuration
    const initializeSecurityBasedOnEnv = async () => {
      const { ENV_CONFIG } = await import('./core/config/environment.js');
      const securityConfig = ENV_CONFIG.getSecurityConfig();
      
      // Get current configuration
      const configInfo = ENV_CONFIG.getConfigInfo();
      
      if (!securityConfig.enableSecurity) {
        // Security disabled for current environment
        setSecurityInitialized(true);
        return;
      }

      // Initialize security features only for production
      const initializeSecurity = async () => {
        try {
          console.log('🔒 Initializing security features...');
          
          // Setup localhost-friendly security configuration
          console.log('🏠 Setting up security for current environment...');
          const securityConfig = localhostSecurityConfig.setupLocalhostSecurity();
          
          // Initialize HTTPS enforcement (disabled for localhost)
          if (securityConfig.enableHttpsEnforcement) {
            console.log('🔐 Setting up HTTPS enforcement...');
            httpsEnforcer.setupSecureCookies();
          } else {
            console.log('🏠 Localhost detected - skipping HTTPS enforcement');
          }
          
          // Try to initialize basic security
          const success = await initializeBasicSecurity();
          
          if (success) {
            setSecurityInitialized(true);
            console.log('✅ Security initialization completed');
            
            // Log HTTPS status
            const protocolInfo = httpsEnforcer.getProtocolInfo();
            console.log('🔒 Protocol Status:', protocolInfo);
          } else {
            setSecurityError('Security initialization failed');
            console.error('❌ Security initialization failed');
          }
        } catch (error) {
          setSecurityError(error.message);
          console.error('❌ Security initialization error:', error);
        }
      };

      await initializeSecurity();
    };

    initializeSecurityBasedOnEnv();

    // Cleanup on unmount
    return () => {
      // Any cleanup needed when app unmounts
    };
  }, []);

  // Don't block the app for security initialization
  // Security will initialize in background

  return (
    <Router>
      <AuthProvider>
        <NotesProvider>
          <div className="App">
            <WebApp />
          </div>
        </NotesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;