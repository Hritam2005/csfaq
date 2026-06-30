import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Clock, MessageSquare } from 'lucide-react';
import { AIWorkspaceService, Conversation } from '../../services/ai/AIWorkspaceService';
import { Button } from '../../components/ui/Button';

export const AIHistoryPage: React.FC = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: AIWorkspaceService.getConversations
  });

  const conversations: Conversation[] = response?.data || [];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Conversation History</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">View and manage your past AI interactions.</p>
        </div>
        <Button variant="outline" className="text-red-600 hover:text-red-700 dark:text-red-400">Clear All</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No history</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't started any conversations yet.</p>
          <div className="mt-6">
            <Link to="/ai/chat">
              <Button>Start a New Chat</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map(conv => (
            <Link 
              key={conv._id}
              to={`/ai/conversations/${conv._id}`}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate font-semibold text-gray-900 dark:text-white">{conv.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Updated {new Date(conv.updatedAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
