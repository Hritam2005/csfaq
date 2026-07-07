import React from 'react';
import { AlertCircle, CheckCircle2, Database, FileQuestion, ShieldAlert, ToggleRight, Users } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Control Center</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enterprise system overview and live metrics.</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium">
          <div className={`flex items-center gap-1.5 ${isHealthy ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHealthy ? 'bg-green-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isHealthy ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            </span>
            {isHealthy ? 'All Systems Operational' : 'Review Needed'}
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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
          
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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
