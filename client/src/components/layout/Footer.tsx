import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-background">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 dark:from-cyan-500 dark:via-blue-600 dark:to-emerald-500 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 dark:from-cyan-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent tracking-tight">
              Vicharanashala
            </span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-2">
            A research lab at IIT Ropar. Work on a real open-source project under a mentor, after a short training phase tailored to where you already are.
          </p>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Vicharanashala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
