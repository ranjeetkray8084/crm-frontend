// Authentication Hook - Reusable for Web & Mobile
import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();

      if (currentUser && token) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await AuthService.login(credentials);

      if (result.success) {
        AuthService.saveSession(result.user, result.token);
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call result
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    AuthService.saveSession(newUserData, AuthService.getToken());
    setUser(newUserData);
  };

  // ✅ ADD THESE METHODS
  const sendOtp = (email) => AuthService.sendOtp(email);
  const verifyOtp = (email, otp) => AuthService.verifyOtp(email, otp);
  const resetPasswordWithOtp = (email, newPassword) =>
    AuthService.resetPasswordWithOtp(email, newPassword);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    sendOtp,
    verifyOtp,
    resetPasswordWithOtp,
  };
};
