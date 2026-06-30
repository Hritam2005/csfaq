import React from 'react';
import { useActivityFeed } from '../../hooks/dashboard/useDashboard';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';

export const ActivityPage: React.FC = () => {
  const { data, isLoading } = useActivityFeed();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Activity</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          A comprehensive timeline of your searches, reads, and AI conversations.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}
          </div>
        ) : (
          <ActivityTimeline items={data || []} />
        )}
      </div>
    </div>
  );
};
