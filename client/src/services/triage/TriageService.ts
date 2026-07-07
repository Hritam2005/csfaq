// =============================================================================
// TriageService – REST client for the Query Triage microservice.
// Base URL is configured in `client/src/config/env.ts` (TRIAGE_URL).
// In dev the Vite proxy forwards /api/triage/* -> http://localhost:5001/api/v1/*.
// =============================================================================

import { triageApiClient } from '../axios';
import {
  AnswerQueryPayload,
  AuditEvent,
  CapacityInfo,
  CloseCasePayload,
  IncidentResponse,
  InboxResponse,
  QueryCase,
  QueryStatus,
  RequestHumanPayload,
  ResolverWorkload,
  SubmitQueryPayload,
  SubmitQueryResponse,
} from './triage.types';

// -----------------------------------------------------------------------------
// User routes – /api/v1/queries
// -----------------------------------------------------------------------------
export const TriageService = {
  // ---------- User-facing -----------------------------------------------

  /**
   * Submit a new query to the triage pipeline. The microservice returns
   * `202 Accepted` with a body of shape:
   *   { queryId, status, decision, priority, canRequestHuman, slaDueAt }
   * Our interceptor unwraps `data` so we return that object directly.
   */
  submitQuery: async (payload: SubmitQueryPayload): Promise<SubmitQueryResponse> => {
    const res = await triageApiClient.post<SubmitQueryResponse>('/queries', payload);
    return res.data;
  },

  /** Get queries submitted by the currently authenticated user. */
  getMyQueries: async (params?: {
    status?: QueryStatus;
    limit?: number;
    skip?: number;
  }): Promise<{ queries: QueryCase[]; total: number; limit: number; skip: number }> => {
    const res = await triageApiClient.get('/queries/my-queries', { params });
    return res.data;
  },

  /** Get a single query case by ID. */
  getQueryById: async (id: string): Promise<QueryCase> => {
    const res = await triageApiClient.get<QueryCase>(`/queries/${id}`);
    return res.data;
  },

  /** Escalate an AI / triaging query to a human resolver. */
  requestHuman: async (id: string, payload: RequestHumanPayload): Promise<QueryCase> => {
    const res = await triageApiClient.post<QueryCase>(
      `/queries/${id}/request-human`,
      payload
    );
    return res.data;
  },

  /** Close a resolved / answered case with feedback. */
  closeCase: async (id: string, payload: CloseCasePayload): Promise<QueryCase> => {
    const res = await triageApiClient.post<QueryCase>(`/queries/${id}/close`, payload);
    return res.data;
  },

  /** Update an existing user query (title, body, attachments). */
  updateQuery: async (id: string, payload: { title?: string; body?: string; attachments?: any[] }): Promise<QueryCase> => {
    const res = await triageApiClient.patch<QueryCase>(`/queries/${id}`, payload);
    return res.data;
  },

  /** Delete a user query. */
  deleteQuery: async (id: string): Promise<void> => {
    await triageApiClient.delete(`/queries/${id}`);
  },

  // ---------- Admin / Resolver ------------------------------------------

  /**
   * Fetch the prioritised admin inbox.
   *
   * @example
   *   TriageService.getAdminInbox({ priority: 'P1', status: ['awaiting_human'] });
   */
  getAdminInbox: async (params?: {
    programId?: string;
    priority?: string;
    status?: QueryStatus[];
    assignedTo?: string;
    includeResolved?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<InboxResponse> => {
    const res = await triageApiClient.get('/admin/queries/inbox', { params });
    return res.data;
  },

  /** Claim a case as the currently authenticated resolver. */
  claimCase: async (id: string, resolverName?: string): Promise<QueryCase> => {
    const res = await triageApiClient.post<QueryCase>(
      `/admin/queries/${id}/claim`,
      resolverName ? { resolverName } : {}
    );
    return res.data;
  },

  /** Release a previously claimed case back to the awaiting_human queue. */
  unclaimCase: async (id: string): Promise<QueryCase> => {
    const res = await triageApiClient.post<QueryCase>(
      `/admin/queries/${id}/unclaim`
    );
    return res.data;
  },

  /** Submit the final answer / response to a query. */
  answerQuery: async (id: string, payload: AnswerQueryPayload): Promise<QueryCase> => {
    const res = await triageApiClient.post<QueryCase>(
      `/admin/queries/${id}/answer`,
      payload
    );
    return res.data;
  },

  /** Get clustered incident details for a query (parent + linked duplicates). */
  getIncidentDetails: async (id: string): Promise<IncidentResponse> => {
    const res = await triageApiClient.get<IncidentResponse>(
      `/admin/queries/${id}/incident`
    );
    return res.data;
  },

  /** Get the full audit trail for a query case. */
  getAuditTrail: async (id: string): Promise<{ events: AuditEvent[]; total: number }> => {
    const res = await triageApiClient.get(`/admin/queries/${id}/audit`);
    return res.data;
  },

  /** Get system-wide resolver capacity / workload. */
  getCapacity: async (): Promise<CapacityInfo> => {
    const res = await triageApiClient.get<CapacityInfo>('/admin/queries/capacity');
    return res.data;
  },

  /** Update resolver rotation max-cases. */
  updateCapacity: async (payload: { maxCases: number }): Promise<CapacityInfo> => {
    const res = await triageApiClient.patch<CapacityInfo>(
      '/admin/queries/capacity',
      payload
    );
    return res.data;
  },

  /** Get per-resolver workload distribution. */
  getResolverWorkload: async (): Promise<{
    resolvers: ResolverWorkload[];
    total: number;
  }> => {
    const res = await triageApiClient.get('/admin/queries/workload');
    return res.data;
  },

  /** Alias – matches the workload page. */
  getWorkload: async (): Promise<{
    resolvers: ResolverWorkload[];
    items?: ResolverWorkload[];
    total: number;
  }> => {
    const res = await triageApiClient.get('/admin/queries/workload');
    return res.data;
  },

  /** Manually trigger workload rebalance. */
  rebalanceWorkload: async (): Promise<{ rebalanced: number }> => {
    const res = await triageApiClient.post('/admin/queries/workload/rebalance');
    return res.data;
  },

  /** Mark the parent case of an incident cluster as resolved/reopened. */
  markIncidentStatus: async (
    id: string,
    status: 'resolved' | 'reopened'
  ): Promise<QueryCase> => {
    const res = await triageApiClient.post<QueryCase>(
      `/admin/queries/${id}/incident/status`,
      { status }
    );
    return res.data;
  },

  // ---------- Health ----------------------------------------------------

  /** Liveness check – returns true if the microservice is reachable. */
  healthCheck: async (): Promise<boolean> => {
    try {
      await triageApiClient.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};

export default TriageService;