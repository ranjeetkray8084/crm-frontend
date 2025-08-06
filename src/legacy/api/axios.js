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
    console.log('🔗 Making API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Token Status:', token ? 'Present' : 'Missing');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error("Axios Request Error:", error);
    return Promise.reject(error);
  }
);

// ✅ Handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚨 401 UNAUTHORIZED ERROR DETECTED!');
      console.error('🔗 Failed API URL:', error.config?.url);
      console.error('📝 Request Method:', error.config?.method);
      console.error('📋 Request Headers:', error.config?.headers);
      console.error('💾 Current Token:', localStorage.getItem("token") ? 'Present' : 'Missing');
      console.error('👤 Current User:', localStorage.getItem("user") ? 'Present' : 'Missing');
      console.error('📄 Full Error Response:', error.response?.data);
      
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Check if we're already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecting to login page...');
        // Store the current URL to redirect back after login
        localStorage.setItem('redirectUrl', window.location.pathname);
        // Redirect to login
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
