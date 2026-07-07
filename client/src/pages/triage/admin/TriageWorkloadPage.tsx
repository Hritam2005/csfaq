// =============================================================================
// TriageWorkloadPage – per-resolver workload from /admin/triage/workload.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TriageService from '../../../services/triage/TriageService';
import {
  ResolverWorkload,
  PRIORITY_LEVELS,
  PRIORITY_COLORS,
  PriorityLevel,
} from '../../../services/triage/triage.types';

export const TriageWorkloadPage: React.FC = () => {
  const navigate = useNavigate();
  const [workload, setWorkload] = useState<ResolverWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const fetchWorkload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TriageService.getWorkload();
      setWorkload(data.resolvers || data.items || []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Could not load workload.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
    const t = setInterval(fetchWorkload, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchKey]);

  if (loading && workload.length === 0) {
    return (
      <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
        Loading workload…
      </div>
    );
  }
  if (error && workload.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error}
        <button
          onClick={() => setRefetchKey((k) => k + 1)}
          className="ml-3 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resolver Workload
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Live distribution of active cases across resolvers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRefetchKey((k) => k + 1)}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
          >
            Refresh
          </button>
          <button
            onClick={async () => {
              try {
                await TriageService.rebalanceWorkload();
                toast.success('Rebalance requested.');
                fetchWorkload();
              } catch (e: any) {
                toast.error(
                  e?.response?.data?.message || 'Rebalance failed.'
                );
              }
            }}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Rebalance
          </button>
        </div>
      </header>

      {workload.length === 0 ? (
        <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
          No resolvers with active load right now.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Resolver</th>
                <th className="px-4 py-3">Active</th>
                {PRIORITY_LEVELS.map((p) => (
                  <th key={p} className="px-4 py-3">
                    {p}
                  </th>
                ))}
                <th className="px-4 py-3">Util</th>
                <th className="px-4 py-3">P0 SLA</th>
              </tr>
            </thead>
            <tbody>
              {workload.map((r) => (
                <tr
                  key={r.resolverId || r.name}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {r.name || r.resolverId}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{r.activeCases ?? 0}</span>
                    {typeof r.maxCases === 'number' && (
                      <span className="text-xs text-gray-400">
                        {' '}/ {r.maxCases}
                      </span>
                    )}
                  </td>
                  {PRIORITY_LEVELS.map((p: PriorityLevel) => (
                    <td key={p} className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[p]}`}
                      >
                        {r.byPriority?.[p] ?? 0}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <UtilBar value={r.utilisation ?? 0} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {r.p0Breached
                      ? '⚠ breached'
                      : typeof r.p0DueInMinutes === 'number'
                      ? `${r.p0DueInMinutes} min`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        <Link to="/admin/triage/inbox" className="text-blue-600 hover:underline">
          ← Back to inbox
        </Link>
      </p>
    </div>
  );
};

const UtilBar: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.round(value * 100);
  const colour =
    pct >= 90
      ? 'bg-red-500'
      : pct >= 70
      ? 'bg-yellow-500'
      : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-2 ${colour}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium">{pct}%</span>
    </div>
  );
};