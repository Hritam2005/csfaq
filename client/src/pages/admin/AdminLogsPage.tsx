import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin/AdminService';
import { Search, Server, ChevronDown, ChevronUp, RefreshCw, HardDrive, Shield } from 'lucide-react';

export const AdminLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: response, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => adminApi.getAuditLogs(page),
    placeholderData: (previousData) => previousData,
  });

  const logs = useMemo(() => response?.data || [], [response]);

  // Track expanded log IDs for details collapse
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      // 1. Search text filter
      const admin = log.adminId || {};
      const query = searchText.toLowerCase().trim();
      if (query) {
        const nameMatch = admin.name?.toLowerCase().includes(query);
        const emailMatch = admin.email?.toLowerCase().includes(query);
        const resourceMatch = log.resource?.toLowerCase().includes(query);
        const detailsMatch = typeof log.details === 'string' 
          ? log.details.toLowerCase().includes(query)
          : JSON.stringify(log.details || {}).toLowerCase().includes(query);
        
        if (!nameMatch && !emailMatch && !resourceMatch && !detailsMatch) return false;
      }

      // 2. Action filter
      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false;
      }

      return true;
    });
  }, [logs, searchText, actionFilter]);

  // Unique actions list for filtering
  const allActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach((l: any) => {
      if (l.action) actions.add(l.action);
    });
    return Array.from(actions);
  }, [logs]);

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    if (act.includes('CONFIG') || act.includes('SETTING')) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    if (act.includes('DELETE') || act.includes('REVOKE')) return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('BACKUP')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-990/20 dark:text-emerald-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Monitoring & Audit Logs</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Audit system actions, config changes, backups, and security auth logs.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Metric Cards */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Server className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Items (This Page)</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{filteredLogs.length}</h4>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-650 dark:bg-blue-900/20 dark:text-blue-400">
            <Shield className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Authentication Page</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Page {page}</h4>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-650 dark:bg-amber-900/20 dark:text-amber-400">
            <HardDrive className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Log Entries Max Limit</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">50 per page</h4>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        {/* Filter bar */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by Admin, key action details..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-450 focus:border-primary-500 focus:ring-1 focus:ring-primary-505 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none dark:border-gray-805 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="all">All Actions</option>
              {allActions.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No audit log events found.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-950/50 dark:text-gray-450 border-b border-gray-100 dark:border-gray-850">
                <tr>
                  <th scope="col" className="w-10 px-6 py-4"></th>
                  <th scope="col" className="px-6 py-4">Timestamp</th>
                  <th scope="col" className="px-6 py-4">Administrator</th>
                  <th scope="col" className="px-6 py-4">Action</th>
                  <th scope="col" className="px-6 py-4">Resource Target</th>
                  <th scope="col" className="px-6 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLogs.map((log: any) => {
                  const admin = log.adminId || {};
                  const isExpanded = expandedLogId === log._id;
                  return (
                    <React.Fragment key={log._id}>
                      <tr 
                        onClick={() => toggleExpand(log._id)}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-950/10 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {admin.name || 'API Client'}
                          </div>
                          {admin.email && <div className="text-xs text-gray-500">{admin.email}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {log.resource || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                          {log.ipAddress || 'unknown'}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50/50 p-6 dark:bg-gray-950/20">
                            <div className="space-y-2">
                              <h5 className="font-bold text-xs uppercase text-gray-500 tracking-wider">Log Payload Metadata</h5>
                              <pre className="overflow-x-auto rounded-lg border border-gray-100 bg-gray-100 p-4 font-mono text-xs text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-250 dark:text-gray-300">
                                {JSON.stringify(log.details || {}, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-808 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={logs.length < 50}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-808 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
