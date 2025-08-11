// src/utils/axios.js
import axios from "axios";

// ✅ Backend API base URL
const BASE_URL = "http://localhost:8080/";

// ✅ Create an Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// ✅ Configure default headers with auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      const isFollowUpEndpoint = error.config?.url?.includes('/followups');
      const isOnLogin = window.location.pathname.includes('/login') || window.location.pathname === '/';

      // Don't logout for follow-up API errors (temporary fix for backend JPA issue)
      if (isFollowUpEndpoint) {
        return Promise.reject(error);
      }

      // Only logout for auth endpoints or if we're not on login page
      if (isAuthEndpoint && !isOnLogin) {
        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login
        window.location.href = "/";
      }
    }

    // Handle 500 errors (like your JPA parameter binding issue)
    if (error.response?.status === 500) {
      // Don't logout for server errors
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
