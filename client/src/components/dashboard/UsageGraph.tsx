import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageGraphProps {
  data?: Array<{ name: string; queries: number; tokens: number }>;
}

export const UsageGraph: React.FC<UsageGraphProps> = ({ data = [] }) => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-800" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
          <YAxis axisLine={false} tickLine={false} className="text-xs text-gray-500" />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#6b7280', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Area type="monotone" dataKey="tokens" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
