import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink } from 'lucide-react';
import { AIWorkspaceService } from '../../services/ai/AIWorkspaceService';
import { Button } from '../../components/ui/Button';

export const AIBookmarksPage: React.FC = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: AIWorkspaceService.getBookmarks
  });

  const bookmarks = response?.data || [];

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Saved Answers</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your bookmarked responses for quick reference.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No bookmarks</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Save important AI answers to view them here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookmarks.map((bookmark: any) => (
              <div key={bookmark._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
                <div className="prose prose-sm prose-gray max-w-none dark:prose-invert line-clamp-4">
                  {bookmark.content}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Saved on {new Date(bookmark.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/ai/conversations/${bookmark.conversationId}`}>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary-600 dark:text-primary-400">
                      View Context <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
