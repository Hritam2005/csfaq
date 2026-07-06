// =============================================================================
// useTriageSocket – React hook that wires the user / program socket rooms
// to live query updates. When a relevant event arrives, the supplied
// callback is fired so callers can invalidate react-query caches, etc.
// =============================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { ENV } from '../../config/env';
import { triageSocket, TriageSocketEvent } from '../../services/triage/triageSocket';

interface UseTriageSocketOptions {
  /** Extra event handlers to register on the live socket. */
  onEvent?: (event: TriageSocketEvent, payload: any) => void;
  /** Optional programId override – defaults to ENV.TRIAGE_PROGRAM_ID. */
  programId?: string;
  /**
   * Whether to subscribe to program-level events (admin / resolver view).
   * Defaults to false (user-only).
   */
  subscribeToProgram?: boolean;
}

/**
 * Subscribes the current user to the triage socket and forwards incoming
 * events to a callback. Auto-cleans up on unmount.
 */
export function useTriageSocket(options: UseTriageSocketOptions = {}) {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { onEvent, subscribeToProgram = false, programId } = options;

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const userId = user._id;
    triageSocket.connect();
    triageSocket.joinUser(userId);

    let leaveProgram: (() => void) | undefined;
    if (subscribeToProgram) {
      const pid = programId || ENV.TRIAGE_PROGRAM_ID;
      triageSocket.joinProgram(pid);
      leaveProgram = () => triageSocket.leave(`program:${pid}`);
    }

    const handlers: Array<[TriageSocketEvent, (data: any) => void]> = [
      ['query:updated', (p) => onEvent?.('query:updated', p)],
      ['query:assigned', (p) => onEvent?.('query:assigned', p)],
      ['query:resolved', (p) => onEvent?.('query:resolved', p)],
    ];
    if (subscribeToProgram) {
      handlers.push(
        ['query:new_human_case', (p) => onEvent?.('query:new_human_case', p)],
        ['query:human_requested', (p) => onEvent?.('query:human_requested', p)]
      );
    }

    const unsubs = handlers.map(([evt, fn]) => triageSocket.on(evt, fn));

    return () => {
      unsubs.forEach((u) => u());
      triageSocket.leave(`user:${userId}`);
      leaveProgram?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    user?._id,
    subscribeToProgram,
    programId,
  ]);
}