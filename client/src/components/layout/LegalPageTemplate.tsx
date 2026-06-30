import React from 'react';

export const LegalPageTemplate: React.FC<{ title: string, lastUpdated: string, content: React.ReactNode }> = ({ title, lastUpdated, content }) => {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-4xl">
      <div className="mb-10 border-b border-gray-200 pb-8 dark:border-gray-800">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Last Updated: {lastUpdated}</p>
      </div>
      <div className="prose prose-gray max-w-none dark:prose-invert">
        {content}
      </div>
    </div>
  );
};
