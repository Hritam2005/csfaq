// =============================================================================
// Shared axios instances.
// - `apiClient`         -> main CSFAQ backend (port 5000, /api/v1)
// - `triageApiClient`   -> Query Triage microservice (port 5001, /api/v1)
// Both share the same JWT bearer token from the redux auth slice so the same
// logged-in user is automatically authenticated against either service.
// =============================================================================

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

// ---------------------------------------------------------------------------
// Query Triage microservice client
// ---------------------------------------------------------------------------
export const triageApiClient = axios.create({
  baseURL: ENV.TRIAGE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor – attach JWT for both clients.
const attachToken = (config: any) => {
  const state = store.getState();
  const token = state.auth.token;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(attachToken, (error) => Promise.reject(error));
triageApiClient.interceptors.request.use(attachToken, (error) => Promise.reject(error));

// Response Interceptor – handles 401/403 for both clients. Triage responses
// already follow the { success, statusCode, message, data } envelope, so we
// transparently unwrap `.data` for callers.
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

triageApiClient.interceptors.response.use(
  (response) => {
    // Auto-unwrap the standard envelope so callers can just use `res.data.data`.
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      toast.error('Session expired. Please log in again.');
    }
    // Surface backend validation messages via toast only when an explicit
    // handler hasn't already been registered. The submit form uses its own
    // mutation onError to display context-specific toasts.
    return Promise.reject(error);
  }
);
