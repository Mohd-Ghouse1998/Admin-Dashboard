
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

interface ChargerStatusChartProps {
  isLoading?: boolean;
  className?: string;
}

export const ChargerStatusChart = ({ isLoading = false, className = '' }: ChargerStatusChartProps) => {
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
    return <Skeleton className={`h-full w-full ${className}`} />;
  }
  
  const totalChargers = chartData.reduce((sum, item) => sum + item.value, 0);
  const availabilityRate = Math.round((chartData[0].value / totalChargers) * 100);
  
  return (
    <div className={`h-full w-full flex flex-col ${className}`}>
      <div className="flex-1 min-h-[220px]">
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
                border: '1px solid rgba(229, 231, 235, 1)',
                color: '#374151'
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status indicators with icons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="bg-green-100 dark:bg-green-900/30 h-9 w-9 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{chartData[0].value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Available</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 h-9 w-9 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{chartData[1].value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">In Use</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="bg-gray-100 dark:bg-gray-700 h-9 w-9 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{chartData[2].value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Offline</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="bg-red-100 dark:bg-red-900/30 h-9 w-9 rounded-full flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{chartData[3].value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Fault</div>
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-lg font-medium text-gray-900 dark:text-white">{totalChargers}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Chargers</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-lg font-medium text-green-600 dark:text-green-400">{availabilityRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Availability Rate</div>
        </div>
      </div>
    </div>
  );
};
