import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Loader2, Zap, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthlyChartData, YearlyChartData } from '../types/api-types';
import { format } from 'date-fns';

interface EnergyConsumptionChartProps {
  monthlyData: MonthlyChartData | null;
  yearlyData: YearlyChartData | null;
  isLoadingMonthly: boolean;
  isLoadingYearly: boolean;
  errorMonthly: Error | null;
  errorYearly: Error | null;
}

export const EnergyConsumptionChart: React.FC<EnergyConsumptionChartProps> = ({
  monthlyData,
  yearlyData,
  isLoadingMonthly,
  isLoadingYearly,
  errorMonthly,
  errorYearly
}) => {
  const [timeFrame, setTimeFrame] = useState<'monthly' | 'yearly'>('monthly');
  
  // Format chart data based on selected timeframe
  const formatChartData = () => {
    if (timeFrame === 'monthly' && monthlyData && monthlyData.monthly_data && Array.isArray(monthlyData.monthly_data)) {
      return monthlyData.monthly_data.map(month => ({
        name: format(new Date(month.month), 'MMM'),
        energy: month.total_energy,
        sessions: month.session_count,
        revenue: month.total_revenue
      }));
    } else if (timeFrame === 'yearly' && yearlyData && yearlyData.yearly_data && Array.isArray(yearlyData.yearly_data)) {
      return yearlyData.yearly_data.map(year => ({
        name: year.year.toString(),
        energy: year.total_energy,
        sessions: year.session_count,
        revenue: year.total_revenue
      }));
    }
    return [];
  };
  
  const chartData = formatChartData();
  const isLoading = timeFrame === 'monthly' ? isLoadingMonthly : isLoadingYearly;
  const error = timeFrame === 'monthly' ? errorMonthly : errorYearly;
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="font-medium text-sm mb-1">{label}</p>
          <p className="text-xs text-blue-600 flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            {`Energy: ${payload[0].value.toFixed(2)} kWh`}
          </p>
          <p className="text-xs text-green-600 mt-1 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {`Sessions: ${payload[1].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md font-medium flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Energy Consumption
            </CardTitle>
            <Select
              disabled
              value={timeFrame}
              onValueChange={(value: 'monthly' | 'yearly') => setTimeFrame(value)}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md font-medium flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Energy Consumption
            </CardTitle>
            <Select
              value={timeFrame}
              onValueChange={(value: 'monthly' | 'yearly') => setTimeFrame(value)}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] p-6">
          <div className="text-center text-red-500">
            <p>Error loading data</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-medium flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-500" />
            Energy Consumption
          </CardTitle>
          <Select
            value={timeFrame}
            onValueChange={(value: 'monthly' | 'yearly') => setTimeFrame(value)}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-1 pt-4 h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Energy (kWh)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 12, fill: '#6B7280' }
                }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Sessions', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fontSize: 12, fill: '#6B7280' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar 
                yAxisId="left"
                dataKey="energy" 
                fill="#3B82F6" 
                name="Energy (kWh)"
                radius={[4, 4, 0, 0]}
                barSize={timeFrame === 'monthly' ? 16 : 30}
              />
              <Bar 
                yAxisId="right"
                dataKey="sessions" 
                fill="#10B981" 
                name="Sessions"
                radius={[4, 4, 0, 0]}
                barSize={timeFrame === 'monthly' ? 16 : 30}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
