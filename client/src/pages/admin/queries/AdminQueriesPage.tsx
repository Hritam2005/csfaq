import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpCircle, CheckCircle, XCircle, Search, Mail, UserCheck, UserPlus, RotateCcw, Clock, AlertCircle, Filter, Inbox } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { RootState } from '../../../store/store';
import TriageService from '../../../services/triage/TriageService';
import { InboxQuery, QueryStatus } from '../../../services/triage/triage.types';
import { Button } from '../../../components/ui/Button';

export const AdminQueriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<InboxQuery | null>(null);
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my_claimed' | 'awaiting' | 'resolved'>('all');

  // Fetch queries from Triage Microservice
  const { data: inboxData, isLoading, refetch } = useQuery({
    queryKey: ['admin-triage-queries'],
    queryFn: async () => {
      const res = await TriageService.getAdminInbox({ limit: 100, includeResolved: true });
      return res.queries || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds to show live claimed cases
  });

  const queries = inboxData || [];

  // Mutations for Claiming, Answering, and Unclaiming
  const claimMutation = useMutation({
    mutationFn: async (id: string) => {
      return await TriageService.claimCase(id, user?.fullName || user?.name || 'Admin');
    },
    onSuccess: (updatedCase) => {
      toast.success('Case claimed successfully! You can now answer and solve it.');
      queryClient.invalidateQueries({ queryKey: ['admin-triage-queries'] });
      setSelectedQuery(updatedCase as InboxQuery);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to claim case');
    }
  });

  const unclaimMutation = useMutation({
    mutationFn: async (id: string) => {
      return await TriageService.unclaimCase(id);
    },
    onSuccess: (updatedCase) => {
      toast.success('Case released back to unassigned queue.');
      queryClient.invalidateQueries({ queryKey: ['admin-triage-queries'] });
      setSelectedQuery(updatedCase as InboxQuery);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to unclaim case');
    }
  });

  const answerMutation = useMutation({
    mutationFn: async ({ id, answerText, resolveImmediately }: { id: string, answerText: string, resolveImmediately: boolean }) => {
      return await TriageService.answerQuery(id, { answerText, resolveImmediately });
    },
    onSuccess: (updatedCase) => {
      toast.success('Query answered and resolved successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-triage-queries'] });
      setSelectedQuery(updatedCase as InboxQuery);
      setResponseText('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
    }
  });

  // Check if a query is claimed by the currently logged-in admin
  const isClaimedByMe = (q: InboxQuery) => {
    if (!q.assignedTo || !user) return false;
    const assignedStr = String(q.assignedTo).trim().toLowerCase();
    const userIdStr = String(user._id || '').trim().toLowerCase();
    const userNameStr = String(user.name || user.fullName || '').trim().toLowerCase();
    return assignedStr === userIdStr || assignedStr === userNameStr;
  };

  // Filter queries based on search term and selected tab
  const filteredQueries = queries.filter(q => {
    const titleText = (q.title || '').toLowerCase();
    const bodyText = (q.body || (q as any).question || '').toLowerCase();
    const assignedText = (q.assignedTo || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = !searchTerm || titleText.includes(searchLower) || bodyText.includes(searchLower) || assignedText.includes(searchLower);
    if (!matchesSearch) return false;

    if (activeTab === 'my_claimed') {
      return isClaimedByMe(q);
    }
    if (activeTab === 'awaiting') {
      return q.status === 'awaiting_human' || (!q.assignedTo && q.status !== 'resolved' && q.status !== 'closed');
    }
    if (activeTab === 'resolved') {
      return q.status === 'resolved' || q.status === 'closed' || q.status === 'answered';
    }
    return true; // 'all'
  });

  // Counts for tabs
  const myClaimedCount = queries.filter(q => isClaimedByMe(q)).length;
  const awaitingCount = queries.filter(q => q.status === 'awaiting_human' || (!q.assignedTo && q.status !== 'resolved' && q.status !== 'closed')).length;
  const resolvedCount = queries.filter(q => q.status === 'resolved' || q.status === 'closed' || q.status === 'answered').length;

  const handleSelectQuery = (query: InboxQuery) => {
    setSelectedQuery(query);
    const existingAnswer = query.finalAnswer?.text || (query as any).response || '';
    setResponseText(existingAnswer);
  };

  const handleAnswerSubmit = (resolveImmediately: boolean) => {
    if (!selectedQuery || !responseText.trim()) return;
    answerMutation.mutate({
      id: selectedQuery._id,
      answerText: responseText,
      resolveImmediately,
    });
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'P0': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">P0 Critical</span>;
      case 'P1': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">P1 High</span>;
      case 'P2': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">P2 Medium</span>;
      default: return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">P3 Normal</span>;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'awaiting_human': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Awaiting Human</span>;
      case 'assigned': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">Claimed & In Progress</span>;
      case 'resolved':
      case 'closed': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Resolved</span>;
      case 'answered': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Answered</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{status || 'Pending'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            User Queries & Claimed Cases
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review submitted queries, claim cases to your queue, and provide expert AI/Human answers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-gray-600 dark:text-gray-300">
            <RotateCcw className="w-4 h-4 mr-1.5" /> Refresh Inbox
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Active ({queries.length})
        </button>
        <button
          onClick={() => setActiveTab('my_claimed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'my_claimed'
              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300 dark:ring-purple-900'
              : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          My Claimed Cases ({myClaimedCount})
        </button>
        <button
          onClick={() => setActiveTab('awaiting')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'awaiting'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
          }`}
        >
          <Clock className="w-4 h-4" />
          Awaiting Human ({awaitingCount})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'resolved'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Resolved / Closed ({resolvedCount})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* Queries List */}
        <div className="w-full lg:w-5/12 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search queries, title, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                Loading queries and claimed cases...
              </div>
            ) : filteredQueries.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 text-gray-400 mb-2" />
                <p className="font-medium text-gray-700 dark:text-gray-300">No queries found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting your filter tab or search term.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredQueries.map(query => {
                  const isMine = isClaimedByMe(query);
                  return (
                    <button
                      key={query._id}
                      onClick={() => handleSelectQuery(query)}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all ${
                        selectedQuery?._id === query._id ? 'bg-primary-50/80 dark:bg-primary-900/20 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 flex items-center gap-2">
                          {query.title || 'User Query Case'}
                        </div>
                        {getPriorityBadge(query.priority)}
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 font-normal">
                        {query.body || (query as any).question || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/50 text-xs">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(query.status)}
                          {query.assignedTo ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
                              isMine ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 ring-1 ring-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              <UserCheck className="w-3 h-3" />
                              {isMine ? 'Claimed by You' : `Claimed: ${query.assignedTo}`}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </div>
                        <span className="text-gray-400">{new Date(query.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Query Details & Resolution Panel */}
        <div className="w-full lg:w-7/12 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          {selectedQuery ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Top Case Info */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getPriorityBadge(selectedQuery.priority)}
                      {getStatusBadge(selectedQuery.status)}
                      <span className="text-xs text-gray-500 font-mono">ID: {selectedQuery._id}</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedQuery.title || 'User Query Case'}
                    </h2>
                  </div>

                  {/* Claim / Unclaim Action Banner */}
                  <div className="flex items-center gap-2">
                    {!selectedQuery.assignedTo ? (
                      <Button
                        size="sm"
                        onClick={() => claimMutation.mutate(selectedQuery._id)}
                        disabled={claimMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5"
                      >
                        <UserPlus className="w-4 h-4" /> Claim Case to Solve
                      </Button>
                    ) : isClaimedByMe(selectedQuery) ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 flex items-center gap-1.5 border border-purple-300 dark:border-purple-700">
                          <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Assigned to You
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unclaimMutation.mutate(selectedQuery._id)}
                          disabled={unclaimMutation.isPending}
                          className="text-xs text-gray-600 hover:text-red-600"
                        >
                          Release Case
                        </Button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Claimed by: {selectedQuery.assignedTo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User Query / Problem Statement</h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedQuery.body || (selectedQuery as any).question || 'No additional content provided.'}
                  </p>
                </div>
              </div>
              
              {/* Answer & Resolution Area */}
              <div className="flex-1 p-6 flex flex-col bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Admin Answer & Resolution
                  </label>
                  {!selectedQuery.assignedTo && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                      ⚡ Tip: Claiming this case is recommended before answering.
                    </span>
                  )}
                </div>

                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your authoritative answer or resolution instructions here..."
                  rows={6}
                  className="w-full flex-1 p-3.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-4 text-sm leading-relaxed"
                />
                
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs text-gray-500">
                    {selectedQuery.finalAnswer?.answeredAt ? (
                      <span>Last answered on {new Date(selectedQuery.finalAnswer.answeredAt).toLocaleString()}</span>
                    ) : (
                      <span>Not answered yet</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleAnswerSubmit(false)}
                      disabled={answerMutation.isPending || !responseText.trim()}
                      className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Save Answer (Keep Open)
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => handleAnswerSubmit(true)}
                      disabled={answerMutation.isPending || !responseText.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Submit Answer & Resolve
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center bg-gray-50/30 dark:bg-gray-900/30">
              <Inbox className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-3 stroke-1" />
              <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-base">No Query Selected</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Select a query from the list on the left to view full case details, claim it to your queue, or submit an authoritative answer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
