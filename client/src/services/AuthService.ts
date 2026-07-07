import { apiClient } from './axios';

export class AuthService {
  static async login(email: string, password: string, loginType?: string) {
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
      os: 'Unknown',
      loginType
    });
    return response.data;
  }

  static async googleLogin(token: string, loginType?: string, action?: string, name?: string) {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    const response = await apiClient.post('/auth/google', { 
      token,
      deviceId,
      deviceName: navigator.userAgent.substring(0, 50),
      browser: 'Web',
      os: 'Unknown',
      loginType,
      action,
      name
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

  static async dropOutInternship() {
    const response = await apiClient.post('/auth/dropout');
    return response.data;
  }
}
