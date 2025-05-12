
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChargerStatusChartProps {
  isLoading?: boolean;
}

export const ChargerStatusChart = ({ isLoading = false }: ChargerStatusChartProps) => {
  const [chartData, setChartData] = useState([
    { name: 'Available', value: 0, color: '#10b981' }, // green
    { name: 'In Use', value: 0, color: '#3b82f6' },    // blue
    { name: 'Offline', value: 0, color: '#9ca3af' },   // gray
    { name: 'Fault', value: 0, color: '#ef4444' },     // red
  ]);
  
  useEffect(() => {
    if (!isLoading) {
      // Simulate data loading
      const timer = setTimeout(() => {
        setChartData([
          { name: 'Available', value: 95, color: '#10b981' }, // green
          { name: 'In Use', value: 39, color: '#3b82f6' },    // blue
          { name: 'Offline', value: 18, color: '#9ca3af' },   // gray
          { name: 'Fault', value: 4, color: '#ef4444' },      // red
        ]);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value} chargers`, name]}
              contentStyle={{ 
                borderRadius: '0.375rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                border: '1px solid rgba(229, 231, 235, 1)'
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold">156</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Chargers</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-green-600">86%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Availability Rate</div>
        </div>
      </div>
    </div>
  );
};
