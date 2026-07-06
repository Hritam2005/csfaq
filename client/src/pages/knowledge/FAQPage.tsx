import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Book, ChevronRight, ChevronLeft } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import { apiClient } from '../../services/axios'; // Simulated for now

const mockFaqs = [
  { _id: '1', question: 'How do I onboard a new employee?', category: 'HR' },
  { _id: '2', question: 'What is the VPN setup process?', category: 'IT Support' },
  { _id: '3', question: 'How do I request PTO?', category: 'HR' },
];

export const FAQPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { pathname } = useLocation();
  
  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : undefined;
  
  const isLoading = false;
  // Filter FAQs if categoryName is provided
  const faqs = decodedCategory
    ? mockFaqs.filter(faq => faq.category.toLowerCase() === decodedCategory.toLowerCase())
    : mockFaqs;

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-5xl">
      {decodedCategory && (
        <Link 
          to={pathname.startsWith('/app') ? '/app/collections' : '/categories'} 
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Categories
        </Link>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {decodedCategory ? `${decodedCategory} FAQs` : 'Knowledge Base'}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {decodedCategory ? `Browse frequently asked questions for ${decodedCategory}.` : 'Browse curated frequently asked questions.'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50">
          <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No FAQs found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">There are currently no questions categorized under {decodedCategory}.</p>
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
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">{faq.question}</h3>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{faq.category}</span>
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

