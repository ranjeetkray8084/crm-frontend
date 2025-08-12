import { DashboardService } from '../services/dashboard.service';

export const testClosedLeadsAPI = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!user.companyId || !user.id || !token) {
      console.error('❌ Missing required data:', { 
        companyId: user.companyId, 
        userId: user.id, 
        hasToken: !!token 
      });
      return;
    }
    
    console.log('🧪 Testing closed leads API with:', {
      companyId: user.companyId,
      adminId: user.id,
      role: user.role
    });
    
    const result = await DashboardService.getClosedLeadsCountByAdmin(user.companyId, user.id);
    
    if (result.success) {
      console.log('✅ API call successful:', result.data);
    } else {
      console.error('❌ API call failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Add this to window for easy testing in browser console
if (typeof window !== 'undefined') {
  window.testClosedLeadsAPI = testClosedLeadsAPI;
}