
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface EnergyConsumptionChartProps {
  isLoading?: boolean;
}

export const EnergyConsumptionChart = ({ isLoading = false }: EnergyConsumptionChartProps) => {
  const [chartData, setChartData] = useState<Array<any>>([]);
  
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setChartData([
          { hour: '00:00', ac: 45, dc: 10 },
          { hour: '03:00', ac: 35, dc: 8 },
          { hour: '06:00', ac: 55, dc: 15 },
          { hour: '09:00', ac: 120, dc: 45 },
          { hour: '12:00', ac: 90, dc: 35 },
          { hour: '15:00', ac: 110, dc: 40 },
          { hour: '18:00', ac: 140, dc: 55 },
          { hour: '21:00', ac: 85, dc: 25 },
        ]);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
  
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {entry.name === 'ac' ? 'AC Charging' : 'DC Charging'}:
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {entry.value} kWh
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex justify-center gap-6 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          barGap={8}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis 
            dataKey="hour"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            dx={-10}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
          />
          <Legend 
            content={<CustomLegend />}
            verticalAlign="bottom"
            height={36}
          />
          <Bar 
            name="AC Charging" 
            dataKey="ac" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            fillOpacity={0.9}
          />
          <Bar 
            name="DC Charging" 
            dataKey="dc" 
            fill="#a855f7"
            radius={[4, 4, 0, 0]}
            fillOpacity={0.9}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
