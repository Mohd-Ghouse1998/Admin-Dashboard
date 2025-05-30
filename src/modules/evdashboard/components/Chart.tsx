import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bolt, 
  DollarSign, 
  Users, 
  PlugZap, 
  Settings,
  Activity
} from 'lucide-react';
import axios from 'axios';

// Import components with correct paths
import { AnalyticsControlPanel } from './chart/AnalyticsControlPanel';
import { PrimaryChart } from './chart/PrimaryChart';
import { SecondaryAnalytics } from './chart/SecondaryAnalytics';
import { DataDetails } from './chart/DataDetails';
import { format, parse, subMonths, format as formatDate } from 'date-fns';

// Define types for our chart
export type ChartType = 'energy' | 'revenue' | 'sessions' | 'users' | 'chargers' | 'custom';
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ChartViewType = 'bar' | 'line' | 'area';
export type ComparisonType = 'previous-period' | 'same-period-last-year' | 'forecast' | 'none';
export type SortBy = 'utilization_rate' | 'revenue' | 'energy_delivered' | 'sessions' | 'hours_active' | 'availability_rate';
export type GroupBy = 'location' | 'is_online' | 'connector_count';

// API response types
export interface MonthlyData {
  month: string;
  month_key: string;
  session_count: number;
  total_energy: number;
  total_revenue: number;
}

export interface YearlyData {
  year: string;
  total_energy: number;
  session_count: number;
  total_revenue: number;
}

export interface TopCharger {
  charger_id: string;
  charger_name: string;
  total_sessions?: number;
  total_energy?: number;
  total_revenue?: number;
  avg_revenue_per_session?: number;
}

export interface ChargerUtilization {
  charger_id: string;
  name: string;
  location: string;
  is_online: boolean;
  sessions: number;
  energy_delivered: number;
  revenue: number;
  hours_active: number;
  availability_rate: number;
  utilization_rate: number;
  connector_count: number;
  available_connectors: number;
}

export interface UserActivity {
  user_id: string;
  username: string;
  email: string;
  sessions: number;
  energy_kwh: number;
  revenue: number;
  has_activity: boolean;
}

// Interfaces for our date range
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

// API response interfaces
export interface MonthlyDataResponse {
  months_requested: number;
  monthly_data: MonthlyData[];
  date_filter: {
    date_from: string | null;
    date_to: string | null;
  };
  date_from?: string | null;
  date_to?: string | null;
}

export interface YearlyDataResponse {
  years_requested: number;
  yearly_data: YearlyData[];
  date_filter: {
    date_from: string | null;
    date_to: string | null;
  };
  date_from?: string | null;
  date_to?: string | null;
}

export interface TopChargersResponse {
  top_chargers: TopCharger[];
  date_filter: {
    date_from: string | null;
    date_to: string | null;
  };
  date_from?: string | null;
  date_to?: string | null;
}

export interface ChargerUtilizationResponse {
  charger_utilization: ChargerUtilization[];
  time_period: string;
  total_chargers: number;
  sort_by: string;
  date_filter: {
    date_from: string | null;
    date_to: string | null;
  };
  date_from?: string | null;
  date_to?: string | null;
  grouped_by?: string | null;
  groups?: any | null;
}

export interface UserActivityResponse {
  user_activity: UserActivity[];
  time_period: string;
  total_users: number;
  displayed_users: number;
  sort_by: string;
  show_active_first: boolean;
  date_filter: {
    date_from: string | null;
    date_to: string | null;
  };
  date_from?: string | null;
  date_to?: string | null;
}

// Props for the Chart component - align with EVDashboardPage
export interface ChartProps {
  className?: string;
  
  // Data props
  monthlyData?: any;
  yearlyData?: any;
  topSessionsData?: any;
  topRevenueData?: any;
  chargerUtilizationData?: any;
  chargerDistributionData?: any;
  
  // Loading states
  isLoadingMonthly?: boolean;
  isLoadingYearly?: boolean;
  isLoadingTopSessions?: boolean;
  isLoadingTopRevenue?: boolean;
  isLoadingChargerUtilization?: boolean;
  isLoadingChargerDistribution?: boolean;
  
  // Error states
  errorMonthly?: any;
  errorYearly?: any;
  errorTopSessions?: any;
  errorTopRevenue?: any;
  errorChargerUtilization?: any;
  errorChargerDistribution?: any;
  
  // Event handlers
  onFilterChange?: (options: any) => void;
}

export const Chart: React.FC<ChartProps> = ({ 
  className,
  // Data props from parent component
  monthlyData: externalMonthlyData,
  yearlyData: externalYearlyData,
  topSessionsData: externalTopSessionsData,
  topRevenueData: externalTopRevenueData,
  chargerUtilizationData: externalChargerUtilization,
  chargerDistributionData: externalChargerDistribution,
  
  // Loading states
  isLoadingMonthly,
  isLoadingYearly,
  isLoadingTopSessions,
  isLoadingTopRevenue,
  isLoadingChargerUtilization,
  isLoadingChargerDistribution,
  
  // Error states
  errorMonthly: externalErrorMonthly,
  errorYearly: externalErrorYearly,
  errorTopSessions: externalErrorTopSessions,
  errorTopRevenue: externalErrorTopRevenue,
  errorChargerUtilization: externalErrorChargerUtilization,
  errorChargerDistribution: externalErrorChargerDistribution,
  
  // Event handlers
  onFilterChange
}) => {
  // State for chart controls
  const [chartType, setChartType] = useState<ChartType>('energy');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null
  });
  const [chartViewType, setChartViewType] = useState<ChartViewType>('bar');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('none');
  
  // State for secondary analytics
  const [topCount, setTopCount] = useState<number>(5);
  const [sortBy, setSortBy] = useState<SortBy>('revenue');
  const [groupBy, setGroupBy] = useState<GroupBy>('location');
  
  // State for data
  const [monthlyData, setMonthlyData] = useState<MonthlyDataResponse | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyDataResponse | null>(null);
  const [topChargersData, setTopChargersData] = useState<TopChargersResponse | null>(null);
  const [chargerUtilization, setChargerUtilization] = useState<ChargerUtilizationResponse | null>(null);
  const [userData, setUserData] = useState<UserActivityResponse | null>(null);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch data from API based on current filters
  const fetchChartData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare date filter params if date range is provided
      let dateParams = '';
      if (dateRange.from && dateRange.to) {
        const fromFormatted = formatDate(dateRange.from, 'yyyy-MM-dd');
        const toFormatted = formatDate(dateRange.to, 'yyyy-MM-dd');
        dateParams = `?date_from=${fromFormatted}&date_to=${toFormatted}`;
      }
      
      // Fetch data based on time period
      if (timePeriod === 'monthly') {
        const response = await axios.get(`/api/dashboard/charts/monthly/${dateParams}`);
        console.log('API Monthly data:', response.data);
        setMonthlyData(response.data);
      } else if (timePeriod === 'yearly') {
        const response = await axios.get(`/api/dashboard/charts/yearly/${dateParams}`);
        console.log('API Yearly data:', response.data);
        setYearlyData(response.data);
      }
      
      // Fetch top sessions data
      const sessionsResponse = await axios.get(`/api/dashboard/charts/top-sessions/${dateParams}`);
      console.log('API Top Sessions data:', sessionsResponse.data);
      setTopChargersData({
        ...sessionsResponse.data,
        top_sessions: sessionsResponse.data.top_chargers // Normalize the data
      });
      
      // Fetch top revenue data
      const revenueResponse = await axios.get(`/api/dashboard/charts/top-revenue/${dateParams}`);
      console.log('API Top Revenue data:', revenueResponse.data);
      setTopChargersData(prevData => ({
        ...revenueResponse.data,
        top_chargers: revenueResponse.data.top_chargers,
      }));
      
      // Fetch charger utilization data with sorting parameters
      let utilizationParams = dateParams ? dateParams + '&' : '?';
      utilizationParams += `sort_by=${sortBy}&group_by=${groupBy}&limit=${topCount}`;
      
      const utilizationResponse = await axios.get(
        `/api/dashboard/charts/chargers/utilization${utilizationParams}`
      );
      console.log('API Charger Utilization data:', utilizationResponse.data);
      setChargerUtilization(utilizationResponse.data);
      
      // Fetch user activity data
      const userResponse = await axios.get(`/api/dashboard/charts/users${dateParams}`);
      console.log('API User Activity data:', userResponse.data);
      setUserData(userResponse.data);
      
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch chart data'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Use external data if provided, otherwise fetch from API
  useEffect(() => {
    if (externalMonthlyData || externalYearlyData || externalChargerUtilization) {
      // Use external data (passed from parent) if available
      const loadingState = isLoadingMonthly || isLoadingYearly || isLoadingChargerUtilization;
      setIsLoading(Boolean(loadingState));
      
      // Set error state if any errors are present
      const currentError = externalErrorMonthly || externalErrorYearly || externalErrorChargerUtilization;
      if (currentError) {
        setError(currentError instanceof Error ? currentError : new Error(String(currentError)));
      } else {
        setError(null);
      }
      
      // Process external data if available
      if (externalMonthlyData) {
        console.log("Using monthly data from props:", externalMonthlyData);
        setMonthlyData(externalMonthlyData);
      }
      
      if (externalYearlyData) {
        console.log("Using yearly data from props:", externalYearlyData);
        setYearlyData(externalYearlyData);
      }
      
      if (externalChargerUtilization) {
        console.log("Using charger utilization data from props:", externalChargerUtilization);
        setChargerUtilization(externalChargerUtilization);
      }
      
      if (externalTopSessionsData) {
        console.log("Using top sessions data from props:", externalTopSessionsData);
        setTopChargersData(externalTopSessionsData);
      }
      
      if (externalTopRevenueData) {
        console.log("Using top revenue data from props:", externalTopRevenueData);
        setTopChargersData(prevData => ({
          ...prevData,
          ...externalTopRevenueData,
        }));
      }
    } else {
      // Fetch data from API if no external data is provided
      fetchChartData();
    }
  }, [
    externalMonthlyData, 
    externalYearlyData, 
    externalChargerUtilization,
    externalTopSessionsData,
    externalTopRevenueData,
    isLoadingMonthly, 
    isLoadingYearly, 
    isLoadingChargerUtilization,
    externalErrorMonthly, 
    externalErrorYearly, 
    externalErrorChargerUtilization
  ]);
  
  // Refetch data when filters change
  useEffect(() => {
    // Skip the initial render
    const shouldFetch = !externalMonthlyData && !externalYearlyData && !externalChargerUtilization;
    
    if (shouldFetch) {
      fetchChartData();
    }
    
    // Notify parent component of filter changes if callback is provided
    if (onFilterChange) {
      onFilterChange({
        chartType,
        timePeriod,
        dateRange,
        sortBy,
        groupBy,
        topCount
      });
    }
  }, [chartType, timePeriod, dateRange, sortBy, groupBy, topCount]);
  
  // Handle filter changes for analytics controls
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    // The useEffect will handle data refetching
  };
  
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    // Reset chart data when time period changes
    if (period === 'monthly') {
      setYearlyData(null);
    } else if (period === 'yearly') {
      setMonthlyData(null);
    }
    // The useEffect will handle data refetching
  };
  
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    // The useEffect will handle data refetching
  };
  
  const handleSortByChange = (sort: SortBy) => {
    setSortBy(sort);
    // The useEffect will handle data refetching
  };
  
  const handleGroupByChange = (group: GroupBy) => {
    setGroupBy(group);
    // The useEffect will handle data refetching
  };
  
  const handleTopCountChange = (count: number) => {
    setTopCount(count);
    // The useEffect will handle data refetching
  };
  
  // Get the appropriate icon for the chart type
  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case 'energy':
        return <Bolt className="h-4 w-4" />;
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'sessions':
        return <Activity className="h-4 w-4" />;
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'chargers':
        return <PlugZap className="h-4 w-4" />;
      case 'custom':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bolt className="h-4 w-4" />;
    }
  };
  
  // Function to handle download/export/expand actions
  const handleDownload = () => {
    console.log('Download chart data');
    // Implement download functionality
  };
  
  const handleExport = () => {
    console.log('Export chart as image');
    // Implement export functionality
  };
  
  const handleExpand = () => {
    console.log('Expand chart to full screen');
    // Implement expand functionality
  };
  
  // Notify parent of filter changes if needed
  const handleFilterChange = (options: any) => {
    if (onFilterChange) {
      onFilterChange(options);
    }
  };
  
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Primary Chart with integrated controls */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {/* Controls integrated within the chart card */}
          <div className="sticky top-0 z-10 bg-white border-b px-3 py-2">
            <AnalyticsControlPanel 
              chartType={chartType}
              onChartTypeChange={handleChartTypeChange}
              timePeriod={timePeriod}
              onTimePeriodChange={handleTimePeriodChange}
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
          
          {/* Primary Chart */}
          <PrimaryChart 
            chartType={chartType}
            timePeriod={timePeriod}
            dateRange={dateRange}
            monthlyData={monthlyData}
            yearlyData={yearlyData}
            isLoading={isLoading}
            error={error}
            chartViewType={chartViewType}
            comparisonType={comparisonType}
            onChartViewTypeChange={setChartViewType}
            onComparisonTypeChange={setComparisonType}
            onDownload={handleDownload}
            onExport={handleExport}
            onExpand={handleExpand}
          />
        </CardContent>
      </Card>
      
      {/* Secondary Analytics */}
      <SecondaryAnalytics 
        chartType={chartType}
        timePeriod={timePeriod}
        dateRange={dateRange}
        topChargersData={topChargersData}
        chargerUtilization={chargerUtilization}
        userData={userData}
        isLoading={isLoading}
        error={error}
        topCount={topCount}
        sortBy={sortBy}
        groupBy={groupBy}
        onTopCountChange={handleTopCountChange}
        onSortByChange={handleSortByChange}
        onGroupByChange={handleGroupByChange}
      />
      
      {/* Data Details */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <DataDetails 
            chartType={chartType}
            timePeriod={timePeriod}
            dateRange={dateRange}
            chargerUtilization={chargerUtilization}
            userData={userData}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Chart;
