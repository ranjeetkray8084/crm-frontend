// Debug utility to check authentication status
export const debugAuthStatus = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Authentication Debug:');
  console.log('Token exists:', !!token);
  console.log('Token length:', token ? token.length : 0);
  console.log('User exists:', !!user);
  
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      console.log('User data:', {
        id: parsedUser.id,
        userId: parsedUser.userId,
        role: parsedUser.role,
        companyId: parsedUser.companyId
      });
    } catch (e) {
      console.log('❌ User data parsing failed:', e);
    }
  }
  
  if (token) {
    try {
      // Try to decode JWT token (basic check)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', {
          exp: payload.exp,
          iat: payload.iat,
          isExpired: payload.exp ? Date.now() / 1000 > payload.exp : 'Unknown'
        });
      }
    } catch (e) {
      console.log('❌ Token parsing failed:', e);
    }
  }
  
  return { token, user };
};

// Test API call with current auth
export const testAuthenticatedCall = async () => {
  const { token, user } = debugAuthStatus();
  
  if (!token || !user) {
    console.log('❌ Missing authentication data');
    return;
  }
  
  try {
    const parsedUser = JSON.parse(user);
    const testUrl = `https://backend.leadstracker.in/api/companies/${parsedUser.companyId}/leads/count/closed-droped?adminId=${parsedUser.id || parsedUser.userId}`;
    
    console.log('🧪 Testing API call:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ API call failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Network error:', error);
  }
};