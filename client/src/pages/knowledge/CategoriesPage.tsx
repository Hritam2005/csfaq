import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Folder, Loader2 } from 'lucide-react';
import { KnowledgeService } from '../../services/knowledge/KnowledgeService';

export const CategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: () => KnowledgeService.getCategories(),
  });

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Categories</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Browse knowledge by topic area.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/faqs?category=${cat._id}`}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${cat.color || '#2563eb'}20`, color: cat.color || '#2563eb' }}
              >
                <Folder className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.name}</h3>
              {cat.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{cat.description}</p>
              )}
              <p className="mt-3 text-sm font-medium text-primary-600">{cat.faqCount || 0} articles</p>
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-12">No categories yet.</p>
          )}
        </div>
      )}
    </div>
  );
};
