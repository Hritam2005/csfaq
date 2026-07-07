// =============================================================================
// PriorityBadge – visual chip for a QueryCase priority (P0–P3).
// =============================================================================

import React from 'react';
import {
  PriorityLevel,
  PRIORITY_COLORS,
  PRIORITY_DESCRIPTIONS,
} from '../../services/triage/triage.types';

interface PriorityBadgeProps {
  priority?: PriorityLevel | string | null;
  size?: 'sm' | 'md';
  showDescription?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showDescription = false,
  className = '',
}) => {
  if (!priority) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500 ${className}`}
      >
        No Priority
      </span>
    );
  }
  const p = priority as PriorityLevel;
  const sizeCls =
    size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  return (
    <span
      title={PRIORITY_DESCRIPTIONS[p] ?? ''}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${PRIORITY_COLORS[p] ?? ''} ${sizeCls} ${className}`}
    >
      {p}
      {showDescription && (
        <span className="ml-1 font-normal opacity-80">
          {PRIORITY_DESCRIPTIONS[p]}
        </span>
      )}
    </span>
  );
};