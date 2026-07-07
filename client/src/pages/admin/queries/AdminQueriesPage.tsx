import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpCircle, CheckCircle, XCircle, Search, Mail, Trash2 } from 'lucide-react';
import { apiClient } from '../../../services/axios';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

interface UserQuery {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  question: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  response: string;
  createdAt: string;
  priority?: 'Low' | 'Medium' | 'High';
}

const priorityWeights: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const AdminQueriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [selectedQuery, setSelectedQuery] = useState<UserQuery | null>(null);
  const [responseText, setResponseText] = useState('');

  const { data: queries = [], isLoading } = useQuery<UserQuery[]>({
    queryKey: ['admin-queries'],
    queryFn: async () => {
      const { data } = await apiClient.get('/queries');
      return data.data;
    },
    refetchInterval: 5000,
    staleTime: 0,
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, response, status }: { id: string, response: string, status: string }) => {
      await apiClient.patch(`/queries/${id}/resolve`, { response, status });
    },
    onSuccess: () => {
      toast.success('Query updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-queries'] });
      setSelectedQuery(null);
      setResponseText('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update query');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/queries/${id}`);
    },
    onSuccess: () => {
      toast.success('Query deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-queries'] });
      setSelectedQuery(null);
      setResponseText('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete query');
    }
  });

  const filteredQueries = queries
    .filter(q => {
      const matchesSearch = 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = 
        priorityFilter === 'All' || 
        (q.priority || 'Low') === priorityFilter;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      // Sort 1: Pending (unresolved) queries at the top, Resolved/Dismissed at the bottom
      const isPendingA = a.status === 'Pending' ? 1 : 0;
      const isPendingB = b.status === 'Pending' ? 1 : 0;
      if (isPendingA !== isPendingB) {
        return isPendingB - isPendingA;
      }

      // Sort 2: Within each status group, sort by priority High > Medium > Low
      const weightA = priorityWeights[a.priority || 'Low'] || 1;
      const weightB = priorityWeights[b.priority || 'Low'] || 1;
      if (weightA !== weightB) {
        return weightB - weightA;
      }

      // Sort 3: Default sort by createdAt descending within same priority level
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleResolve = (status: 'Resolved' | 'Dismissed') => {
    if (!selectedQuery) return;
    resolveMutation.mutate({ id: selectedQuery._id, response: responseText, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Queries</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage questions not present on the portal.</p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Queries List */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300 pointer-events-auto"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading queries...</div>
            ) : filteredQueries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No queries found.</div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredQueries.map(query => (
                  <button
                    key={query._id}
                    onClick={() => { setSelectedQuery(query); setResponseText(query.response || ''); }}
                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedQuery?._id === query._id ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2 flex-wrap"> 
                        {query.user?.fullName || 'Unknown User'}
                        {query.status === 'Pending' && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>}
                        {query.status === 'Resolved' && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Resolved</span>}
                        {query.status === 'Dismissed' && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Dismissed</span>}
                        {(!query.priority || query.priority === 'Low') && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Low</span>
                        )}
                        {query.priority === 'Medium' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Medium</span>
                        )}
                        {query.priority === 'High' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-bold">High</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(query.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{query.question}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Query Details */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          {selectedQuery ? (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900 dark:text-white">{selectedQuery.user?.fullName || 'Unknown User'}</h3>
                        {(!selectedQuery.priority || selectedQuery.priority === 'Low') && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Low Priority</span>
                        )}
                        {selectedQuery.priority === 'Medium' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Medium Priority</span>
                        )}
                        {selectedQuery.priority === 'High' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-bold">High Priority</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3"/> {selectedQuery.user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this query?')) {
                        deleteMutation.mutate(selectedQuery._id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10 pointer-events-auto shrink-0"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Query
                  </Button>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                  <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">{selectedQuery.question}</p>
                </div>
              </div>
              
              {selectedQuery.status === 'Pending' ? (
                <div className="flex-1 p-6 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your resolution or answer here..."
                    className="w-full min-h-[150px] p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-4"
                  />
                  
                  <div className="flex gap-3 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => handleResolve('Dismissed')}
                      disabled={resolveMutation.isPending}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Dismiss
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => handleResolve('Resolved')}
                      disabled={resolveMutation.isPending || !responseText.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-6 flex flex-col">
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex-1">
                    <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Resolution Status: {selectedQuery.status}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                      {selectedQuery.response || '(No response provided)'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a query from the list to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
