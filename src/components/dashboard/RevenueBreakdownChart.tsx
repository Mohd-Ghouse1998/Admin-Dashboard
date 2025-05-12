
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RevenueBreakdownChartProps {
  isLoading?: boolean;
}

export const RevenueBreakdownChart = ({ isLoading = false }: RevenueBreakdownChartProps) => {
  const [chartData, setChartData] = useState([
    { name: 'Subscription', value: 0, color: '#6366f1' }, // indigo
    { name: 'Pay-As-You-Go', value: 0, color: '#84cc16' }, // lime
    { name: 'Wallet', value: 0, color: '#f59e0b' },    // amber
  ]);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  useEffect(() => {
    if (!isLoading) {
      // Simulate data loading
      const timer = setTimeout(() => {
        const subscriptionValue = 56000;
        const payAsYouGoValue = 38000;
        const walletValue = 34450;
        
        setChartData([
          { name: 'Subscription', value: subscriptionValue, color: '#6366f1' }, // indigo
          { name: 'Pay-As-You-Go', value: payAsYouGoValue, color: '#84cc16' }, // lime
          { name: 'Wallet', value: walletValue, color: '#f59e0b' },    // amber
        ]);
        
        setTotalRevenue(subscriptionValue + payAsYouGoValue + walletValue);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                return (
                  <text 
                    x={x} 
                    y={y} 
                    fill="#888888" 
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="central"
                    fontSize="12"
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatCurrency(value as number), '']}
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
      <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
        <div className="text-2xl font-semibold text-primary-600">{formatCurrency(totalRevenue)}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Total Monthly Revenue</div>
      </div>
    </div>
  );
};
