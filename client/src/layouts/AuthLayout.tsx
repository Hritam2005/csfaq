import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background">
      {/* Left side: branding/imagery */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary-600 p-12 lg:flex dark:bg-primary-900">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <span className="text-2xl font-bold text-primary-600">A</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Enterprise Knowledge</span>
        </div>
        
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Unify your collective<br/>intelligence securely.
          </h1>
          <p className="mt-4 text-lg text-primary-100">
            Log in to access your organization's private documents, FAQs, and autonomous AI systems.
          </p>
        </div>
        
        <div className="text-sm text-primary-200">
          &copy; {new Date().getFullYear()} Enterprise Knowledge Platform. All rights reserved.
        </div>
      </div>

      {/* Right side: Auth Form Outlet */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
