/**
 * Simple Backend Check
 * Just check if backend is reachable via login endpoint
 */

class SimpleBackendCheck {
  constructor() {
    this.baseURLs = [
      'https://backend.leadstracker.in',
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ];
  }

  /**
   * Simple check - just test if login endpoint responds
   */
  async checkBackend() {
    console.log('🔍 Simple backend check...');
    
    for (const url of this.baseURLs) {
      try {
        console.log(`Testing: ${url}`);
        
        const response = await fetch(`${url}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'test123'
          })
        });
        
        // Any response means server is working
        console.log(`✅ Server reachable at ${url} (status: ${response.status})`);
        
        if (response.status === 401) {
          console.log('🎯 Perfect! 401 means server is working but credentials are wrong');
          return {
            healthy: true,
            url: url,
            message: 'Backend is working - 401 is expected for wrong credentials'
          };
        }
        
        return {
          healthy: true,
          url: url,
          message: `Server responding with status ${response.status}`
        };
        
      } catch (error) {
        console.log(`❌ ${url} failed:`, error.message);
      }
    }
    
    return {
      healthy: false,
      error: 'No backend server is accessible'
    };
  }

  /**
   * Get connection status
   */
  async getStatus() {
    return await this.checkBackend();
  }
}

// Create singleton
export const simpleBackendCheck = new SimpleBackendCheck();
export default SimpleBackendCheck;
