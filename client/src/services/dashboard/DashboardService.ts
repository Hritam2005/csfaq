import { apiClient } from '../axios';

export interface DashboardMetrics {
  totalTokens: number;
  activeConversations: number;
  savedDocuments: number;
  bookmarkedAnswers: number;
}

export interface ActivityFeedItem {
  _id: string;
  type: 'search' | 'document_read' | 'conversation' | 'bookmark' | 'download' | 'upload';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: any;
}

export interface Recommendation {
  _id: string;
  type: 'faq' | 'document' | 'knowledge';
  title: string;
  relevanceScore: number;
  summary: string;
}

export interface SamagamaPointsSync {
  email: string;
  points: number;
  source: 'samagama';
  syncedAt: string;
}

export class DashboardService {
  static async getMetrics() {
    const res = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
    return res.data;
  }

  static async getActivityFeed() {
    const res = await apiClient.get<ActivityFeedItem[]>('/dashboard/activity');
    return res.data;
  }

  static async getRecommendations() {
    const res = await apiClient.get<Recommendation[]>('/dashboard/recommendations');
    return res.data;
  }

  static async getCollections() {
    const res = await apiClient.get('/dashboard/collections');
    return res.data;
  }

  static async getDownloads() {
    const res = await apiClient.get('/dashboard/downloads');
    return res.data;
  }

  static async getUploads() {
    const res = await apiClient.get('/dashboard/uploads');
    return res.data;
  }

  static async syncSamagamaPoints(email: string, password: string) {
    const res = await apiClient.post('/samagama/spurti-points/sync', { email, password });
    return res.data.data as SamagamaPointsSync;
  }

  static async getUserRedemptions() {
    const res = await apiClient.get('/samagama/redemptions');
    return res.data.data as any[];
  }

  static async createUserRedemption(title: string, cost: number, code: string) {
    const res = await apiClient.post('/samagama/redemptions', { title, cost, code });
    return res.data.data;
  }

  static async markRedemptionUsed(id: string) {
    const res = await apiClient.patch(`/samagama/redemptions/${id}/use`);
    return res.data.data;
  }
}
