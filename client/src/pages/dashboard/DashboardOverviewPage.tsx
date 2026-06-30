import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { MessageSquare, Database, Bookmark, Brain } from 'lucide-react';
import { useDashboardMetrics, useActivityFeed, useRecommendations } from '../../hooks/dashboard/useDashboard';
import { StatCard } from '../../components/dashboard/StatCard';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { RecommendationWidget } from '../../components/dashboard/RecommendationWidget';
import { UsageGraph } from '../../components/dashboard/UsageGraph';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { data: metrics } = useDashboardMetrics();
  const { data: activity } = useActivityFeed();
  const { data: recommendations } = useRecommendations();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Welcome back, {(user?.fullName || user?.name || 'User').split(' ')[0]}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Here is what's happening across your enterprise knowledge workspace today.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Conversations" 
          value={metrics?.activeConversations || 12} 
          icon={<MessageSquare className="h-5 w-5" />} 
          trend="+3 this week" 
          trendUp={true} 
        />
        <StatCard 
          title="Tokens Processed" 
          value={metrics?.totalTokens?.toLocaleString() || '14,290'} 
          icon={<Brain className="h-5 w-5" />} 
        />
        <StatCard 
          title="Documents Indexed" 
          value={metrics?.savedDocuments || 304} 
          icon={<Database className="h-5 w-5" />} 
          trend="+12 this month"
          trendUp={true}
        />
        <StatCard 
          title="Bookmarked Answers" 
          value={metrics?.bookmarkedAnswers || 45} 
          icon={<Bookmark className="h-5 w-5" />} 
        />
      </div>

      {/* Main Grid: Usage Graph & Activity Feed */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Token Usage Graph */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Interaction Volume</h3>
            <span className="text-xs font-medium text-gray-500">Last 7 Days</span>
          </div>
          <UsageGraph />
        </div>

        {/* Activity Timeline */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">View All</button>
          </div>
          <div className="max-h-[300px] overflow-y-auto pr-2">
            <ActivityTimeline items={activity || []} />
          </div>
        </div>
      </div>

      {/* Suggested Knowledge / Recommendations */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Suggested Knowledge</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Based on your recent queries and roles.</p>
        </div>
        <RecommendationWidget items={recommendations || []} />
      </div>

    </div>
  );
};
