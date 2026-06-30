import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { YakshaMini } from '../components/ai/YakshaMini';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-background text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>
      <Footer />
      <YakshaMini />
    </div>
  );
};
