// =============================================================================
// QueryDetailPage – user-facing view of a single QueryCase.
// Allows the user to request a human, close the case with feedback, and
// see the live status / SLA / final answer / audit timeline.
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
  QueryCase,
  QUERY_DECISION_LABELS,
  QUERY_STATUS_LABELS,
} from '../../../services/triage/triage.types';
import { StatusBadge } from '../../../components/triage/StatusBadge';
import { PriorityBadge } from '../../../components/triage/PriorityBadge';
import { useTriageSocket } from '../../../hooks/triage/useTriageSocket';

const AUDIT_LABELS: Record<string, string> = {
  'query.created': 'Query submitted',
  'query.received': 'Query received by triage pipeline',
  'query.ai_drafted': 'AI drafted an answer',
  'query.ai_answer_posted': 'AI answer posted',
  'query.human_requested': 'You asked for a human',
  'query.human_assigned': 'Assigned to a human resolver',
  'query.assigned': 'Claimed by a resolver',
  'query.unassigned': 'Released back to the queue',
  'query.answered': 'Resolver answered',
  'query.resolved': 'Case resolved',
  'query.closed': 'Case closed',
  'query.user_satisfied': 'You marked this as helpful',
  'query.user_unsatisfied': 'You marked this as unhelpful',
};

export const QueryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);

  const [query, setQuery] = useState<QueryCase | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  // Modal states
  const [showHumanModal, setShowHumanModal] = useState(false);
  const [humanReason, setHumanReason] = useState('');
  const [submittingHuman, setSubmittingHuman] = useState(false);

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [satisfied, setSatisfied] = useState(true);
  const [closeComment, setCloseComment] = useState('');
  const [submittingClose, setSubmittingClose] = useState(false);

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
        // Audit is admin-only on some deployments; just skip silently.
        setAudit([]);
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Could not load this query.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refetchKey]);

  // Live updates for this case
  useTriageSocket({
    onEvent: (event, payload) => {
      if (
        payload?.queryId === id ||
        payload?._id === id ||
        payload?.id === id
      ) {
        setRefetchKey((k) => k + 1);
      } else if (event === 'query:updated') {
        // Fallback: refresh on any update (cheap for one item)
        setRefetchKey((k) => k + 1);
      }
    },
  });

  const handleRequestHuman = async () => {
    if (!id || humanReason.trim().length < 5) {
      toast.error('Please describe why you need a human (min 5 chars).');
      return;
    }
    setSubmittingHuman(true);
    try {
      await TriageService.requestHuman(id, { reason: humanReason });
      toast.success('A human resolver has been notified.');
      setShowHumanModal(false);
      setHumanReason('');
      setRefetchKey((k) => k + 1);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || 'Failed to request human support.'
      );
    } finally {
      setSubmittingHuman(false);
    }
  };

  const handleClose = async () => {
    if (!id) return;
    setSubmittingClose(true);
    try {
      await TriageService.closeCase(id, {
        satisfied,
        comment: closeComment.trim() || undefined,
      });
      toast.success('Thanks for your feedback!');
      setShowCloseModal(false);
      setCloseComment('');
      setRefetchKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to close case.');
    } finally {
      setSubmittingClose(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-10 text-center text-gray-500 dark:bg-gray-950">
        Loading query…
      </div>
    );
  }

  if (error || !query) {
    return (
      <div className="min-h-screen bg-gray-50 p-10 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error || 'Query not found.'}
          <div className="mt-4">
            <button
              onClick={() => navigate('/support/queries')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Back to My Queries
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canRequestHuman =
    query.status !== 'closed' &&
    query.status !== 'resolved' &&
    !query.assignedTo;

  const canClose =
    query.status === 'answered' ||
    query.status === 'resolved' ||
    query.status === 'assigned';

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/support/queries"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to My Queries
          </Link>
        </div>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {query.title}
              </h1>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                #{query._id.slice(-8).toUpperCase()} • Created{' '}
                {formatDistanceToNow(new Date(query.createdAt), {
                  addSuffix: true,
                })}{' '}
                • by{' '}
                <span className="font-medium">{user?.name ?? 'you'}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={query.priority} />
              <StatusBadge status={query.status} />
            </div>
          </header>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {query.body}
          </div>

          <div className="mt-6 grid gap-4 border-t border-gray-100 pt-4 text-sm dark:border-gray-800 sm:grid-cols-2">
            <Meta label="Channel" value={query.channel} />
            <Meta label="Decision" value={
              query.decision ? QUERY_DECISION_LABELS[query.decision] : '—'
            } />
            <Meta label="Affected users" value={query.affectedUsers ?? '—'} />
            <Meta
              label="SLA due"
              value={
                query.slaDueAt
                  ? format(new Date(query.slaDueAt), 'PPp')
                  : '—'
              }
            />
            <Meta
              label="Assigned"
              value={query.assignedTo ?? 'Awaiting human'}
            />
            <Meta
              label="Last update"
              value={format(new Date(query.updatedAt), 'PPp')}
            />
            {query.classification?.intent && (
              <Meta
                label="Detected intent"
                value={query.classification.intent}
              />
            )}
            {query.classification?.categories &&
              query.classification.categories.length > 0 && (
                <Meta
                  label="Categories"
                  value={query.classification.categories.join(', ')}
                />
              )}
          </div>

          {/* Final answer */}
          {query.finalAnswer?.text && (
            <section className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-green-800 dark:text-green-300">
                ✅ Answer from {query.finalAnswer.actorType}
              </h3>
              <p className="whitespace-pre-line text-sm text-gray-800 dark:text-gray-200">
                {query.finalAnswer.text}
              </p>
              {query.finalAnswer.answeredAt && (
                <p className="mt-2 text-xs text-gray-500">
                  {format(new Date(query.finalAnswer.answeredAt), 'PPp')}
                </p>
              )}
            </section>
          )}

          {/* Action bar */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            {canRequestHuman && (
              <button
                onClick={() => setShowHumanModal(true)}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Request a Human
              </button>
            )}
            {canClose && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Close & Rate
              </button>
            )}
          </div>
        </article>

        {/* Audit timeline */}
        {audit.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Activity
            </h2>
            <ol className="space-y-3">
              {audit.map((evt) => (
                <li
                  key={evt._id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900"
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

      {/* Human-request modal */}
      {showHumanModal && (
        <Modal title="Request a human resolver" onClose={() => setShowHumanModal(false)}>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
            Tell us why the AI answer wasn't enough, and a human will pick this up.
          </p>
          <textarea
            value={humanReason}
            onChange={(e) => setHumanReason(e.target.value)}
            rows={4}
            placeholder="e.g. Need help with my account specifically"
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          <ModalActions
            onCancel={() => setShowHumanModal(false)}
            onConfirm={handleRequestHuman}
            confirmText="Submit"
            loading={submittingHuman}
          />
        </Modal>
      )}

      {/* Close modal */}
      {showCloseModal && (
        <Modal title="Close this case" onClose={() => setShowCloseModal(false)}>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            Was the answer helpful?
          </p>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSatisfied(true)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${satisfied ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-600'}`}
            >
              👍 Yes, thanks
            </button>
            <button
              onClick={() => setSatisfied(false)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${!satisfied ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 text-gray-600'}`}
            >
              👎 Not really
            </button>
          </div>
          <textarea
            value={closeComment}
            onChange={(e) => setCloseComment(e.target.value)}
            rows={3}
            placeholder="Optional comment"
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          <ModalActions
            onCancel={() => setShowCloseModal(false)}
            onConfirm={handleClose}
            confirmText="Close Case"
            loading={submittingClose}
          />
        </Modal>
      )}
    </div>
  );
};

// ----------------------- helpers -----------------------

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

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ModalActions: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
  confirmText: string;
  loading?: boolean;
}> = ({ onCancel, onConfirm, confirmText, loading }) => (
  <div className="mt-4 flex justify-end gap-2">
    <button
      onClick={onCancel}
      className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      onClick={onConfirm}
      disabled={loading}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? '…' : confirmText}
    </button>
  </div>
);