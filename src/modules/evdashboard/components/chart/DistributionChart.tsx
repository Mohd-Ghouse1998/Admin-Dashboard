import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { ChartType, GroupBy, ChargerUtilizationResponse } from '../Chart';

interface DistributionChartProps {
  chartType: ChartType;
  groupBy: GroupBy;
  chargerUtilization: ChargerUtilizationResponse | null;
}

// Color palette for pie slices
const PIE_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // green-500
  '#8B5CF6', // purple-500
  '#F59E0B', // amber-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
  '#64748B', // slate-500
  '#EF4444', // red-500
  '#14B8A6', // teal-500
  '#06B6D4', // cyan-500
  '#0EA5E9', // light-blue-500
  '#A855F7', // purple-500
  '#D946EF', // fuchsia-500
  '#F43F5E', // rose-500
  '#F97316', // orange-500
];

export const DistributionChart: React.FC<DistributionChartProps> = ({
  chartType,
  groupBy,
  chargerUtilization
}) => {
  const [animate, setAnimate] = useState(false);
  
  // Activate animation when component mounts or options change
  useEffect(() => {
    setAnimate(false);
    // Delay animation to ensure chart has time to render initially
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [chartType, groupBy]);

  // Format data for distribution chart
  const formatDistributionData = () => {
    if (!chargerUtilization?.charger_utilization) {
      // Generate demo data if no real data is available
      if (groupBy === 'location') {
        return [
          { name: 'Downtown', value: 35 },
          { name: 'North End', value: 25 },
          { name: 'East Side', value: 15 },
          { name: 'West Side', value: 15 },
          { name: 'South End', value: 10 }
        ];
      } else if (groupBy === 'is_online') {
        return [
          { name: 'Online', value: 85 },
          { name: 'Offline', value: 15 }
        ];
      } else {
        return [
          { name: '1 Connector', value: 20 },
          { name: '2 Connectors', value: 40 },
          { name: '3 Connectors', value: 25 },
          { name: '4+ Connectors', value: 15 }
        ];
      }
    }
    
    const utilData = chargerUtilization.charger_utilization;
    
    if (groupBy === 'location') {
      // Group by location
      const locationGroups: Record<string, number> = {};
      
      utilData.forEach(item => {
        const location = item.location || 'Unknown';
        
        if (!locationGroups[location]) {
          locationGroups[location] = 0;
        }
        
        switch (chartType) {
          case 'energy':
            locationGroups[location] += item.energy_delivered;
            break;
          case 'revenue':
            locationGroups[location] += item.revenue;
            break;
          case 'sessions':
            locationGroups[location] += item.sessions;
            break;
          case 'users':
            locationGroups[location] += item.sessions; // Using sessions as proxy for users
            break;
          case 'chargers':
            locationGroups[location] += 1; // Count chargers
            break;
          default:
            locationGroups[location] += 1;
        }
      });
      
      return Object.entries(locationGroups)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0);
    } else if (groupBy === 'is_online') {
      // Group by online status
      const onlineCount = utilData.filter(item => item.is_online).length;
      const offlineCount = utilData.filter(item => !item.is_online).length;
      
      return [
        { name: 'Online', value: onlineCount },
        { name: 'Offline', value: offlineCount }
      ].filter(item => item.value > 0);
    } else if (groupBy === 'connector_count') {
      // Group by connector count
      const connectorGroups: Record<string, number> = {};
      
      utilData.forEach(item => {
        const count = item.connector_count || 0;
        const key = count === 0 ? 'None' : count === 1 ? '1 Connector' : `${count} Connectors`;
        
        if (!connectorGroups[key]) {
          connectorGroups[key] = 0;
        }
        
        connectorGroups[key] += 1;
      });
      
      return Object.entries(connectorGroups)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0);
    }
    
    return [];
  };

  // Get appropriate label based on chart type and group by option
  const getChartLabel = () => {
    let metric = '';
    switch (chartType) {
      case 'energy':
        metric = 'Energy';
        break;
      case 'revenue':
        metric = 'Revenue';
        break;
      case 'sessions':
        metric = 'Sessions';
        break;
      case 'users':
        metric = 'Users';
        break;
      case 'chargers':
        metric = 'Chargers';
        break;
      default:
        metric = 'Value';
    }
    
    let grouping = '';
    switch (groupBy) {
      case 'location':
        grouping = 'by Location';
        break;
      case 'is_online':
        grouping = 'by Status';
        break;
      case 'connector_count':
        grouping = 'by Connector Count';
        break;
    }
    
    return `${metric} ${grouping}`;
  };
  
  // Format values for tooltip
  const formatValue = (value: number, percentage: number) => {
    switch (chartType) {
      case 'energy':
        return `${value.toFixed(2)} kWh (${percentage.toFixed(1)}%)`;
      case 'revenue':
        return `$${value.toFixed(2)} (${percentage.toFixed(1)}%)`;
      case 'sessions':
      case 'users':
      case 'chargers':
        return `${value} (${percentage.toFixed(1)}%)`;
      default:
        return `${value} (${percentage.toFixed(1)}%)`;
    }
  };
  
  // Get data for chart
  const data = formatDistributionData();
  
  // Calculate total for percentage calculation
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = (payload[0].value / total) * 100;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium text-sm">{payload[0].name}</p>
          <p className="text-sm">{formatValue(payload[0].value, percentage)}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend rendering
  const renderCustomizedLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center text-xs">
            <div
              style={{
                backgroundColor: entry.color,
                width: 8,
                height: 8,
                borderRadius: '50%',
                marginRight: 4
              }}
            />
            <span className="text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full">
      <style>
        {`
          .distribution-slice {
            animation: expandSlice 1.2s ease-out forwards;
            transform-origin: center;
            opacity: 0;
          }
          
          @keyframes expandSlice {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={30}
            paddingAngle={2}
            dataKey="value"
            className="distribution-slice"
            animationBegin={0}
            animationDuration={animate ? 1000 : 0}
            isAnimationActive={animate}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={PIE_COLORS[index % PIE_COLORS.length]}
                strokeWidth={1}
                stroke="#fff"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            content={renderCustomizedLegend} 
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;
