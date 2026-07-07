// =============================================================================
// SlaIndicator – tiny widget that shows "ok / warning / breached" + remaining
// time using the SLA badge returned by /admin/queries/inbox.
// =============================================================================

import React from 'react';
import { SlaStatus } from '../../services/triage/triage.types';

interface SlaIndicatorProps {
  sla?: SlaStatus;
  className?: string;
}

const colorMap: Record<string, string> = {
  ok: 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800',
  warning:
    'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800',
  breached:
    'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800',
  unknown:
    'text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700',
};

export const SlaIndicator: React.FC<SlaIndicatorProps> = ({ sla, className = '' }) => {
  if (!sla) return null;
  const c = colorMap[sla.status] ?? colorMap.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${c} ${className}`}
      title={sla.text}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
      {sla.text}
    </span>
  );
};