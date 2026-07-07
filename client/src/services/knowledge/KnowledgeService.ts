import { apiClient } from '../axios';

export interface KnowledgeCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  faqCount?: number;
}

export interface KnowledgeFaq {
  _id: string;
  question: string;
  answer?: string;
  summary?: string;
  slug?: string;
  category?: KnowledgeCategory | string;
  popularityScore?: number;
  helpfulCount?: number;
  unhelpfulCount?: number;
  approvalStatus?: string;
  visibility?: string;
  publishedAt?: string;
  difficultyLevel?: string;
  relatedFaqs?: KnowledgeFaq[];
}

export class KnowledgeService {
  static async getFaqs(params?: { q?: string; category?: string }) {
    const res = await apiClient.get('/knowledge/faqs', { params });
    return res.data.data as KnowledgeFaq[];
  }

  static async getPopularFaqs(limit = 6) {
    const res = await apiClient.get('/knowledge/faqs/popular', { params: { limit } });
    return res.data.data as KnowledgeFaq[];
  }

  static async getFaq(id: string) {
    const res = await apiClient.get(`/knowledge/faqs/${id}`);
    return res.data.data as KnowledgeFaq;
  }

  static async getCategories() {
    const res = await apiClient.get('/knowledge/faqs/categories');
    return res.data.data as KnowledgeCategory[];
  }

  static async submitFeedback(id: string, type: 'helpful' | 'unhelpful') {
    const res = await apiClient.post(`/knowledge/faqs/${id}/feedback`, { type });
    return res.data.data;
  }

  static async getAllFaqsAdmin() {
    const res = await apiClient.get('/knowledge/faqs/admin/all');
    return res.data.data as KnowledgeFaq[];
  }

  static async createFaq(data: { question: string; answer: string; category: string; summary?: string }) {
    const res = await apiClient.post('/knowledge/faqs', data);
    return res.data.data as KnowledgeFaq;
  }

  static async updateFaq(id: string, data: Partial<KnowledgeFaq>) {
    const res = await apiClient.put(`/knowledge/faqs/${id}`, data);
    return res.data.data as KnowledgeFaq;
  }

  static async publishFaq(id: string) {
    const res = await apiClient.put(`/knowledge/faqs/${id}/publish`);
    return res.data.data as KnowledgeFaq;
  }

  static async deleteFaq(id: string) {
    const res = await apiClient.delete(`/knowledge/faqs/${id}`);
    return res.data;
  }
}
