import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { MessageSquare, Database, Brain, Gift } from 'lucide-react';
import { useDashboardMetrics, useActivityFeed, useRecommendations } from '../../hooks/dashboard/useDashboard';
import { StatCard } from '../../components/dashboard/StatCard';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { RecommendationWidget } from '../../components/dashboard/RecommendationWidget';
import { UsageGraph } from '../../components/dashboard/UsageGraph';
import { DashboardService } from '../../services/dashboard/DashboardService';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { data: metrics } = useDashboardMetrics();
  const { data: activity } = useActivityFeed();
  const { data: recommendations } = useRecommendations();
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const storageKey = `spurti-redemptions-${user?._id || user?.email || 'guest'}`;

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setRedemptions(local);
    } catch (e) {}

    if (user) {
      DashboardService.getUserRedemptions()
        .then((dbRedemptions) => {
          const mapped = dbRedemptions.map((r: any) => ({
            id: r._id,
            title: r.title,
            cost: r.cost,
            code: r.code,
            redeemedAt: r.redeemedAt || r.createdAt,
            used: r.used
          }));
          setRedemptions(mapped);
        })
        .catch((err) => console.error('Failed to load redemptions on overview:', err));
    }
  }, [user, storageKey]);

  const spentPoints = useMemo(() => {
    return redemptions.reduce((total, r) => total + r.cost, 0);
  }, [redemptions]);

  const earnedPoints = useMemo(() => {
    const conversationPoints = (metrics?.activeConversations || 0) * 15;
    const bookmarkPoints = (metrics?.bookmarkedAnswers || 0) * 10;
    const activityPoints = (activity?.length || 0) * 8;
    return 250 + conversationPoints + bookmarkPoints + activityPoints;
  }, [activity?.length, metrics?.activeConversations, metrics?.bookmarkedAnswers]);

  const sourcePoints = user?.spurtiPointsSyncedAt && user?.spurtiPoints !== undefined && user?.spurtiPoints !== null
    ? user.spurtiPoints
    : earnedPoints;
  const spurtiPoints = user?.spurtiPointsSyncedAt && user?.spurtiPoints !== undefined && user?.spurtiPoints !== null
    ? user.spurtiPoints
    : Math.max(sourcePoints - spentPoints, 0);

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
          title="Spurti Points" 
          value={spurtiPoints.toLocaleString()} 
          icon={<Gift className="h-5 w-5" />} 
          trend="Samagama credits"
          trendUp={true}
        />
      </div>

      <Link
        to="/app/achievements"
        className="flex items-center justify-between gap-4 rounded-xl border border-primary-100 bg-primary-50 p-5 text-primary-900 shadow-sm transition-colors hover:bg-primary-100 dark:border-primary-900/40 dark:bg-primary-950/30 dark:text-primary-100 dark:hover:bg-primary-900/30"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-primary-600 dark:bg-gray-900 dark:text-primary-400">
            <Gift className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Use Spurti Points as Samagama currency</p>
            <p className="text-sm text-primary-700 dark:text-primary-300">Convert points into coupons for mentor help, learning sessions, reviews, and participant perks.</p>
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold">Open Wallet</span>
      </Link>

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
