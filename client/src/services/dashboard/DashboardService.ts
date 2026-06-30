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
}
