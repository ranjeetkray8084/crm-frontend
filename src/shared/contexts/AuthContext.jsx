import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from sessionStorage on app start (session-based auth)
    const loadUser = () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');

        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          // Clear any partial data
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        // Clear invalid data
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData, token) => {
    // Use sessionStorage instead of localStorage for session-based auth
    sessionStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      sessionStorage.setItem('token', token);
    }
    setUser(userData);
  };

  const logout = async () => {
    
    try {
      const { AuthService } = await import('../../core/services/auth.service');
      await AuthService.logout();
    } catch (error) {
      
    } finally {
      // Always clear session data regardless of API call result
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    sessionStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  // Import AuthService for OTP methods
  const sendOtp = async (email) => {
    const { AuthService } = await import('../../core/services/auth.service');
    return AuthService.sendOtp(email);
  };

  const verifyOtp = async (email, otp) => {
    const { AuthService } = await import('../../core/services/auth.service');
    return AuthService.verifyOtp(email, otp);
  };

  const resetPasswordWithOtp = async (email, newPassword) => {
    const { AuthService } = await import('../../core/services/auth.service');
    return AuthService.resetPasswordWithOtp(email, newPassword);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    sendOtp,
    verifyOtp,
    resetPasswordWithOtp,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;