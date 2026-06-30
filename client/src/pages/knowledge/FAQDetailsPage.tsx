import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const mockFaq = {
  question: 'How do I onboard a new employee?',
  answer: '### Step 1\nSubmit the IT ticket.\n### Step 2\nAssign the onboarding module via Workday.\n\n*Ensure all compliance documents are signed prior to Day 1.*',
  category: 'HR'
};

export const FAQDetailsPage: React.FC = () => {

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
      <Link to="/faqs" className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Knowledge Base
      </Link>
      
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-background">
        <span className="mb-4 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          {mockFaq.category}
        </span>
        <h1 className="mb-8 text-3xl font-extrabold text-gray-900 dark:text-white">{mockFaq.question}</h1>
        
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <ReactMarkdown>{mockFaq.answer}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
