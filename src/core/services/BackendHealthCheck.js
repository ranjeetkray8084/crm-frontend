/**
 * Backend Health Check Service
 * Check if backend is accessible and fix connection issues
 */

class BackendHealthCheck {
  constructor() {
    this.baseURLs = [
      'https://backend.leadstracker.in',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:3000'
    ];
    this.workingURL = null;
  }

  /**
   * Check backend health
   */
  async checkBackendHealth() {
    for (const url of this.baseURLs) {
      try {
        // Directly test login endpoint since all other endpoints require auth
        const loginTest = await this.testLoginEndpoint(url);
        
        if (loginTest.working) {
          this.workingURL = url;
          return {
            healthy: true,
            url: url,
            response: { status: loginTest.status, endpoint: '/api/auth/login' }
          };
        }
      } catch (error) {
        // URL failed, try next
      }
    }
    return {
      healthy: false,
      error: 'No backend server is accessible'
    };
  }

  /**
   * Test specific endpoint
   */
  async testEndpoint(baseURL) {
    // Skip health check endpoint since it requires authentication
    // Go directly to alternative endpoints
    return await this.tryAlternativeEndpoints(baseURL);
  }

  /**
   * Try alternative health check endpoints
   */
  async tryAlternativeEndpoints(baseURL) {
    const endpoints = [
      '/api/test/cors', // Backend has CORS test endpoint
      '/api/contact', // Contact endpoint is permitAll
      '/actuator/health', // Spring Boot actuator
      '/health',
      '/',
      '/api/auth/login' // Try login endpoint last (should return 400/401, not connection error)
    ];

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // Use different methods for different endpoints
        const method = endpoint === '/api/test/cors' ? 'GET' : 'GET';
        const headers = {
          'Accept': 'application/json'
        };
        
        // Add Content-Type for POST requests
        if (endpoint === '/api/test/cors') {
          headers['Content-Type'] = 'application/json';
        }
        
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: method,
          headers: headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // If we get any response (even error), server is reachable
        // Accept 401 (Unauthorized) as a valid response - means server is working
        if (response.status !== 0 && response.status !== undefined) {
          // Special handling for CORS endpoint - it should return 200, not 401
          if (endpoint === '/api/test/cors' && response.status === 401) {
            // Still consider server reachable but note the issue
            return { healthy: true, data: { status: response.status, endpoint, warning: 'CORS endpoint requires auth' } };
          }
          
          return { healthy: true, data: { status: response.status, endpoint } };
        }
      } catch (error) {
        // Endpoint failed, try next
      }
    }
    
    throw new Error('Server not reachable');
  }

  /**
   * Get working backend URL
   */
  getWorkingURL() {
    return this.workingURL;
  }

  /**
   * Test login endpoint specifically
   */
  async testLoginEndpoint(baseURL) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Test with dummy credentials to check if endpoint responds
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // We expect 401 (Unauthorized) for invalid credentials, not connection error
      // Any 4xx or 5xx response means server is reachable
      if (response.status >= 400) {
        return { working: true, status: response.status };
      } else if (response.status >= 200 && response.status < 300) {
        return { working: true, status: response.status };
      } else {
        return { working: false, status: response.status };
      }
    } catch (error) {
      // Check if it's a network/connection error vs authentication error
      if (error.name === 'AbortError') {
        return { working: false, error: 'Request timeout' };
      } else if (error.message.includes('Failed to fetch') || 
                 error.message.includes('NetworkError') ||
                 error.message.includes('ERR_NETWORK') ||
                 error.message.includes('ERR_CONNECTION_REFUSED')) {
        return { working: false, error: 'Connection error' };
      } else {
        // Other errors might be authentication related, which means server is reachable
        return { working: true, status: 401, error: error.message };
      }
    }
  }

  /**
   * Fix backend connection
   */
  async fixBackendConnection() {
    // Check if backend is healthy
    const healthCheck = await this.checkBackendHealth();
    
    if (healthCheck.healthy) {
      return {
        fixed: true,
        url: healthCheck.url,
        message: 'Backend is accessible'
      };
    }
    
    // Try to test login endpoint specifically
    for (const url of this.baseURLs) {
      const loginTest = await this.testLoginEndpoint(url);
      if (loginTest.working) {
        return {
          fixed: true,
          url: url,
          message: 'Login endpoint is accessible'
        };
      }
    }
    return {
      fixed: false,
      error: 'Backend server is not accessible',
      suggestions: [
        'Check if backend server is running',
        'Verify backend URL is correct',
        'Check network connectivity',
        'Check CORS configuration',
        'Verify SSL certificate (for HTTPS)'
      ]
    };
  }

  /**
   * Get connection status
   */
  async getConnectionStatus() {
    const healthCheck = await this.checkBackendHealth();
    
    return {
      connected: healthCheck.healthy,
      url: healthCheck.url,
      error: healthCheck.error,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
export const backendHealthCheck = new BackendHealthCheck();

export default BackendHealthCheck;
