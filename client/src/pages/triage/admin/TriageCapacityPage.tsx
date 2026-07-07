// =============================================================================
// TriageCapacityPage – visualises the /admin/triage/capacity snapshot.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TriageService from '../../../services/triage/TriageService';
import { CapacityInfo } from '../../../services/triage/triage.types';

export const TriageCapacityPage: React.FC = () => {
  const navigate = useNavigate();
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const fetchCapacity = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TriageService.getCapacity();
      setCapacity(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Could not load capacity snapshot.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacity();
    const t = setInterval(fetchCapacity, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchKey]);

  if (loading && !capacity) {
    return (
      <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow dark:bg-gray-900">
        Loading capacity…
      </div>
    );
  }

  if (error || !capacity) {
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

  const utilisationPct = Math.round((capacity.utilisation ?? 0) * 100);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Triage Capacity
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Live snapshot of how much load the resolver team is carrying.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/triage/inbox')}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            Inbox
          </button>
          <button
            onClick={() => setRefetchKey((k) => k + 1)}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Status" value={String(capacity.status).toUpperCase()} accent={
          capacity.status === 'overload'
            ? 'bg-red-50 text-red-800'
            : capacity.status === 'warning'
            ? 'bg-yellow-50 text-yellow-800'
            : 'bg-green-50 text-green-800'
        } />
        <Stat label="Active cases" value={`${capacity.activeCases}`} />
        <Stat
          label="Max capacity"
          value={`${capacity.maxCases}`}
        />
        <Stat
          label="Utilisation"
          value={`${utilisationPct}%`}
          accent="bg-blue-50 text-blue-800"
        />
        {typeof capacity.overloadRatio === 'number' && (
          <Stat
            label="Overload ratio"
            value={capacity.overloadRatio.toFixed(2)}
            accent="bg-purple-50 text-purple-800"
          />
        )}
      </section>

      {/* Capacity bar */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
          Capacity utilisation
        </h2>
        <div className="h-5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className={`h-5 transition-all ${
              utilisationPct >= 90
                ? 'bg-red-500'
                : utilisationPct >= 70
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(utilisationPct, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {capacity.activeCases} / {capacity.maxCases} cases in-flight
          {' '}
          {capacity.status === 'overload' && (
            <span className="ml-2 font-semibold text-red-600">
              ⚠ Overload – consider rotation
            </span>
          )}
        </p>
      </section>

      {/* Actions */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
          Adjust rotation
        </h2>
        <form
          className="grid gap-3 sm:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            const maxCases = Number(data.get('maxCases'));
            if (Number.isNaN(maxCases) || maxCases < 1) {
              toast.error('Max cases must be at least 1.');
              return;
            }
            try {
              await TriageService.updateCapacity({ maxCases });
              toast.success('Capacity updated.');
              setRefetchKey((k) => k + 1);
            } catch (err: any) {
              toast.error(
                err?.response?.data?.message || 'Failed to update capacity.'
              );
            }
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block text-xs text-gray-500">
              Max active cases
            </span>
            <input
              type="number"
              name="maxCases"
              min={1}
              defaultValue={capacity.maxCases}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </section>

      <p className="text-xs text-gray-400">
        <Link to="/admin/triage/inbox" className="text-blue-600 hover:underline">
          Back to inbox →
        </Link>
      </p>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; accent?: string }> = ({
  label,
  value,
  accent = 'bg-gray-50 text-gray-800',
}) => (
  <div className={`rounded-xl p-4 shadow-sm ${accent}`}>
    <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
    <p className="mt-1 text-xl font-bold">{value}</p>
  </div>
);