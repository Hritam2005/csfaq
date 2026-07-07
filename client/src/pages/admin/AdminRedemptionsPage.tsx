import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin/AdminService';
import { Search, Gift, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';

export const AdminRedemptionsPage: React.FC = () => {
  const { data: response, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'redemptions'],
    queryFn: adminApi.getRedemptions,
  });

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used'>('all');

  const redemptions = useMemo(() => response?.data || [], [response]);

  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((item: any) => {
      // 1. Search text filter (user name, email, or code)
      const user = item.user || {};
      const query = searchText.toLowerCase().trim();
      if (query) {
        const nameMatch = user.fullName?.toLowerCase().includes(query);
        const emailMatch = user.email?.toLowerCase().includes(query);
        const codeMatch = item.code?.toLowerCase().includes(query);
        const titleMatch = item.title?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !codeMatch && !titleMatch) return false;
      }

      // 2. Status filter
      if (statusFilter === 'active' && item.used) return false;
      if (statusFilter === 'used' && !item.used) return false;

      return true;
    });
  }, [redemptions, searchText, statusFilter]);

  const totals = useMemo(() => {
    let pts = 0;
    let act = 0;
    let usd = 0;
    redemptions.forEach((r: any) => {
      pts += r.cost || 0;
      if (r.used) {
        usd += 1;
      } else {
        act += 1;
      }
    });
    return { pts, act, usd, count: redemptions.length };
  }, [redemptions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Spurti Redemptions logs</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Monitor Spurti points currency redemptions across all users in real-time.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Vouchers</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{totals.count}</h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-405">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Spent Points</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{totals.pts.toLocaleString()} pts</h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-650 dark:bg-blue-900/30 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Unused (Active)</p>
              <h4 className="text-xl font-bold text-gray-950 dark:text-white">{totals.act}</h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <XCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Used Vouchers</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{totals.usd}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by user name, email, voucher title, or code..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-450 focus:border-primary-500 focus:ring-1 focus:ring-primary-505 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'used'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  statusFilter === tab
                    ? 'bg-gray-150 text-gray-900 dark:bg-gray-805 dark:text-white bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tabular Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : filteredRedemptions.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
              No voucher redemptions found.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-950/50 dark:text-gray-450 border-b border-gray-100 dark:border-gray-850">
                <tr>
                  <th scope="col" className="px-6 py-4">User</th>
                  <th scope="col" className="px-6 py-4">Voucher Title</th>
                  <th scope="col" className="px-6 py-4">Redemption Code</th>
                  <th scope="col" className="px-6 py-4">Cost</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Redeemed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredRedemptions.map((red: any) => {
                  const userRecord = red.user || {};
                  return (
                    <tr key={red._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/10">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-905 dark:text-white text-gray-909">
                          {userRecord.fullName || 'User'}
                        </div>
                        <div className="text-xs text-gray-500">{userRecord.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {red.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          {red.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {red.cost} pts
                      </td>
                      <td className="px-6 py-4">
                        {red.used ? (
                          <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            Used
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-990/20 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {new Date(red.redeemedAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
