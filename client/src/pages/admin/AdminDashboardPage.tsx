import React from 'react';
import { AlertCircle, CheckCircle2, FileQuestion, ShieldAlert, ToggleRight, Users } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { UsageGraph } from '../../components/dashboard/UsageGraph';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin/AdminService';

export const AdminDashboardPage: React.FC = () => {
  const { data: statsResponse } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
    refetchInterval: 5000,
  });

  const stats = statsResponse?.data || {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    totalRoles: 0,
    totalFaqs: 0,
    publishedFaqs: 0,
    pendingFaqs: 0,
    totalQueries: 0,
    pendingQueries: 0,
    resolvedQueries: 0,
    failedAuditEvents: 0,
    enabledFeatures: 0,
    latestBackup: null,
    recentActivity: [],
  };


  const queryResolution = stats.totalQueries
    ? Math.round((stats.resolvedQueries / stats.totalQueries) * 100)
    : 0;
  const activeUserRate = stats.totalUsers
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;
  const isHealthy = stats.failedAuditEvents === 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner matching User Section Essence */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/20 p-8 shadow-sm backdrop-blur-xl dark:border-cyan-800/50 dark:from-gray-900/95 dark:via-blue-950/30 dark:to-indigo-950/20">
        <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-gradient-to-bl from-blue-500/15 via-indigo-500/10 to-transparent blur-[90px] rounded-full pointer-events-none -z-10 animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-[250px] h-[250px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-transparent blur-[70px] rounded-full pointer-events-none -z-10" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 dark:bg-cyan-400/10 border border-blue-500/30 dark:border-cyan-400/30 text-xs font-bold text-blue-700 dark:text-cyan-300 mb-2 shadow-sm backdrop-blur-md">
              🛡️ Vicharanashala Enterprise Control Center
            </span>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              System Overview & <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-primary-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Live Metrics</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
              Monitor enterprise system health, manage access roles, review crowd-sourced contributions, and oversee platform activity in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium shrink-0">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border shadow-sm ${isHealthy ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300'}`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="font-bold">{isHealthy ? 'All Systems Operational' : 'Review Needed'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={<Users className="h-5 w-5 text-blue-500" />} 
          trend={`${stats.activeUsers} active`} 
          trendUp={true} 
        />

        <StatCard 
          title="Pending Queries" 
          value={stats.pendingQueries.toLocaleString()} 
          icon={<FileQuestion className="h-5 w-5 text-violet-500" />} 
          trend={`${stats.resolvedQueries} resolved`}
          trendUp={stats.pendingQueries === 0}
        />
        <StatCard 
          title="Security Events" 
          value={stats.failedAuditEvents.toLocaleString()} 
          icon={<ShieldAlert className="h-5 w-5 text-red-500" />} 
          trend="last 7 days"
          trendUp={stats.failedAuditEvents === 0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Needs Attention</h3>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-4 space-y-3 text-sm">

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">FAQs pending review</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.pendingFaqs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">User questions waiting</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.pendingQueries}</span>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Knowledge Base</h3>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedFaqs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Published FAQs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRoles}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Access roles</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Controls</h3>
            <ToggleRight className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Enabled features</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.enabledFeatures}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Latest backup</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.latestBackup?.status || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Analytics Chart */}
        <div className="lg:col-span-2 group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Platform Usage</h3>
            <select className="text-sm rounded-md border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <UsageGraph data={stats.usageData || []} />
        </div>

        {/* System Health / Quick Stats */}
        <div className="space-y-6">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Health</h3>
            <div className="space-y-4">

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Query Resolution</span>
                  <span className="font-medium text-gray-900 dark:text-white">{queryResolution}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${queryResolution}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">{activeUserRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${activeUserRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <ActivityTimeline items={stats.recentActivity} />
          </div>
        </div>

      </div>


    </div>
  );
};
