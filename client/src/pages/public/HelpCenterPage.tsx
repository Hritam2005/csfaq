import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageTemplate } from '../../components/layout/LegalPageTemplate';

export const HelpCenterPage: React.FC = () => {
  return (
    <LegalPageTemplate 
      title="Help Center" 
      lastUpdated="October 1, 2023"
      content={
        <>
          <p>Welcome to the Platform Help Center. Most of your questions can be answered instantly by our AI.</p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Link to="/faqs" className="block rounded-xl border border-gray-200 p-6 hover:border-primary-500 dark:border-gray-800">
              <h3 className="m-0 mb-2">Browse the Knowledge Base</h3>
              <p className="m-0 text-sm">Read through our curated, expert-verified articles.</p>
            </Link>
            
            <Link to="/search" className="block rounded-xl border border-gray-200 p-6 hover:border-primary-500 dark:border-gray-800">
              <h3 className="m-0 mb-2">Use Enterprise Search</h3>
              <p className="m-0 text-sm">Can't find it? Search across all documents instantly.</p>
            </Link>
          </div>
        </>
      }
    />
  );
};
