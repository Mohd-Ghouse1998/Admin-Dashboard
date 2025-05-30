import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// Sample data - replace with your actual data
const dayData = [
  { category: 'Walk-in', value: 1200 },
  { category: 'App Users', value: 2580 },
  { category: 'Subscription', value: 3650 },
  { category: 'Corporate', value: 1950 },
];

const weekData = [
  { category: 'Walk-in', value: 8200 },
  { category: 'App Users', value: 12580 },
  { category: 'Subscription', value: 18650 },
  { category: 'Corporate', value: 10950 },
];

const monthData = [
  { category: 'Walk-in', value: 24200 },
  { category: 'App Users', value: 45580 },
  { category: 'Subscription', value: 72650 },
  { category: 'Corporate', value: 38950 },
];

interface RevenueChartProps {
  className?: string;
  title?: string;
  description?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  className,
  title = "Revenue Breakdown",
  description = "Revenue by customer category"
}) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  
  const data = {
    day: dayData,
    week: weekData,
    month: monthData
  }[timeframe];

  // Colors for the bars
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

  // Format currency
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{payload[0].payload.category}</p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          </div>
          
          <div className="mt-3 sm:mt-0 flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {(['day', 'week', 'month'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setTimeframe(option)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  timeframe === option 
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={40}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#e5e7eb" 
                className="dark:stroke-gray-700" 
              />
              <XAxis 
                dataKey="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                className="dark:text-gray-400"
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                className="dark:text-gray-400"
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(200, 200, 200, 0.15)' }}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                    className="hover:opacity-90 transition-opacity" 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Legend */}
      <div className="px-6 pb-6 pt-2">
        <div className="flex flex-wrap gap-4 justify-center">
          {data.map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-sm" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RevenueChart;
