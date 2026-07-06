// =============================================================================
// MyQueriesPage – lists all queries submitted by the current user.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import { RootState } from '../../../store/store';
import TriageService from '../../../services/triage/TriageService';
import {
  QueryCase,
  QueryStatus,
  QUERY_STATUS_LABELS,
} from '../../../services/triage/triage.types';
import { StatusBadge } from '../../../components/triage/StatusBadge';
import { PriorityBadge } from '../../../components/triage/PriorityBadge';
import { useTriageSocket } from '../../../hooks/triage/useTriageSocket';

export const MyQueriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const [queries, setQueries] = useState<QueryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<QueryStatus | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const fetchQueries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TriageService.getMyQueries({
        status: statusFilter || undefined,
        limit: 50,
      });
      setQueries(data.queries || []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Failed to load your queries. Please retry.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, refetchKey]);

  // Live updates – refresh list when our user room reports a change.
  useTriageSocket({
    onEvent: (event) => {
      if (
        event === 'query:updated' ||
        event === 'query:assigned' ||
        event === 'query:resolved'
      ) {
        setRefetchKey((k) => k + 1);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Queries
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and follow up on questions you've submitted, {user?.name?.split(' ')[0]}.
            </p>
          </div>
          <button
            onClick={() => navigate('/support')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Ask a New Question
          </button>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
          >
            All
          </button>
          {(Object.keys(QUERY_STATUS_LABELS) as QueryStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
            >
              {QUERY_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
            Loading your queries…
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
            <button
              onClick={() => setRefetchKey((k) => k + 1)}
              className="ml-3 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white"
            >
              Retry
            </button>
          </div>
        ) : queries.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
            <p className="mb-1 text-lg font-semibold">No queries yet</p>
            <p className="mb-4 text-sm">
              Submit your first question – we'll triage it instantly and answer whenever possible.
            </p>
            <button
              onClick={() => navigate('/support')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Ask a Question
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {queries.map((q) => (
              <li key={q._id}>
                <Link
                  to={`/support/queries/${q._id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {q.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={q.priority} />
                      <StatusBadge status={q.status} />
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {q.body}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>#{q._id.slice(-8).toUpperCase()}</span>
                    <span>•</span>
                    <span>
                      Created{' '}
                      {formatDistanceToNow(new Date(q.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {q.slaDueAt && (
                      <>
                        <span>•</span>
                        <span>
                          SLA by {format(new Date(q.slaDueAt), 'PPp')}
                        </span>
                      </>
                    )}
                    {q.finalAnswer?.text && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-green-600">
                          Has answer
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
    </div>
  );
};