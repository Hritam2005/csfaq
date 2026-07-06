import React from 'react';
import { Sidebar } from '../../components/ai/Sidebar';
import { ConversationPage } from './ConversationPage';

export const AIHistoryPage: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[600px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col relative min-w-0">
        <ConversationPage />
      </div>
    </div>
  );
};
