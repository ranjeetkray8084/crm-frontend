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
    for (const url of this.baseURLs) {
      try {
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
        if (response.status === 401) {
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
        // URL failed, try next
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
