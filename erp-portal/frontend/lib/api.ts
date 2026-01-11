import axios from 'axios';
import { useAuthStore } from './store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Enterprise Standard: Return the 'data' field directly to the caller
    // Only if it follows our protocol { success: true, data: ... }
    if (response.data && response.data.success) {
      return response.data;
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Global Error Handling Logic
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || 'A critical system error occurred. Please contact architecture support.';
    
    // Auto-logout on token expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
    }

    console.error(`[API ERROR] ${error.response?.status}:`, errorMessage);
    
    // Reject with a clean object the UI can easily display
    return Promise.reject({
        message: errorMessage,
        code: errorData?.error_code || 'NETWORK_ERROR',
        details: errorData?.details || {}
    });
  }
);

export default api;
