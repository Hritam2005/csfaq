import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/ai/Sidebar';

export const AIWorkspaceLayout: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col relative min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
