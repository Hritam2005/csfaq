import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Database, AlertCircle, Bot, Inbox, PieChart, Activity as ActivityIcon, ArrowRight, CheckCircle2, FileQuestion, ShieldAlert, ToggleRight } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { UsageGraph } from '../../components/dashboard/UsageGraph';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin/AdminService';
import { TriageService } from '../../services/triage/TriageService';

export const AdminDashboardPage: React.FC = () => {
  const { data: statsResponse } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  });

  // Live triage capacity: drives the stat card AND the "Open Triage Inbox" CTA label
  const { data: capacity } = useQuery({
    queryKey: ['triage-capacity-overview'],
    queryFn: TriageService.getCapacity,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

  const stats = statsResponse?.data || { totalUsers: 0, activeUsers: 0, totalRoles: 0 };
  const activeCases = capacity?.activeCases ?? 0;
  const capacityPct = Math.round((capacity?.capacityPercent ?? 0) * 100);
  const capacityStatus = capacity?.status ?? 'normal';
  const isHealthy = capacityStatus !== 'critical' && capacityStatus !== 'warning';

  // Hardcoded placeholders for now since we are building UI
  const mockSystemActivity: any[] = [
    { _id: '1', title: 'System Backup Complete', description: 'Automated backup completed successfully', timestamp: '10 mins ago', type: 'download' as any },
    { _id: '2', title: 'New User Registration', description: 'john.doe@enterprise.com registered', timestamp: '1 hour ago', type: 'bookmark' as any },
    { _id: '3', title: 'LLM Latency Spike', description: 'OpenAI API latency exceeded 2000ms', timestamp: '3 hours ago', type: 'search' as any },
    { _id: '4', title: 'Knowledge Sync', description: 'Synchronized 150 documents from SharePoint', timestamp: '5 hours ago', type: 'upload' as any },
  ];

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

      {/* Triage quick-actions — primary entry points to the query-triage microservice */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/admin/triage/inbox"
          className="group flex items-center justify-between rounded-xl border border-red-200 bg-red-50/60 p-4 hover:bg-red-50 hover:border-red-300 transition-colors dark:border-red-900/40 dark:bg-red-900/10 dark:hover:bg-red-900/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Triage Inbox</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {activeCases > 0 ? `${activeCases} awaiting human` : 'No cases waiting'}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-red-600 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          to="/admin/triage/capacity"
          className="group flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors dark:border-blue-900/40 dark:bg-blue-900/10 dark:hover:bg-blue-900/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ActivityIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Team Capacity</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {capacityPct}% utilised · {capacityStatus}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          to="/admin/triage/workload"
          className="group flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-4 hover:bg-purple-50 hover:border-purple-300 transition-colors dark:border-purple-900/40 dark:bg-purple-900/10 dark:hover:bg-purple-900/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Workload</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Per-resolver distribution</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-600 transition-transform group-hover:translate-x-1" />
        </Link>
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
          title="Knowledge Documents" 
          value="45,302" 
          icon={<Database className="h-5 w-5 text-indigo-500" />} 
          trend="+5.4% this month"
          trendUp={true}
        />
        <StatCard 
          title="Total Roles" 
          value={stats.totalRoles.toLocaleString()} 
          icon={<Bot className="h-5 w-5 text-purple-500" />} 
          trend="System Roles"
        />
        <StatCard
          title="Triage Queue"
          value={activeCases.toString()}
          icon={<Inbox className="h-5 w-5 text-red-500" />}
          trend={activeCases > 0 ? `${activeCases} awaiting human` : 'All clear'}
          trendUp={activeCases === 0}
        />
        <StatCard
          title="Resolver Capacity"
          value={`${capacityPct}%`}
          icon={<ActivityIcon className="h-5 w-5 text-blue-500" />}
          trend={capacityStatus === 'critical' ? 'Critical load' : capacityStatus === 'warning' ? 'High load' : 'Normal'}
        />
        <StatCard
          title="System Errors"
          value="24"
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          trend="-2% this week"
          trendUp={true}
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
          <UsageGraph />
        </div>

        {/* System Health / Quick Stats */}
        <div className="space-y-6">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Database Load</span>
                  <span className="font-medium text-gray-900 dark:text-white">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Vector Storage</span>
                  <span className="font-medium text-gray-900 dark:text-white">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">API Rate Limits</span>
                  <span className="font-medium text-gray-900 dark:text-white">12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <ActivityTimeline items={mockSystemActivity} />
          </div>
        </div>

      </div>

      {/* Background Jobs Monitoring */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50 overflow-hidden flex flex-col h-[600px]">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Background Job Metrics (BullMQ)</h3>
          <p className="text-sm text-gray-500">Live monitoring of system background queues.</p>
        </div>
        <iframe 
          src="http://localhost:5000/admin/queues" 
          title="BullBoard"
          className="w-full flex-1 border-none bg-white"
        />
      </div>
    </div>
  );
};
