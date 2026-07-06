import React, { useMemo, useState } from 'react';
import { useActivityFeed } from '../../hooks/dashboard/useDashboard';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { Search, MessageSquare, Bookmark, Upload, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ActivityPage: React.FC = () => {
  const { data: rawData, isLoading, refetch, isFetching } = useActivityFeed();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'conversation' | 'bookmark' | 'upload' | 'system'>('all');

  const items = useMemo(() => rawData || [], [rawData]);

  // Compute stats based on all items
  const stats = useMemo(() => {
    const total = items.length;
    const chats = items.filter((item) => item.type === 'conversation').length;
    const bookmarks = items.filter((item) => item.type === 'bookmark').length;
    const uploads = items.filter((item) => item.type === 'upload' || item.type === 'document_read').length;

    return { total, chats, bookmarks, uploads };
  }, [items]);

  // Filter items dynamically on frontend based on search text and active tab
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Tab Filter
      if (activeTab === 'conversation' && item.type !== 'conversation') return false;
      if (activeTab === 'bookmark' && item.type !== 'bookmark') return false;
      if (activeTab === 'upload' && item.type !== 'upload' && item.type !== 'document_read') return false;
      if (activeTab === 'system' && (item.type === 'conversation' || item.type === 'bookmark' || item.type === 'upload' || item.type === 'document_read')) return false;

      // 2. Search Text Filter
      if (searchText.trim()) {
        const query = searchText.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }

      return true;
    });
  }, [items, activeTab, searchText]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Activity</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            A comprehensive history and timeline of your actions, document uploads, and chatbot interactions.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Activities</p>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Conversations</p>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{stats.chats}</h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-450">
              <Bookmark className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Bookmarks Saved</p>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{stats.bookmarks}</h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Upload className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Files Uploaded</p>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{stats.uploads}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-950">
          {(['all', 'conversation', 'bookmark', 'upload', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {tab === 'all'
                ? 'All'
                : tab === 'conversation'
                ? 'Chats'
                : tab === 'bookmark'
                ? 'Bookmarks'
                : tab === 'upload'
                ? 'Files'
                : 'Logins/Other'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No activities found matching filters.</p>
                </div>
              ) : (
                <ActivityTimeline items={filteredItems} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
