import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Info, Calendar, FileText, Mail, Briefcase, MessageSquare, Users, Award, BookOpen, Video, Zap, MessageCircle, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FAQService } from '../../services/faqService';

// Map icon string from database to Lucide icon component
const iconMap: Record<string, React.ComponentType<any>> = {
  'info': Info,
  'calendar': Calendar,
  'file-text': FileText,
  'mail': Mail,
  'briefcase': Briefcase,
  'message-square': MessageSquare,
  'users': Users,
  'award': Award,
  'book-open': BookOpen,
  'video': Video,
  'zap': Zap,
  'message-circle': MessageCircle,
  'play': Play
};

export const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: FAQService.getCategories
  });

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Categories</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Browse knowledge by department and topic.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 dark:bg-red-950/20 dark:text-red-400">
          Failed to load categories. Please try again.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Folder;
            return (
              <Link
                key={cat._id}
                to={`/faqs?category=${cat._id}`}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div>
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                  {cat.description && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
                <p className="mt-4 text-xs font-semibold text-primary-600 dark:text-primary-400">
                  {cat.analytics?.faqCount || 0} FAQ articles →
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

