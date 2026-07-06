// =============================================================================
// StatusBadge – visual chip for a QueryCase status.
// =============================================================================

import React from 'react';
import {
  QueryStatus,
  QUERY_STATUS_COLORS,
  QUERY_STATUS_LABELS,
} from '../../services/triage/triage.types';

interface StatusBadgeProps {
  status?: QueryStatus | string | null;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  if (!status) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ${className}`}
      >
        —
      </span>
    );
  }
  const sizeCls =
    size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  const label = QUERY_STATUS_LABELS[status as QueryStatus] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${QUERY_STATUS_COLORS[status as QueryStatus] ?? 'bg-gray-100 text-gray-700'} ${sizeCls} ${className}`}
    >
      {label}
    </span>
  );
};