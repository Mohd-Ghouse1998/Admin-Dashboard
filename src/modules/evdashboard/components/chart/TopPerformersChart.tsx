import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartType, SortBy, TopChargersResponse, ChargerUtilizationResponse } from '../Chart';

interface TopPerformersChartProps {
  chartType: ChartType;
  sortBy: SortBy;
  topCount: number;
  topChargersData: TopChargersResponse | null;
  chargerUtilization: ChargerUtilizationResponse | null;
}

// Define chart colors with consistency
const CHART_COLORS = {
  energy: '#3B82F6',    // blue-500
  revenue: '#10B981',   // green-500
  sessions: '#8B5CF6',  // purple-500
  users: '#F59E0B',     // amber-500
  chargers: '#EC4899',  // pink-500
  default: '#6366F1',   // indigo-500
  custom: '#64748B',    // slate-500
};

// Color scale for bars
const BAR_COLORS = [
  '#3B82F6',
  '#4F46E5',
  '#7C3AED', 
  '#8B5CF6',
  '#A855F7', 
  '#D946EF', 
  '#EC4899',
  '#F43F5E',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9'
];

export const TopPerformersChart: React.FC<TopPerformersChartProps> = ({
  chartType,
  sortBy,
  topCount,
  topChargersData,
  chargerUtilization
}) => {
  const [animate, setAnimate] = useState(false);
  
  // Activate animation when component mounts or chart type changes
  useEffect(() => {
    setAnimate(false);
    // Delay animation to ensure chart has time to render initially
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [chartType, sortBy, topCount]);

  // Format data for top performers chart
  const formatTopPerformersData = () => {
    if (topChargersData?.top_chargers) {
      return topChargersData.top_chargers
        .slice(0, topCount)
        .map((item, index) => {
          let value = 0;
          
          // Get the appropriate value based on sortBy
          if (sortBy === 'revenue' && 'total_revenue' in item) {
            value = item.total_revenue || 0;
          } else if ((sortBy === 'energy_delivered' || sortBy === 'sessions') && 'total_sessions' in item) {
            value = sortBy === 'sessions' ? (item.total_sessions || 0) : (item.total_energy || 0);
          }
          
          return {
            name: item.charger_name,
            value: value
          };
        })
        .sort((a, b) => b.value - a.value);
    }
    
    // Fallback to charger utilization data if available
    if (chargerUtilization?.charger_utilization) {
      return chargerUtilization.charger_utilization
        .filter(item => {
          // Filter out items with no value
          switch (sortBy) {
            case 'revenue':
              return item.revenue > 0;
            case 'energy_delivered':
              return item.energy_delivered > 0;
            case 'sessions':
              return item.sessions > 0;
            case 'utilization_rate':
              return item.utilization_rate > 0;
            case 'hours_active':
              return item.hours_active > 0;
            case 'availability_rate':
              return item.availability_rate > 0;
            default:
              return true;
          }
        })
        .slice(0, topCount)
        .map(item => {
          let value = 0;
          
          // Get the appropriate value based on sortBy
          switch (sortBy) {
            case 'revenue':
              value = item.revenue;
              break;
            case 'energy_delivered':
              value = item.energy_delivered;
              break;
            case 'sessions':
              value = item.sessions;
              break;
            case 'utilization_rate':
              value = item.utilization_rate;
              break;
            case 'hours_active':
              value = item.hours_active;
              break;
            case 'availability_rate':
              value = item.availability_rate;
              break;
            default:
              value = 0;
          }
          
          return {
            name: item.name,
            value: value
          };
        })
        .sort((a, b) => b.value - a.value);
    }
    
    // Generate demo data if no real data is available
    return Array.from({ length: topCount }, (_, i) => ({
      name: `Charger ${i + 1}`,
      value: Math.floor(Math.random() * 900) + 100
    })).sort((a, b) => b.value - a.value);
  };

  // Get appropriate label for the metric
  const getMetricLabel = () => {
    switch (sortBy) {
      case 'revenue':
        return 'Revenue ($)';
      case 'energy_delivered':
        return 'Energy (kWh)';
      case 'sessions':
        return 'Sessions';
      case 'utilization_rate':
        return 'Utilization (%)';
      case 'hours_active':
        return 'Hours Active';
      case 'availability_rate':
        return 'Availability (%)';
      default:
        return 'Value';
    }
  };

  // Format values for tooltip
  const formatValue = (value: number) => {
    switch (sortBy) {
      case 'revenue':
        return `$${value.toFixed(2)}`;
      case 'energy_delivered':
        return `${value.toFixed(2)} kWh`;
      case 'utilization_rate':
      case 'availability_rate':
        return `${value.toFixed(1)}%`;
      case 'hours_active':
        return `${value.toFixed(1)} hrs`;
      default:
        return value.toString();
    }
  };

  // Get chart data
  const data = formatTopPerformersData();

  return (
    <div className="h-full">
      <style>
        {`
          .top-performers-bar {
            opacity: 0;
            animation: fadeInBar 0.5s ease-out forwards;
          }
          
          @keyframes fadeInBar {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            domain={[0, 'auto']} 
            tick={{ fontSize: 10, fill: '#6B7280' }} 
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 10, fill: '#6B7280' }} 
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            width={100}
          />
          <Tooltip
            formatter={(value: number) => [formatValue(value), getMetricLabel()]}
            contentStyle={{ 
              background: '#FFF', 
              borderRadius: '4px', 
              border: '1px solid #E5E7EB', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}
            labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px' }}
          />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]}
            className="top-performers-bar"
            animationDuration={animate ? 1000 : 0}
            animationBegin={0}
            isAnimationActive={animate}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={BAR_COLORS[index % BAR_COLORS.length]} 
                style={{ 
                  animationDelay: `${index * 100}ms`
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopPerformersChart;
