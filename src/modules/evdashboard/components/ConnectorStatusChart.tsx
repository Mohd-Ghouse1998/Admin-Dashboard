import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { ConnectorStatusBreakdown } from '../types/api-types';
import { Loader2, PlugZap, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectorStatusChartProps {
  data: ConnectorStatusBreakdown[];
  title: string;
  isLoading: boolean;
  error: Error | null;
  totalConnectors?: number;
}

// Color mapping for different status types
const STATUS_COLORS = {
  'Available': '#4CAF50',  // Green
  'Charging': '#2196F3',   // Blue
  'In Use': '#2196F3',     // Blue (same as Charging)
  'Faulted': '#F44336',    // Red
  'Unavailable': '#9E9E9E', // Gray
  'SuspendedEVSE': '#FF9800', // Orange
  'Reserved': '#9C27B0',    // Purple
  'Offline': '#757575',     // Dark Gray
  'Online': '#4CAF50',      // Green
  // Default for any other status
  'default': '#FFEB3B'       // Yellow
};

// Get color for a status
const getStatusColor = (status: string) => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
};

// Format status for display
const formatStatus = (status: string) => {
  // You can customize how status names are displayed here
  return status;
};

// Render customized active shape with additional effects
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy} dy="-0.5em" textAnchor="middle" className="text-base font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy="1em" textAnchor="middle" fill="#333" className="text-xl font-bold">
        {value}
      </text>
      <text x={cx} y={cy} dy="2.5em" textAnchor="middle" className="text-xs text-gray-500">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const ConnectorStatusChart: React.FC<ConnectorStatusChartProps> = ({ 
  data, 
  title,
  isLoading,
  error,
  totalConnectors
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Format data for the chart
  const chartData = data?.map(item => ({
    name: formatStatus(item.status),
    value: item.count,
    color: getStatusColor(item.status)
  })) || [];
  
  // Calculate key metrics
  const availableConnectors = data?.find(s => s.status === 'Available')?.count || 0;
  const availabilityRate = totalConnectors > 0 ? Math.round((availableConnectors / totalConnectors) * 100) : 0;
  
  const chargingConnectors = data?.find(s => s.status === 'Charging' || s.status === 'In Use')?.count || 0;
  const utilizationRate = totalConnectors > 0 ? Math.round((chargingConnectors / totalConnectors) * 100) : 0;
  
  const faultedConnectors = data?.find(s => s.status === 'Faulted')?.count || 0;
  const healthRate = totalConnectors > 0 ? Math.round(((totalConnectors - faultedConnectors) / totalConnectors) * 100) : 0;
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-red-500">
            <p>Error loading data</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-md font-medium">{title}</CardTitle>
            <CardDescription>
              {totalConnectors ? `${totalConnectors} Total Connectors` : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease"
                isAnimationActive={true}
                onMouseEnter={onPieEnter}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} Connectors`, 'Count']}
                labelFormatter={(name) => `Status: ${name}`}
                contentStyle={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: 'none',
                  padding: '8px 12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Availability</div>
              <div className="text-xl font-bold text-green-500">{availabilityRate}%</div>
            </div>
            <PlugZap className="h-5 w-5 text-green-500" />
          </div>
          <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Utilization</div>
              <div className="text-xl font-bold text-blue-500">{utilizationRate}%</div>
            </div>
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {chartData.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{item.value}</span>
                {totalConnectors > 0 && (
                  <span className="text-xs text-gray-500">
                    ({Math.round((item.value / totalConnectors) * 100)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
