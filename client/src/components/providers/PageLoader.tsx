import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading Platform...</p>
      </div>
    </div>
  );
};
