import React from 'react';
import { Recommendation } from '../../services/dashboard/DashboardService';
import { FileText, HelpCircle, Lightbulb } from 'lucide-react';
import { Button } from '../ui/Button';

export const RecommendationWidget: React.FC<{ items: Recommendation[] }> = ({ items }) => {
  if (!items.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No recommendations available at this time.</p>;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'faq': return <HelpCircle className="h-5 w-5 text-green-500" />;
      case 'knowledge': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(item => (
        <div key={item._id} className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
              {getIcon(item.type)}
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.summary}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Match: {Math.round(item.relevanceScore * 100)}%</span>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary-600 dark:text-primary-400">View</Button>
          </div>
        </div>
      ))}
    </div>
  );
};
