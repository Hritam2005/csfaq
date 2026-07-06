// =============================================================================
// Triage Socket – Socket.IO client wrapping the Query Triage microservice.
// The microservice emits events like `query:updated`, `query:assigned`,
// `query:resolved`, `query:new_human_case`, `query:human_requested` to
// rooms of the form `user:<userId>` or `program:<programId>`.
// =============================================================================

import { io, Socket } from 'socket.io-client';
import { ENV } from '../../config/env';

export type TriageSocketEvent =
  | 'query:updated'
  | 'query:assigned'
  | 'query:resolved'
  | 'query:new_human_case'
  | 'query:human_requested';

export type TriageSocketHandler = (data: any) => void;

class TriageSocketClient {
  private socket: Socket | null = null;
  private joined = new Set<string>();

  /** Lazily connect to the triage microservice. Idempotent. */
  connect(): Socket {
    if (this.socket && this.socket.connected) return this.socket;

    this.socket = io(ENV.TRIAGE_SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      // Re-join any rooms we previously requested (e.g. after a reconnect).
      this.joined.forEach((room) => {
        if (room.startsWith('user:')) {
          this.socket?.emit('join:user', room.slice('user:'.length));
        } else if (room.startsWith('program:')) {
          this.socket?.emit('join:program', room.slice('program:'.length));
        }
      });
    });

    return this.socket;
  }

  /** Join a user room so the user receives personal updates. */
  joinUser(userId: string) {
    const room = `user:${userId}`;
    this.joined.add(room);
    this.connect().emit('join:user', userId);
  }

  /** Join a program room (used by admins / resolvers). */
  joinProgram(programId: string) {
    const room = `program:${programId}`;
    this.joined.add(room);
    this.connect().emit('join:program', programId);
  }

  /** Leave a previously-joined room. */
  leave(room: string) {
    this.joined.delete(room);
    const socket = this.socket;
    if (!socket) return;
    if (room.startsWith('user:')) {
      socket.emit('leave:user', room.slice('user:'.length));
    } else if (room.startsWith('program:')) {
      socket.emit('leave:program', room.slice('program:'.length));
    }
  }

  /** Subscribe to a triage event. Returns an unsubscribe function. */
  on(event: TriageSocketEvent, handler: TriageSocketHandler): () => void {
    const socket = this.connect();
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.joined.clear();
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const triageSocket = new TriageSocketClient();