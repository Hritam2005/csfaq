import { apiClient } from '../axios';

export const adminApi = {
  getConfigs: async () => {
    const response = await apiClient.get('/admin/config');
    return response.data;
  },
  
  updateConfig: async (key: string, value: any) => {
    const response = await apiClient.put('/admin/config', { key, value });
    return response.data;
  },
  
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  
  getRoles: async () => {
    const response = await apiClient.get('/admin/roles');
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  }
};
