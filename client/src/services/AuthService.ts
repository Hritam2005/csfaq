import { apiClient } from './axios';

export class AuthService {
  static async login(email: string, password: string) {
    // Generate or retrieve a persistent device ID from localStorage
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    const response = await apiClient.post('/auth/login', { 
      email, 
      password, 
      deviceId,
      deviceName: navigator.userAgent.substring(0, 50),
      browser: 'Web',
      os: 'Unknown'
    });
    return response.data;
  }

  static async googleLogin(email: string, name: string) {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    const response = await apiClient.post('/auth/google', { 
      email, 
      name,
      deviceId,
      deviceName: navigator.userAgent.substring(0, 50),
      browser: 'Web',
      os: 'Unknown'
    });
    return response.data;
  }

  static async register(data: any) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  static async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  static async getProfile() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  static async getSessions() {
    const response = await apiClient.get('/auth/sessions');
    return response.data;
  }

  static async terminateSession(sessionId: string) {
    const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  }
}
