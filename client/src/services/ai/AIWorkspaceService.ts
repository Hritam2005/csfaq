import { apiClient } from '../axios';

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: any[];
}

export interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
  isPinned?: boolean;
  folderId?: string;
  messages?: ChatMessage[];
}

export class AIWorkspaceService {
  static async getConversations() {
    const res = await apiClient.get('/ai/conversations');
    return res.data;
  }

  static async getConversation(id: string) {
    const res = await apiClient.get(`/ai/conversations/${id}`);
    return res.data;
  }

  static async createConversation(title?: string) {
    const res = await apiClient.post('/ai/conversations', { title });
    return res.data;
  }

  static async updateConversation(id: string, updates: Partial<Conversation>) {
    const res = await apiClient.put(`/ai/conversations/${id}`, updates);
    return res.data;
  }

  static async deleteConversation(id: string) {
    const res = await apiClient.delete(`/ai/conversations/${id}`);
    return res.data;
  }

  static async clearHistory() {
    const res = await apiClient.delete('/ai/conversations');
    return res.data;
  }

  static async getBookmarks() {
    const res = await apiClient.get('/ai/bookmarks');
    return res.data;
  }
}
