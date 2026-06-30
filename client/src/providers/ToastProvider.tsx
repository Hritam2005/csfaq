import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider: React.FC = () => {
  return (
    <Toaster 
      position="top-right" 
      toastOptions={{ 
        className: 'dark:bg-gray-800 dark:text-white border dark:border-gray-700',
        duration: 4000,
      }} 
    />
  );
};
