// =============================================================================
// AdminQueryDetailPage – resolver view of a single QueryCase.
// Allows claim/unclaim, answer, view audit, view incident details.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { RootState } from '../../../store/store';
import TriageService from '../../../services/triage/TriageService';
import {
  AuditEvent,
  IncidentResponse,
  QueryCase,
  QUERY_DECISION_LABELS,
  QUERY_STATUS_LABELS,
} from '../../../services/triage/triage.types';
import { StatusBadge } from '../../../components/triage/StatusBadge';
import { PriorityBadge } from '../../../components/triage/PriorityBadge';
import { SlaIndicator } from '../../../components/triage/SlaIndicator';
import { useTriageSocket } from '../../../hooks/triage/useTriageSocket';

const AUDIT_LABELS: Record<string, string> = {
  'query.created': 'Created',
  'query.received': 'Triage pipeline received',
  'query.ai_drafted': 'AI drafted answer',
  'query.ai_answer_posted': 'AI answer posted',
  'query.human_requested': 'User requested a human',
  'query.human_assigned': 'Routed to human',
  'query.assigned': 'Claimed',
  'query.unassigned': 'Released',
  'query.answered': 'Answered',
  'query.resolved': 'Resolved',
  'query.closed': 'Closed',
  'query.user_satisfied': 'User: satisfied',
  'query.user_unsatisfied': 'User: unsatisfied',
};

export const AdminQueryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const [query, setQuery] = useState<QueryCase | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [incident, setIncident] = useState<IncidentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  // Answer form
  const [answerText, setAnswerText] = useState('');
  const [resolveImmediately, setResolveImmediately] = useState(true);
  const [nominateForKnowledge, setNominateForKnowledge] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const q = await TriageService.getQueryById(id);
      setQuery(q);
      try {
        const trail = await TriageService.getAuditTrail(id);
        setAudit(trail.events || []);
      } catch {
        setAudit([]);
      }
      // Try to load incident details if linked
      if (q.parentIncidentId || q.isParentIncident) {
        try {
          const inc = await TriageService.getIncidentDetails(id);
          setIncident(inc);
        } catch {
          setIncident(null);
        }
      } else {
        setIncident(null);
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Could not load this case.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refetchKey]);

  // Program-level live updates
  useTriageSocket({
    subscribeToProgram: true,
    onEvent: (evt, payload) => {
      if (
        payload?.queryId === id ||
        payload?._id === id ||
        payload?.id === id ||
        evt === 'query:updated'
      ) {
        setRefetchKey((k) => k + 1);
      }
    },
  });

  const handleClaim = async () => {
    if (!id || !user) return;
    try {
      await TriageService.claimCase(id, user.name);
      toast.success('Case claimed.');
      setRefetchKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to claim case.');
    }
  };

  const handleUnclaim = async () => {
    if (!id) return;
    try {
      await TriageService.unclaimCase(id);
      toast.success('Case released back to queue.');
      setRefetchKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to release case.');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!id) return;
    if (answerText.trim().length < 5) {
      toast.error('Answer must be at least 5 characters.');
      return;
    }
    setSubmittingAnswer(true);
    try {
      await TriageService.answerQuery(id, {
        answerText: answerText.trim(),
        resolveImmediately,
        nominateForKnowledge,
        status: resolveImmediately ? 'resolved' : 'waiting_for_user',
      });
      toast.success(resolveImmediately ? 'Case resolved.' : 'Answer posted.');
      setAnswerText('');
      setNominateForKnowledge(false);
      setRefetchKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
        Loading case…
      </div>
    );
  }

  if (error || !query) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error || 'Case not found.'}
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

  const isAssignedToMe = query.assignedTo && user && query.assignedTo === (user._id || user.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/triage/inbox"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Inbox
        </Link>
      </div>

      <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {query.title}
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              #{query._id.slice(-8).toUpperCase()} • Created{' '}
              {formatDistanceToNow(new Date(query.createdAt), {
                addSuffix: true,
              })}{' '}
              • Channel: {query.channel}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={query.priority} />
              <StatusBadge status={query.status} />
            </div>
            {query.slaStatus && <SlaIndicator sla={query.slaStatus} />}
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none rounded-md bg-gray-50 p-4 text-sm leading-relaxed text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          {query.body}
        </div>

        {/* Decision / classification */}
        <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 text-sm dark:border-gray-800 sm:grid-cols-2 lg:grid-cols-3">
          <Meta label="Decision" value={
            query.decision ? QUERY_DECISION_LABELS[query.decision] : '—'
          } />
          <Meta label="Affected users" value={query.affectedUsers ?? '—'} />
          <Meta
            label="SLA due"
            value={query.slaDueAt ? format(new Date(query.slaDueAt), 'PPp') : '—'}
          />
          <Meta label="Assigned to" value={query.assignedTo ?? 'Unassigned'} />
          <Meta
            label="Claimed at"
            value={
              query.claimedAt ? format(new Date(query.claimedAt), 'PPp') : '—'
            }
          />
          <Meta
            label="User satisfaction"
            value={query.userSatisfaction ?? 'no feedback yet'}
          />
          {query.classification?.intent && (
            <Meta label="Intent" value={query.classification.intent} />
          )}
          {query.classification?.categories &&
            query.classification.categories.length > 0 && (
              <Meta
                label="Categories"
                value={query.classification.categories.join(', ')}
              />
            )}
          {query.classification?.riskTags &&
            query.classification.riskTags.length > 0 && (
              <Meta
                label="Risk tags"
                value={query.classification.riskTags.join(', ')}
              />
            )}
        </div>

        {/* Action bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          {!query.assignedTo && (
            <button
              onClick={handleClaim}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Claim case
            </button>
          )}
          {query.assignedTo && (
            <button
              onClick={handleUnclaim}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100"
            >
              Release back to queue
            </button>
          )}
          {(query.parentIncidentId || query.isParentIncident) && (
            <Link
              to={`/admin/triage/incident/${query._id}`}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              View Incident Cluster
            </Link>
          )}
        </div>
      </article>

      {/* Answer form */}
      {(isAssignedToMe ||
        query.assignedTo === user?._id ||
        query.status === 'assigned' ||
        query.status === 'waiting_for_user' ||
        query.status === 'awaiting_human') && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Submit Answer
          </h2>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            rows={6}
            placeholder="Type the answer you'll send to the user…"
            className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resolveImmediately}
                onChange={(e) => setResolveImmediately(e.target.checked)}
              />
              Resolve immediately
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={nominateForKnowledge}
                onChange={(e) => setNominateForKnowledge(e.target.checked)}
              />
              Nominate for knowledge base
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={submittingAnswer}
              className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submittingAnswer ? 'Submitting…' : 'Submit Answer'}
            </button>
          </div>
        </section>
      )}

      {/* Final answer display */}
      {query.finalAnswer?.text && (
        <section className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/30">
          <h3 className="mb-1 text-sm font-semibold text-green-800 dark:text-green-300">
            ✅ Final Answer
          </h3>
          <p className="whitespace-pre-line text-sm text-gray-800 dark:text-gray-200">
            {query.finalAnswer.text}
          </p>
          {query.finalAnswer.answeredAt && (
            <p className="mt-2 text-xs text-gray-500">
              Posted {format(new Date(query.finalAnswer.answeredAt), 'PPp')} by{' '}
              {query.finalAnswer.actorType}
            </p>
          )}
        </section>
      )}

      {/* Incident quick view */}
      {incident && (
        <section className="rounded-xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/30">
          <h3 className="mb-2 text-sm font-semibold text-purple-800 dark:text-purple-300">
            🔗 Linked Incident ({incident.linkedCases.length + 1} cases
            {incident.totalAffected ? `, ${incident.totalAffected} affected` : ''})
          </h3>
          <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            {incident.linkedCases.slice(0, 5).map((c) => (
              <li key={c._id}>
                <Link
                  to={`/admin/triage/inbox/${c._id}`}
                  className="text-blue-600 hover:underline"
                >
                  #{c._id.slice(-8).toUpperCase()}
                </Link>{' '}
                – {c.title} ({c.status})
              </li>
            ))}
            {incident.linkedCases.length > 5 && (
              <li className="text-gray-500">
                +{incident.linkedCases.length - 5} more…
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Audit trail */}
      {audit.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Audit Trail
          </h2>
          <ol className="space-y-3">
            {audit.map((evt) => (
              <li
                key={evt._id}
                className="flex items-start gap-3 rounded-md border border-gray-100 p-3 text-sm dark:border-gray-800"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {AUDIT_LABELS[evt.eventType] ?? evt.eventType}
                  </p>
                  {evt.fromStatus && evt.toStatus && (
                    <p className="text-xs text-gray-500">
                      {QUERY_STATUS_LABELS[evt.fromStatus] ?? evt.fromStatus}
                      {' → '}
                      {QUERY_STATUS_LABELS[evt.toStatus] ?? evt.toStatus}
                    </p>
                  )}
                  {evt.reasonCodes && evt.reasonCodes.length > 0 && (
                    <p className="text-xs text-gray-500">
                      reasons: {evt.reasonCodes.join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {format(new Date(evt.createdAt), 'PPp')} •{' '}
                    {evt.actorType}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
};

const Meta: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
      {value || '—'}
    </p>
  </div>
);