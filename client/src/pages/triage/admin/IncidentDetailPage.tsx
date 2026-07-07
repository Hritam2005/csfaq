// =============================================================================
// IncidentDetailPage – aggregate view of an incident cluster.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import TriageService from '../../../services/triage/TriageService';
import { IncidentResponse, QueryCase } from '../../../services/triage/triage.types';
import { StatusBadge } from '../../../components/triage/StatusBadge';
import { PriorityBadge } from '../../../components/triage/PriorityBadge';
import { SlaIndicator } from '../../../components/triage/SlaIndicator';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<IncidentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncident = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const inc = await TriageService.getIncidentDetails(id);
      setData(inc);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Could not load incident cluster.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
        Loading incident…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error}
        <div className="mt-3">
          <button
            onClick={() => navigate('/admin/triage/inbox')}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  // Some microservice versions return `parentCase` instead of `parent`.
  const rootCase: QueryCase | undefined =
    (data as any).parentCase ?? (data as IncidentResponse).parent;

  if (!rootCase) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Incident data is malformed (no parent case).
        <div className="mt-3">
          <button
            onClick={() => navigate('/admin/triage/inbox')}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/admin/triage/inbox/${rootCase._id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to parent case
        </Link>
      </div>

      <header className="rounded-xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/30">
        <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-200">
          Incident #{rootCase._id.slice(-8).toUpperCase()}
        </h1>
        <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
          {rootCase.title}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-purple-800">
          <span>{data.linkedCases.length + 1} linked cases</span>
          {data.totalAffected ? (
            <>
              <span>•</span>
              <span>{data.totalAffected} affected users</span>
            </>
          ) : null}
          {data.severity ? (
            <>
              <span>•</span>
              <span>Severity: {data.severity}</span>
            </>
          ) : null}
          <span>•</span>
          <span>
            Started{' '}
            {formatDistanceToNow(new Date(rootCase.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        {data.aiSummary ? (
          <div className="mt-4 rounded-md bg-white/60 p-3 text-sm text-purple-900 dark:bg-purple-950/40 dark:text-purple-200">
            <p className="text-xs font-semibold uppercase">AI Summary</p>
            <p className="mt-1">{data.aiSummary}</p>
          </div>
        ) : null}
      </header>

      {/* Linked cases */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Linked Cases ({data.linkedCases.length + 1})
        </h2>
        <ul className="space-y-3">
          <IncidentRow caseData={rootCase} highlight />
          {data.linkedCases.map((c) => (
            <IncidentRow key={c._id} caseData={c} />
          ))}
        </ul>
      </section>

      {/* Actions */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
          Incident actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              if (!id) return;
              try {
                await TriageService.markIncidentStatus(id, 'resolved');
                toast.success('Incident marked resolved.');
                fetchIncident();
              } catch (e: any) {
                toast.error(
                  e?.response?.data?.message || 'Failed to update incident.'
                );
              }
            }}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Mark incident resolved
          </button>
          <Link
            to={`/admin/triage/inbox/${rootCase._id}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Open parent case
          </Link>
        </div>
      </section>
    </div>
  );
};

interface IncidentRowProps {
  caseData: QueryCase;
  highlight?: boolean;
}

const IncidentRow: React.FC<IncidentRowProps> = ({ caseData, highlight }) => {
  if (!caseData?._id) return null;
  return (
    <li>
      <Link
        to={`/admin/triage/inbox/${caseData._id}`}
        className={`block rounded-lg border p-4 shadow-sm transition hover:shadow ${
          highlight
            ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/30'
            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {highlight ? '⭐ ' : ''}
              {caseData.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              #{caseData._id.slice(-8).toUpperCase()} •{' '}
              {formatDistanceToNow(new Date(caseData.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={caseData.priority} />
              <StatusBadge status={caseData.status} />
            </div>
            {caseData.slaStatus ? <SlaIndicator sla={caseData.slaStatus} /> : null}
          </div>
        </div>
      </Link>
    </li>
  );
};