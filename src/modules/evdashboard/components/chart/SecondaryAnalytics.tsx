import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, BarChart2, PieChart, RefreshCw } from 'lucide-react';
import { 
  ChartType, 
  TimePeriod, 
  DateRange, 
  SortBy, 
  GroupBy, 
  TopChargersResponse,
  ChargerUtilizationResponse,
  UserActivityResponse 
} from '../Chart';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';
import { TopPerformersChart } from './TopPerformersChart';
import { DistributionChart } from './DistributionChart';
import { EmptyState } from './EmptyState';

interface SecondaryAnalyticsProps {
  chartType: ChartType;
  timePeriod: TimePeriod;
  dateRange: DateRange;
  topChargersData: TopChargersResponse | null;
  chargerUtilization: ChargerUtilizationResponse | null;
  userData: UserActivityResponse | null;
  isLoading: boolean;
  error: Error | null;
  topCount: number;
  sortBy: SortBy;
  groupBy: GroupBy;
  onTopCountChange: (count: number) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onGroupByChange: (groupBy: GroupBy) => void;
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
  '#3B82F6', // blue-500
  '#4F46E5', // indigo-600
  '#7C3AED', // violet-600
  '#8B5CF6', // purple-500
  '#A855F7', // purple-500
  '#D946EF', // fuchsia-500
  '#EC4899', // pink-500
  '#F43F5E', // rose-500
  '#F97316', // orange-500
  '#F59E0B', // amber-500
  '#EAB308', // yellow-500
  '#10B981', // emerald-500
  '#14B8A6', // teal-500
  '#06B6D4', // cyan-500
  '#0EA5E9'  // light-blue-500
];

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
];

export const SecondaryAnalytics: React.FC<SecondaryAnalyticsProps> = ({
  chartType,
  timePeriod,
  dateRange,
  topChargersData,
  chargerUtilization,
  userData,
  isLoading,
  error,
  topCount,
  sortBy,
  groupBy,
  onTopCountChange,
  onSortByChange,
  onGroupByChange,
}) => {
  // Get appropriate formatter for values (for display in controls)
  const getValueFormatter = (value: number) => {
    switch (chartType) {
      case 'energy':
        return `${value.toFixed(2)} kWh`;
      case 'revenue':
        return `$${value.toFixed(2)}`;
      case 'sessions':
      case 'users':
      case 'chargers':
        return value.toString();
      default:
        return value.toString();
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Top Performers */}
      <Card className="shadow-sm border rounded-md overflow-hidden">
        <CardHeader className="py-3 px-4 border-b bg-gray-50">
          <CardTitle className="text-base font-medium flex items-center">
            <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-3">
          <div className="h-[180px]">
            {isLoading ? (
              <EmptyState
                type="loading"
                chartType="bar"
                message="Loading top performers data..."
              />
            ) : error ? (
              <EmptyState
                type="error"
                chartType="bar"
                message={error.message || 'Could not load top performers data'}
                onRetry={() => window.location.reload()}
              />
            ) : (
              <TopPerformersChart
                chartType={chartType}
                sortBy={sortBy}
                topCount={topCount}
                topChargersData={topChargersData}
                chargerUtilization={chargerUtilization}
              />
            )}
          </div>
          
          {/* Controls */}
          <div className="mt-3 flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">Show top:</span>
              <Select
                value={String(topCount)}
                onValueChange={(value) => onTopCountChange(Number(value))}
              >
                <SelectTrigger className="h-6 w-12 text-xs border-gray-200">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">By:</span>
              <Select
                value={sortBy}
                onValueChange={(value) => onSortByChange(value as SortBy)}
              >
                <SelectTrigger className="h-6 w-36 text-xs border-gray-200">
                  <SelectValue placeholder="Revenue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="energy_delivered">Energy Delivered</SelectItem>
                  <SelectItem value="sessions">Sessions</SelectItem>
                  <SelectItem value="utilization_rate">Utilization Rate</SelectItem>
                  <SelectItem value="hours_active">Hours Active</SelectItem>
                  <SelectItem value="availability_rate">Availability Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Distribution */}
      <Card className="shadow-sm border rounded-md overflow-hidden">
        <CardHeader className="py-3 px-4 border-b bg-gray-50">
          <CardTitle className="text-base font-medium flex items-center">
            <PieChart className="h-4 w-4 mr-2 text-purple-500" />
            Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-3">
          <div className="h-[180px]">
            {isLoading ? (
              <EmptyState
                type="loading"
                chartType="pie"
                message="Loading distribution data..."
              />
            ) : error ? (
              <EmptyState
                type="error"
                chartType="pie"
                message={error.message || 'Could not load distribution data'}
                onRetry={() => window.location.reload()}
              />
            ) : (
              <DistributionChart 
                chartType={chartType}
                groupBy={groupBy}
                chargerUtilization={chargerUtilization}
              />
            )}
          </div>
          
          {/* Controls */}
          <div className="mt-3 flex items-center bg-gray-50 p-2 rounded-md">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">Group by:</span>
              <Select
                value={groupBy}
                onValueChange={(value) => onGroupByChange(value as GroupBy)}
              >
                <SelectTrigger className="h-6 w-36 text-xs border-gray-200">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="is_online">Online Status</SelectItem>
                  <SelectItem value="connector_count">Connector Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecondaryAnalytics;
