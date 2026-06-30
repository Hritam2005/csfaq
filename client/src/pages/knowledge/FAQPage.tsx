import React from 'react';
import { Link } from 'react-router-dom';
import { Book, ChevronRight } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import { apiClient } from '../../services/axios'; // Simulated for now

const mockFaqs = [
  { _id: '1', question: 'How do I onboard a new employee?', category: 'HR' },
  { _id: '2', question: 'What is the VPN setup process?', category: 'IT Support' },
  { _id: '3', question: 'How do I request PTO?', category: 'HR' },
];

export const FAQPage: React.FC = () => {
  // Real implementation:
  // const { data, isLoading } = useQuery({ queryKey: ['faqs'], queryFn: () => apiClient.get('/knowledge/faqs').then(res => res.data.data) });
  
  const isLoading = false;
  const faqs = mockFaqs;

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Knowledge Base</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Browse curated frequently asked questions.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}
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
