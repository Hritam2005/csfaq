import React, { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MessageSquare, Trash2, Settings, Bookmark, Search as SearchIcon } from 'lucide-react';
import { cn, Button } from '../ui/Button';
import { AIWorkspaceService, Conversation } from '../../services/ai/AIWorkspaceService';

export const Sidebar: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: AIWorkspaceService.getConversations
  });

  const createMutation = useMutation({
    mutationFn: () => AIWorkspaceService.createConversation('New Conversation'),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate(`/ai/conversations/${res.data._id}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: AIWorkspaceService.deleteConversation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (id === deletedId) {
        navigate('/ai/chat');
      }
    }
  });

  const conversations: Conversation[] = response?.data || [];
  
  const filtered = conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(c => c.isPinned);
  const recent = filtered.filter(c => !c.isPinned);

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      
      {/* Top Actions */}
      <div className="p-4">
        <Button 
          onClick={() => createMutation.mutate()} 
          isLoading={createMutation.isPending}
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        
        {pinned.length > 0 && (
          <div>
            <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Pinned</div>
            {pinned.map(conv => (
              <ConversationItem key={conv._id} conv={conv} isActive={id === conv._id} onDelete={(cid) => deleteMutation.mutate(cid)} />
            ))}
          </div>
        )}

        <div>
          <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Recent</div>
          {isLoading ? (
            <div className="px-2 py-1 text-sm text-gray-400">Loading...</div>
          ) : recent.length > 0 ? (
            recent.map(conv => (
              <ConversationItem key={conv._id} conv={conv} isActive={id === conv._id} onDelete={(cid) => deleteMutation.mutate(cid)} />
            ))
          ) : (
            <div className="px-2 py-1 text-xs text-gray-500">No chats found.</div>
          )}
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="border-t border-gray-200 p-2 dark:border-gray-800">
        <NavLink to="/ai/bookmarks" className={({ isActive }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800", isActive && "bg-gray-200 dark:bg-gray-800")}>
          <Bookmark className="h-4 w-4" /> Saved Answers
        </NavLink>
        <NavLink to="/ai/settings" className={({ isActive }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800", isActive && "bg-gray-200 dark:bg-gray-800")}>
          <Settings className="h-4 w-4" /> AI Settings
        </NavLink>
      </div>

    </div>
  );
};

const ConversationItem = ({ conv, isActive, onDelete }: { conv: Conversation, isActive: boolean, onDelete: (id: string) => void }) => {
  return (
    <div className={cn(
      "group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
      isActive ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white" : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-gray-200"
    )}>
      <MessageSquare className="h-4 w-4 shrink-0" />
      <NavLink to={`/ai/conversations/${conv._id}`} className="flex-1 truncate">
        {conv.title}
      </NavLink>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(conv._id); }}
        className="invisible p-1 text-gray-400 hover:text-red-500 group-hover:visible dark:hover:text-red-400"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};
