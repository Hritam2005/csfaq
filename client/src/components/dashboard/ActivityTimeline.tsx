import React from 'react';
import { Search, FileText, MessageSquare, Bookmark, Download, Upload } from 'lucide-react';
import { ActivityFeedItem } from '../../services/dashboard/DashboardService';

export const ActivityTimeline: React.FC<{ items: ActivityFeedItem[] }> = ({ items }) => {
  if (!items.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'search': return <Search className="h-4 w-4" />;
      case 'document_read': return <FileText className="h-4 w-4" />;
      case 'conversation': return <MessageSquare className="h-4 w-4" />;
      case 'bookmark': return <Bookmark className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'upload': return <Upload className="h-4 w-4" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, itemIdx) => (
          <li key={item._id}>
            <div className="relative pb-8">
              {itemIdx !== items.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-background text-gray-500 dark:text-gray-400">
                    {getIcon(item.type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-200">{item.title}</p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
