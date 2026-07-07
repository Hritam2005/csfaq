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
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-blue-50/20 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/40 dark:border-gray-800/80 dark:from-gray-900/90 dark:via-gray-900/60 dark:to-gray-950/90 dark:hover:border-cyan-400/40">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent dark:from-cyan-500/15 dark:via-blue-500/10 blur-xl pointer-events-none transition-all group-hover:scale-150 duration-500" />
      
      <div className="flex items-center justify-between relative z-10">
        <p className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">{title}</p>
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/60 p-2.5 text-blue-700 shadow-sm ring-1 ring-blue-500/20 transition-transform duration-300 group-hover:scale-110 dark:from-cyan-950/80 dark:to-blue-950/50 dark:text-cyan-300 dark:ring-cyan-400/30">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2 relative z-10">
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</h3>
        {trend && (
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold", trendUp ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300 ring-1 ring-green-600/20" : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 ring-1 ring-red-600/20")}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
