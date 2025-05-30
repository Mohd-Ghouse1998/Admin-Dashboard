import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { ConnectorStatusBreakdown } from '../types/api-types';
import { Loader2, BatteryCharging, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChargerStatusChartProps {
  data: ConnectorStatusBreakdown[];
  title: string;
  isLoading: boolean;
  error: Error | null;
  onlineDistribution?: {status: string; count: number}[];
  totalChargers?: number;
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
const formatStatus = (status: string): string => {
  switch(status) {
    case 'SuspendedEVSE': return 'Suspended';
    case 'In Use': return 'Charging';
    default: return status;
  }
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

export const ChargerStatusChart: React.FC<ChargerStatusChartProps> = ({ 
  data, 
  title,
  isLoading,
  error,
  onlineDistribution,
  totalChargers = 0,
  totalConnectors = 0
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'status' | 'online'>('status');
  
  // Format data for the status distribution chart
  const statusData = data?.map(item => ({
    name: formatStatus(item.status),
    value: item.count,
    color: getStatusColor(item.status)
  })) || [];
  
  // Format data for the online/offline distribution chart
  const onlineData = onlineDistribution?.map(item => ({
    name: item.status,
    value: item.count,
    color: getStatusColor(item.status)
  })) || [];
  
  // Select which dataset to display based on active tab
  const chartData = activeTab === 'status' ? statusData : onlineData;
  
  // Calculate metrics
  const availableConnectors = data?.find(s => s.status === 'Available')?.count || 0;
  const availabilityRate = totalConnectors > 0 ? Math.round((availableConnectors / totalConnectors) * 100) : 0;
  
  const chargingConnectors = data?.find(s => s.status === 'Charging' || s.status === 'In Use')?.count || 0;
  const utilizationRate = totalConnectors > 0 ? Math.round((chargingConnectors / totalConnectors) * 100) : 0;
  
  const faultedConnectors = data?.find(s => s.status === 'Faulted')?.count || 0;
  const healthRate = totalConnectors > 0 ? Math.round(((totalConnectors - faultedConnectors) / totalConnectors) * 100) : 0;
  
  const onlineChargers = onlineDistribution?.find(s => s.status === 'Online')?.count || 0;
  const onlineRate = totalChargers > 0 ? Math.round((onlineChargers / totalChargers) * 100) : 0;
  
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
              {activeTab === 'status' ? 
                `${totalConnectors} Total Connectors` : 
                `${totalChargers} Total Chargers`}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('status')} 
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-colors",
                activeTab === 'status' ? 
                  "bg-primary/10 text-primary font-medium" : 
                  "bg-transparent text-muted-foreground hover:bg-gray-100"
              )}
            >
              Status
            </button>
            <button 
              onClick={() => setActiveTab('online')} 
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-colors",
                activeTab === 'online' ? 
                  "bg-primary/10 text-primary font-medium" : 
                  "bg-transparent text-muted-foreground hover:bg-gray-100"
              )}
            >
              Connectivity
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          {/* Chart Section */}
          <div className="md:w-1/2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
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
                    formatter={(value) => [
                      `${value} ${activeTab === 'status' ? 'Connectors' : 'Chargers'}`, 
                      'Count'
                    ]}
                    labelFormatter={(name) => `${activeTab === 'status' ? 'Status' : 'Connectivity'}: ${name}`}
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
          </div>
          
          {/* Metrics and Legend Section */}
          <div className="md:w-1/2 md:pl-6 mt-4 md:mt-0">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {activeTab === 'status' ? (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Availability Rate</div>
                    <div className="text-xl font-bold text-primary">{availabilityRate}%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Utilization Rate</div>
                    <div className="text-xl font-bold text-blue-500">{utilizationRate}%</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Online Rate</div>
                      <div className="text-xl font-bold text-green-500">{onlineRate}%</div>
                    </div>
                    <Wifi className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Offline Rate</div>
                      <div className="text-xl font-bold text-gray-500">{100 - onlineRate}%</div>
                    </div>
                    <WifiOff className="h-5 w-5 text-gray-500" />
                  </div>
                </>
              )}
            </div>
            
            {/* Summary Box */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">{activeTab === 'status' ? 'Connector Summary' : 'Charger Summary'}</h3>
              <div className="grid grid-cols-2 gap-4">
                {activeTab === 'status' ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">{availableConnectors} Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm">{data?.find(s => s.status === 'SuspendedEVSE')?.count || 0} Suspended</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">{onlineChargers} Online</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                      <span className="text-sm">{totalChargers - onlineChargers} Offline</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-1.5">
              <h3 className="font-semibold mb-2">Details</h3>
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
                    {totalConnectors > 0 && activeTab === 'status' && (
                      <span className="text-xs text-gray-500">
                        ({Math.round((item.value / totalConnectors) * 100)}%)
                      </span>
                    )}
                    {totalChargers > 0 && activeTab === 'online' && (
                      <span className="text-xs text-gray-500">
                        ({Math.round((item.value / totalChargers) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
