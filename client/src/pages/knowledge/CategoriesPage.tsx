import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Folder } from 'lucide-react';

const mockCategories = [
  { _id: 'c1', name: 'HR', count: 42 },
  { _id: 'c2', name: 'IT Support', count: 156 },
  { _id: 'c3', name: 'Engineering', count: 89 },
  { _id: 'c4', name: 'Sales', count: 24 },
];

export const CategoriesPage: React.FC = () => {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/app');
  const linkPrefix = isDashboard ? '/app/collections' : '/categories';

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Categories</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Browse knowledge by department and topic.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockCategories.map((cat) => (
          <Link 
            key={cat._id}
            to={`${linkPrefix}/${encodeURIComponent(cat.name)}`}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Folder className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.name}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{cat.count} articles</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

