// =============================================================================
// NewQueryPage – submission form for a brand new query. Replaces the
// placeholder /support public page.
// =============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TriageService from '../../../services/triage/TriageService';
import {
  AffectedUsers,
  PRIORITY_DESCRIPTIONS,
  PriorityLevel,
  SubmitQueryPayload,
} from '../../../services/triage/triage.types';
import { ENV } from '../../../config/env';
import { PriorityBadge } from '../../../components/triage/PriorityBadge';

const SUGGESTED_TITLES = [
  'How do I…?',
  'Error when…',
  'Where can I find…?',
  'Request access to…',
];

export const NewQueryPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [affectedUsers, setAffectedUsers] = useState<AffectedUsers>('one');
  const [humanRequested, setHumanRequested] = useState(false);
  const [humanRequestReason, setHumanRequestReason] = useState('');
  const [urgencyReason, setUrgencyReason] = useState('');
  const [deadlineAt, setDeadlineAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5) {
      toast.error('Title must be at least 5 characters.');
      return;
    }
    if (body.trim().length < 10) {
      toast.error('Please describe your issue in at least 10 characters.');
      return;
    }
    if (humanRequested && humanRequestReason.trim().length < 5) {
      toast.error('Tell us briefly why you need a human.');
      return;
    }

    const payload: SubmitQueryPayload = {
      programId: ENV.TRIAGE_PROGRAM_ID,
      title: title.trim(),
      body: body.trim(),
      affectedUsers,
      humanRequested,
      humanRequestReason: humanRequested ? humanRequestReason.trim() : undefined,
      userUrgencyReason: urgencyReason.trim() || undefined,
      deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : undefined,
      idempotencyKey:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };

    setSubmitting(true);
    try {
      const res = await TriageService.submitQuery(payload);
      toast.success('Query submitted! Routing you to the case…');
      navigate(`/queries/${res.queryId}`);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          'Could not submit your query. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ask a Question
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            We'll try to answer immediately using AI, and route it to a human
            resolver if needed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/queries/my')}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
            >
              View My Queries →
            </button>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Briefly summarise your question"
              maxLength={140}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              required
            />
            <div className="mt-1 flex flex-wrap gap-1 text-xs text-gray-400">
              Suggestions:
              {SUGGESTED_TITLES.map((t) => (
                <button
                  type="button"
                  key={t}
                  className="rounded-full bg-gray-100 px-2 py-0.5 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => setTitle((cur) => (cur ? cur : t))}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Details">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Describe what's happening, what you've tried, and any error messages."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              required
            />
          </Field>

          <Field label="Who is affected?">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['one', 'Just me'],
                  ['several', 'A few users'],
                  ['many', 'Many users'],
                  ['unknown', 'Unknown'],
                ] as [AffectedUsers, string][]
              ).map(([v, lbl]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setAffectedUsers(v)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${affectedUsers === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Deadline (optional)">
            <input
              type="datetime-local"
              value={deadlineAt}
              onChange={(e) => setDeadlineAt(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </Field>

          <Field label="Why is this urgent? (optional)">
            <input
              value={urgencyReason}
              onChange={(e) => setUrgencyReason(e.target.value)}
              placeholder="e.g. blocking demo tomorrow"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </Field>

          <label className="flex items-start gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
            <input
              type="checkbox"
              checked={humanRequested}
              onChange={(e) => setHumanRequested(e.target.checked)}
              className="mt-1"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                I specifically want a human to answer this.
              </p>
              <p className="text-xs text-gray-500">
                We'll skip the AI path and route to a human resolver.
              </p>
            </div>
          </label>

          {humanRequested && (
            <Field label="Why do you need a human?">
              <input
                value={humanRequestReason}
                onChange={(e) => setHumanRequestReason(e.target.value)}
                placeholder="e.g. involves private data I can't share with AI"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </Field>
          )}

          {/* Live SLA preview based on affected users */}
          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
            <p className="font-medium">Estimated SLA</p>
            <p className="mt-1">
              Based on your "who is affected" selection, the triage engine will
              likely pick a priority between P1–P3.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(['P1', 'P2', 'P3'] as PriorityLevel[]).map((p) => (
                <span key={p} className="flex items-center gap-1">
                  <PriorityBadge priority={p} size="sm" />
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">
                    {PRIORITY_DESCRIPTIONS[p].split('–')[1]?.trim()}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Query'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
      {label}
    </label>
    {children}
  </div>
);