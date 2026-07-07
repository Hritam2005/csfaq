import { apiClient } from './axios';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  color: string;
  icon: string;
  analytics?: {
    faqCount: number;
    documentCount: number;
  };
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  slug: string;
  category: Category;
  tags?: any[];
  difficultyLevel: string;
  estimatedReadingTime: number;
  helpfulCount: number;
  unhelpfulCount: number;
  viewCount: number;
  createdAt: string;
}

export class FAQService {
  static async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/faqs/categories');
    return response.data.data;
  }

  static async getFaqs(params?: { q?: string; category?: string }): Promise<FAQ[]> {
    const response = await apiClient.get('/faqs', { params });
    return response.data.data;
  }

  static async getFaqById(id: string): Promise<FAQ> {
    const response = await apiClient.get(`/faqs/${id}`);
    return response.data.data;
  }

  static async voteHelpful(id: string, vote: 'helpful' | 'unhelpful'): Promise<FAQ> {
    const response = await apiClient.post(`/faqs/${id}/vote`, { vote });
    return response.data.data;
  }
}
