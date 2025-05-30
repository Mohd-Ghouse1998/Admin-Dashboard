
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// Sample data - replace with your actual data
const dayData = [
  { time: '00:00', kWh: 45 },
  { time: '02:00', kWh: 30 },
  { time: '04:00', kWh: 20 },
  { time: '06:00', kWh: 27 },
  { time: '08:00', kWh: 90 },
  { time: '10:00', kWh: 120 },
  { time: '12:00', kWh: 135 },
  { time: '14:00', kWh: 110 },
  { time: '16:00', kWh: 100 },
  { time: '18:00', kWh: 130 },
  { time: '20:00', kWh: 95 },
  { time: '22:00', kWh: 65 },
];

const weekData = [
  { time: 'Mon', kWh: 520 },
  { time: 'Tue', kWh: 580 },
  { time: 'Wed', kWh: 610 },
  { time: 'Thu', kWh: 540 },
  { time: 'Fri', kWh: 620 },
  { time: 'Sat', kWh: 450 },
  { time: 'Sun', kWh: 380 },
];

const monthData = [
  { time: 'Week 1', kWh: 3200 },
  { time: 'Week 2', kWh: 3500 },
  { time: 'Week 3', kWh: 3100 },
  { time: 'Week 4', kWh: 3800 },
];

interface EnergyConsumptionChartProps {
  className?: string;
  title?: string;
  description?: string;
}

export const EnergyConsumptionChart: React.FC<EnergyConsumptionChartProps> = ({
  className,
  title = "Energy Consumption",
  description = "Energy consumption across all chargers"
}) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  
  const data = {
    day: dayData,
    week: weekData,
    month: monthData
  }[timeframe];

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
            {payload[0].value} kWh
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
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" 
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
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#e5e7eb" 
                className="dark:stroke-gray-700" 
              />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                className="dark:text-gray-400"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                className="dark:text-gray-400"
                name="Energy" 
                unit=" kWh"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}
              />
              <Area 
                type="monotone" 
                dataKey="kWh" 
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#energyGradient)" 
                strokeWidth={2}
                name="Energy Consumption"
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default EnergyConsumptionChart;
