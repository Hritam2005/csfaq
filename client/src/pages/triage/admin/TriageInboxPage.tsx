// =============================================================================
// TriageInboxPage – admin/resolver inbox backed by /admin/queries/inbox.
// Shows prioritised queue, filters by priority & status, capacity banner.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { RootState } from '../../../store/store';
import TriageService from '../../../services/triage/TriageService';
import {
  CapacityInfo,
  InboxQuery,
  PRIORITY_LEVELS,
  PRIORITY_DESCRIPTIONS,
  PriorityLevel,
  QueryStatus,
  QUERY_STATUS_LABELS,
} from '../../../services/triage/triage.types';
import { StatusBadge } from '../../../components/triage/StatusBadge';
import { PriorityBadge } from '../../../components/triage/PriorityBadge';
import { SlaIndicator } from '../../../components/triage/SlaIndicator';
import { useTriageSocket } from '../../../hooks/triage/useTriageSocket';

const STATUS_FILTERS: (QueryStatus | 'all')[] = [
  'all',
  'received',
  'triaging',
  'awaiting_human',
  'assigned',
  'waiting_for_user',
  'answered',
  'resolved',
  'closed',
];

export const TriageInboxPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const [queries, setQueries] = useState<InboxQuery[]>([]);
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | ''>('');
  const [statusFilter, setStatusFilter] = useState<QueryStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const fetchInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await TriageService.getAdminInbox({
        priority: priorityFilter || undefined,
        status:
          statusFilter === 'all'
            ? undefined
            : ([statusFilter] as unknown as QueryStatus[]),
        limit: 100,
      });
      setQueries(res.queries || []);
      setCapacity(res.capacity || null);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Failed to load inbox. Please retry.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorityFilter, statusFilter, refetchKey]);

  // Subscribe to program-level events for live updates.
  useTriageSocket({
    subscribeToProgram: true,
    onEvent: () => setRefetchKey((k) => k + 1),
  });

  const filtered = queries.filter((q) => {
    if (!search) return true;
    const t = `${q.title} ${q.body} ${q._id}`.toLowerCase();
    return t.includes(search.toLowerCase());
  });

  const capacityColour =
    capacity?.status === 'overload'
      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
      : capacity?.status === 'warning'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
      : capacity?.status === 'watch'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
      : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Triage Inbox
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {user?.name?.split(' ')[0] ?? 'resolver'}. Pick the most urgent cases first.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/triage/capacity')}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Capacity
          </button>
          <button
            onClick={() => navigate('/admin/triage/workload')}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Workload
          </button>
        </div>
      </header>

      {/* Capacity banner */}
      {capacity && (
        <div className={`rounded-lg p-4 ${capacityColour}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold capitalize">
                Team capacity: {String(capacity.status)}
              </p>
              <p className="text-xs opacity-80">
                {capacity.activeCases} active / {capacity.maxCases} max
                {typeof capacity.utilisation === 'number' &&
                  ` (${Math.round(capacity.utilisation * 100)}% utilised)`}
              </p>
            </div>
            {capacity.status === 'overload' && (
              <span className="rounded bg-white/40 px-2 py-0.5 text-xs font-semibold">
                ⚠ Triage SLA at risk
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or body…"
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityLevel | '')}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">All priorities</option>
          {PRIORITY_LEVELS.map((p) => (
            <option key={p} value={p}>
              {p} – {PRIORITY_DESCRIPTIONS[p].split('–')[1]?.trim()}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as QueryStatus | 'all')}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All statuses' : QUERY_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          onClick={() => setRefetchKey((k) => k + 1)}
          className="rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
        >
          Refresh
        </button>
      </div>

      {/* Queue list */}
      {loading ? (
        <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
          Loading inbox…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
          <button
            onClick={() => setRefetchKey((k) => k + 1)}
            className="ml-3 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
          🎉 Inbox is clear for the current filters.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((q) => (
            <li key={q._id}>
              <Link
                to={`/admin/triage/inbox/${q._id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                      {q.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {q.body}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={q.priority} />
                      <StatusBadge status={q.status} />
                    </div>
                    {q.slaStatus && <SlaIndicator sla={q.slaStatus} />}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>#{q._id.slice(-8).toUpperCase()}</span>
                  <span>•</span>
                  <span>Channel: {q.channel}</span>
                  <span>•</span>
                  <span>
                    Created{' '}
                    {formatDistanceToNow(new Date(q.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {q.affectedUsers && (
                    <>
                      <span>•</span>
                      <span>Affected: {q.affectedUsers}</span>
                    </>
                  )}
                  {typeof q.queueScore === 'number' && (
                    <>
                      <span>•</span>
                      <span>Queue score: {q.queueScore}</span>
                    </>
                  )}
                  {q.assignedTo && (
                    <>
                      <span>•</span>
                      <span>Assigned: {q.assignedTo}</span>
                    </>
                  )}
                  {q.parentIncidentId && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-purple-600">
                        Linked to incident
                      </span>
                    </>
                  )}
                  {q.linkedCaseCount && q.linkedCaseCount > 1 && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-purple-600">
                        Incident ({q.linkedCaseCount} cases)
                      </span>
                    </>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};