import React from 'react';
import { Users, Database, AlertCircle, Bot, MessageSquare, Clock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { UsageGraph } from '../../components/dashboard/UsageGraph';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { Link } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin/AdminService';

export const AdminDashboardPage: React.FC = () => {
  const { data: statsResponse } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  });

  const stats = statsResponse?.data || { 
    totalUsers: 0, 
    activeUsers: 0, 
    totalRoles: 0,
    queryStats: { total: 0, pending: 0, resolved: 0, dismissed: 0, critical: 0, pendingCritical: 0 },
    mostCriticalQueries: []
  };

  const queryStats = stats.queryStats || { total: 0, pending: 0, resolved: 0, dismissed: 0, critical: 0, pendingCritical: 0 };
  const mostCriticalQueries = stats.mostCriticalQueries || [];
  const resolutionRate = queryStats.total > 0 ? Math.round((queryStats.resolved / queryStats.total) * 100) : 0;

  // Hardcoded placeholders for now since we are building UI
  const mockSystemActivity: any[] = [
    { _id: '1', title: 'System Backup Complete', description: 'Automated backup completed successfully', timestamp: '10 mins ago', type: 'download' as any },
    { _id: '2', title: 'New User Registration', description: 'john.doe@enterprise.com registered', timestamp: '1 hour ago', type: 'bookmark' as any },
    { _id: '3', title: 'LLM Latency Spike', description: 'OpenAI API latency exceeded 2000ms', timestamp: '3 hours ago', type: 'search' as any },
    { _id: '4', title: 'Knowledge Sync', description: 'Synchronized 150 documents from SharePoint', timestamp: '5 hours ago', type: 'upload' as any },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Control Center</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enterprise system overview and live metrics.</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium">
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            All Systems Operational
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
          title="System Errors" 
          value="24" 
          icon={<AlertCircle className="h-5 w-5 text-red-500" />} 
          trend="-2% this week"
          trendUp={true}
        />
      </div>

      {/* Query & Support Statistics Section */}
      <div className="pt-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Support & Query Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Queries" 
            value={queryStats.total.toLocaleString()} 
            icon={<MessageSquare className="h-5 w-5 text-blue-500" />} 
            trend={`${queryStats.resolved} resolved`} 
            trendUp={true} 
          />
          <StatCard 
            title="Pending Queries" 
            value={queryStats.pending.toLocaleString()} 
            icon={<Clock className="h-5 w-5 text-amber-500" />} 
            trend="Needs response" 
          />
          <div className="relative overflow-hidden rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Critical Queries</p>
              <div className="rounded-md bg-red-100 dark:bg-red-900/40 p-2 text-red-600 dark:text-red-400">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-red-950 dark:text-red-100">{queryStats.critical.toLocaleString()}</h3>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {queryStats.pendingCritical} pending
              </span>
            </div>
          </div>
          <StatCard 
            title="Resolution Rate" 
            value={`${resolutionRate}%`} 
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} 
            trend={resolutionRate >= 80 ? "Good performance" : "Under target"}
            trendUp={resolutionRate >= 80} 
          />
        </div>
      </div>

      {/* High-Priority Support Queries and Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Most Critical Queries list (Span 2) */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Most Critical Queries</h3>
              <p className="text-sm text-gray-500">Unresolved query tickets containing urgent keywords.</p>
            </div>
            <Link to="/admin/queries" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              Manage Queries <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {mostCriticalQueries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-2 animate-bounce" />
                <p className="font-medium text-gray-900 dark:text-white">All Clear!</p>
                <p className="text-sm text-gray-500 mt-1">No critical queries require immediate attention.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {mostCriticalQueries.map((query: any) => (
                  <div key={query._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-2 rounded-lg transition-colors">
                    <div className="space-y-1 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        {query.status === 'Pending' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {query.user?.fullName || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">({query.user?.email})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          query.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          query.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {query.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic font-mono bg-gray-50 dark:bg-gray-900/80 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 mt-1.5">
                        "{query.question}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                      <Link to={`/admin/queries?id=${query._id}`}>
                        <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1">
                          Resolve
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Query Resolution Status Card (Span 1) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Query Breakdown</h3>
            <p className="text-sm text-gray-500 mb-6">Status distribution of user tickets.</p>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Pending Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span> Pending
                </span>
                <span className="text-gray-950 dark:text-white">{queryStats.pending} ({queryStats.total > 0 ? Math.round((queryStats.pending / queryStats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${queryStats.total > 0 ? (queryStats.pending / queryStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Resolved Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span> Resolved
                </span>
                <span className="text-gray-950 dark:text-white">{queryStats.resolved} ({queryStats.total > 0 ? Math.round((queryStats.resolved / queryStats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${queryStats.total > 0 ? (queryStats.resolved / queryStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Dismissed Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span> Dismissed
                </span>
                <span className="text-gray-950 dark:text-white">{queryStats.dismissed} ({queryStats.total > 0 ? Math.round((queryStats.dismissed / queryStats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                <div 
                  className="bg-gray-400 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${queryStats.total > 0 ? (queryStats.dismissed / queryStats.total) * 100 : 0}%` }}
                ></div>
              </div>
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
          <UsageGraph />
        </div>

        {/* System Health / Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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
          
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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
