import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { MessageSquare, Database, Bookmark, Brain, Inbox, ArrowRight, MessageSquarePlus, Sparkles, Gift } from 'lucide-react';
import { useDashboardMetrics, useActivityFeed, useRecommendations } from '../../hooks/dashboard/useDashboard';
import { StatCard } from '../../components/dashboard/StatCard';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { RecommendationWidget } from '../../components/dashboard/RecommendationWidget';
import { InteractionVolumeTracker } from '../../components/dashboard/InteractionVolumeTracker';
import { UsageGraph } from '../../components/dashboard/UsageGraph';
import { DashboardService } from '../../services/dashboard/DashboardService';
import { useQuery } from '@tanstack/react-query';
import { TriageService } from '../../services/triage/TriageService';

export const DashboardOverviewPage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: metrics } = useDashboardMetrics();
  const { data: activity } = useActivityFeed();
  const { data: recommendations } = useRecommendations();

  // Live count of the current user's submitted queries
  const { data: myQueries } = useQuery({
    queryKey: ['my-queries-overview'],
    queryFn: () => TriageService.getMyQueries({ limit: 50 }),
    enabled: !!isAuthenticated && !!user?._id,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });
  const myQueriesCount = myQueries?.total ?? 0;
  // `resolved` and `closed` are terminal states per the QueryStatus union.
  const myOpenQueriesCount = (myQueries?.queries ?? []).filter(
    (q) => q.status !== 'resolved' && q.status !== 'closed'
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Header with Abstract Educational Essence */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-r from-white via-blue-50/30 to-emerald-50/20 p-8 shadow-sm backdrop-blur-xl dark:border-cyan-800/50 dark:from-gray-900/95 dark:via-blue-950/30 dark:to-emerald-950/20">
        <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-gradient-to-bl from-blue-500/15 via-indigo-500/10 to-transparent blur-[90px] rounded-full pointer-events-none -z-10 animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-[250px] h-[250px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-[70px] rounded-full pointer-events-none -z-10" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 dark:bg-cyan-400/10 border border-blue-500/30 dark:border-cyan-400/30 text-xs font-bold text-blue-700 dark:text-cyan-300 mb-2 shadow-sm backdrop-blur-md">
              🚀 Vicharanashala Research Internship Dashboard
            </span>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Welcome back, <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 dark:from-cyan-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">{(user?.fullName || user?.name || 'User').split(' ')[0]}</span>!
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
              Track your active contributions, explore crowd-sourced FAQs, and monitor your milestone progression across the IIT Ropar research ecosystem.
            </p>
          </div>
          <Link
            to="/queries/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors shrink-0"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Submit a Query
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Triage entry point CTA — high-visibility card so users discover the feature */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Link
          to="/queries/new"
          className="group lg:col-span-2 flex items-center justify-between rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5 hover:border-primary-300 transition-colors dark:border-primary-900/50 dark:from-primary-900/20 dark:to-gray-900/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white">Need help? Submit a Query</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered answers with human escalation when needed — typically resolved in minutes.
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary-600 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          to="/queries/my"
          className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors dark:border-gray-800 dark:bg-gray-900/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white">My Queries</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {myOpenQueriesCount > 0
                  ? `${myOpenQueriesCount} open · ${myQueriesCount} total`
                  : `${myQueriesCount} submitted`}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <Link
        to="/app/achievements"
        className="group flex items-center justify-between gap-4 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 via-indigo-50/50 to-white p-5 shadow-sm transition-all hover:border-primary-300 hover:shadow-md dark:border-primary-500/30 dark:bg-gradient-to-r dark:from-primary-950/40 dark:via-gray-900 dark:to-gray-900/90 dark:hover:border-primary-500/50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20 transition-transform group-hover:scale-105 dark:bg-primary-500/20 dark:text-primary-400 dark:border dark:border-primary-500/30">
            <Gift className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white">Use Spurti Points as Samagama currency</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Convert points into coupons for mentor help, learning sessions, reviews, and participant perks.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all group-hover:bg-primary-700 dark:bg-primary-500 dark:text-gray-950 dark:group-hover:bg-primary-400">Open Wallet</span>
      </Link>
      {/* Main Grid: Usage Graph & Activity Feed */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Interaction Volume Tracker (GitHub Commit Graph Style) */}
        <div className="lg:col-span-2 min-w-0">
          <InteractionVolumeTracker />
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
