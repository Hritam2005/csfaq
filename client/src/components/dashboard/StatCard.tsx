import React from 'react';
import { cn } from '../ui/Button';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="rounded-md bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        {trend && (
          <span className={cn("text-sm font-medium", trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
