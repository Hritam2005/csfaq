import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Book, ChevronRight, Search, FolderOpen } from 'lucide-react';
import { KnowledgeService, KnowledgeFaq } from '../../services/knowledge/KnowledgeService';

export const FAQPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';
  const [search, setSearch] = useState('');

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs', search, categoryFilter],
    queryFn: () => KnowledgeService.getFaqs({ q: search || undefined, category: categoryFilter || undefined }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: () => KnowledgeService.getCategories(),
  });

  const getCategoryName = (faq: KnowledgeFaq) => {
    if (typeof faq.category === 'object' && faq.category?.name) return faq.category.name;
    return 'General';
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Knowledge Base</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Browse official FAQs about the Vicharanashala internship. Yaksha uses this content to answer your questions.
        </p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <Link
          to="/categories"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <FolderOpen className="h-4 w-4" />
          Browse Categories
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/faqs"
            className={`rounded-full px-3 py-1 text-xs font-medium border ${
              !categoryFilter ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/faqs?category=${cat._id}`}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${
                categoryFilter === cat._id ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              {cat.name} ({cat.faqCount || 0})
            </Link>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-700">
          No articles found. Try a different search or browse categories.
        </div>
      ) : (
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <Link
              key={faq._id}
              to={`/faqs/${faq._id}`}
              className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary-100 p-3 text-primary-600 dark:bg-primary-900/30 dark:text-primary-500">
                  <Book className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {faq.question}
                  </h3>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{getCategoryName(faq)}</span>
                  {faq.summary && <p className="mt-1 text-sm text-gray-500 line-clamp-1">{faq.summary}</p>}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
