import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
        <FileQuestion className="h-10 w-10 text-primary-600 dark:text-primary-500" />
      </div>
      <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">404 - Page Not Found</h1>
      <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">The page or resource you are looking for does not exist or has been moved.</p>
      <Link to="/">
        <Button size="lg">Return Home</Button>
      </Link>
    </div>
  );
};
