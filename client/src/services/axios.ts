import axios from 'axios';
import { ENV } from '../config/env';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true, // For HttpOnly cookies if configured
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on token expiration
      store.dispatch(logout());
      toast.error('Session expired. Please log in again.');
      // Optional: window.location.href = '/login'; if not using React Router properly
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    }
    
    return Promise.reject(error);
  }
);
