import React from 'react';
import { Users, Database, AlertCircle, Bot } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { UsageGraph } from '../../components/dashboard/UsageGraph';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin/AdminService';

export const AdminDashboardPage: React.FC = () => {
  const { data: statsResponse } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  });

  const stats = statsResponse?.data || { totalUsers: 0, activeUsers: 0, totalRoles: 0 };

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
