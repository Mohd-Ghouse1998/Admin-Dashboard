import React, { useState, useEffect } from 'react';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  Download, 
  Maximize, 
  Printer, 
  BarChart2,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  RefreshCw,
  Info
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ChartType, 
  TimePeriod, 
  ChartViewType, 
  ComparisonType, 
  DateRange, 
  MonthlyDataResponse,
  YearlyDataResponse 
} from '../Chart';
import { EmptyState } from './EmptyState';

interface PrimaryChartProps {
  chartType: ChartType;
  timePeriod: TimePeriod;
  dateRange: DateRange;
  monthlyData: MonthlyDataResponse | null;
  yearlyData: YearlyDataResponse | null;
  isLoading: boolean;
  error: Error | null;
  chartViewType: ChartViewType;
  comparisonType: ComparisonType;
  onChartViewTypeChange: (type: ChartViewType) => void;
  onComparisonTypeChange: (type: ComparisonType) => void;
  onDownload?: () => void;
  onExport?: () => void;
  onExpand?: () => void;
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

// Modern gradient definitions for bar charts
const CHART_GRADIENTS = {
  energy: ['#3B82F6', '#93C5FD'],     // blue-500 to blue-300
  revenue: ['#10B981', '#6EE7B7'],    // green-500 to green-300
  sessions: ['#8B5CF6', '#C4B5FD'],   // purple-500 to purple-300
  users: ['#F59E0B', '#FCD34D'],      // amber-500 to amber-300
  chargers: ['#EC4899', '#F9A8D4'],   // pink-500 to pink-300
  default: ['#6366F1', '#A5B4FC'],    // indigo-500 to indigo-300
  custom: ['#64748B', '#CBD5E1'],     // slate-500 to slate-300
};

// Define chart styles and animations
const CHART_STYLES = `
  .recharts-curve.recharts-line-curve {
    stroke-dasharray: 2000;
    stroke-dashoffset: 2000;
    animation: drawLine 1.5s ease-in-out forwards;
  }

  .recharts-area-area {
    opacity: 0;
    animation: fadeIn 1.5s ease-in-out forwards;
    animation-delay: 0.3s;
  }

  .recharts-bar-rectangle {
    opacity: 0;
    animation: growBar 0.8s ease-out forwards;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    transition: filter 0.3s ease;
  }
  
  .recharts-bar-rectangle:hover {
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
  }
  
  .recharts-rectangle.recharts-tooltip-cursor {
    fill: rgba(0, 0, 0, 0.05);
    stroke: none;
  }

  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: rgba(0, 0, 0, 0.06);
  }

  .recharts-xAxis .recharts-cartesian-axis-tick-line,
  .recharts-yAxis .recharts-cartesian-axis-tick-line {
    stroke: rgba(0, 0, 0, 0.2);
  }

  .recharts-xAxis .recharts-cartesian-axis-tick-value,
  .recharts-yAxis .recharts-cartesian-axis-tick-value {
    fill: rgba(0, 0, 0, 0.6);
    font-size: 11px;
  }

  @keyframes drawLine {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes fadeIn {
    to {
      opacity: 0.6;
    }
  }

  @keyframes growBar {
    from {
      transform: scaleY(0);
      opacity: 0;
    }
    to {
      transform: scaleY(1);
      opacity: 1;
    }
  }
`;

export const PrimaryChart: React.FC<PrimaryChartProps> = ({
  chartType,
  timePeriod,
  dateRange,
  monthlyData,
  yearlyData,
  isLoading,
  error,
  chartViewType,
  comparisonType,
  onChartViewTypeChange,
  onComparisonTypeChange,
  onDownload,
  onExport,
  onExpand,
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
  }, [chartType, timePeriod, chartViewType]);

  // Format data for chart based on chart type and time period
  const formatChartData = () => {
    console.log('Formatting chart data with:', { 
      chartType, 
      timePeriod,
      monthlyData: monthlyData?.monthly_data?.length,
      yearlyData: yearlyData?.yearly_data?.length
    });
    
    if (timePeriod === 'monthly' && monthlyData?.monthly_data) {
      console.log('Using monthly data:', monthlyData.monthly_data);
      const formattedData = monthlyData.monthly_data.map(item => {
        let value = 0;
        
        // Map the correct value based on chart type
        switch (chartType) {
          case 'energy':
            value = item.total_energy;
            break;
          case 'revenue':
            value = item.total_revenue;
            break;
          case 'sessions':
          case 'users':
          case 'chargers':
            value = item.session_count;
            break;
          default:
            value = 0;
        }
        
        // Generate a comparison value (simulated for demo)
        const comparisonValue = comparisonType !== 'none' ? value * 0.75 : undefined;
        
        return {
          name: item.month,
          value,
          comparisonValue
        };
      });
      
      console.log('Formatted monthly data:', formattedData);
      return formattedData;
    } else if ((timePeriod === 'yearly' || timePeriod === 'quarterly') && yearlyData?.yearly_data) {
      console.log('Using yearly data:', yearlyData.yearly_data);
      const formattedData = yearlyData.yearly_data.map(item => {
        let value = 0;
        
        // Map the correct value based on chart type
        switch (chartType) {
          case 'energy':
            value = item.total_energy;
            break;
          case 'revenue':
            value = item.total_revenue;
            break;
          case 'sessions':
          case 'users':
          case 'chargers':
            value = item.session_count;
            break;
          default:
            value = 0;
        }
        
        // Generate a comparison value (simulated for demo)
        const comparisonValue = comparisonType !== 'none' ? value * 0.75 : undefined;
        
        return {
          name: item.year,
          value,
          comparisonValue
        };
      });
      
      console.log('Formatted yearly data:', formattedData);
      return formattedData;
    } else {
      // If we don't have data for the selected time period, return empty array
      console.warn('No data available for the selected time period:', { timePeriod, chartType });
      return [];
    }
  };

  // Get chart title based on chart type
  const getChartTitle = () => {
    switch (chartType) {
      case 'energy':
        return 'Energy Delivered (kWh)';
      case 'revenue':
        return 'Revenue ($)';
      case 'sessions':
        return 'Charging Sessions';
      case 'users':
        return 'Active Users';
      case 'chargers':
        return 'Active Chargers';
      default:
        return 'Value';
    }
  };

  // Get chart Y-axis label
  const getYAxisLabel = () => {
    switch (chartType) {
      case 'energy':
        return 'kWh';
      case 'revenue':
        return '$';
      case 'sessions':
        return 'Count';
      case 'users':
        return 'Users';
      case 'chargers':
        return 'Chargers';
      default:
        return 'Value';
    }
  };

  // Get color based on chart type
  const getChartColor = () => {
    return CHART_COLORS[chartType] || CHART_COLORS.default;
  };

  // Get comparison color
  const getComparisonColor = () => {
    return '#64748B'; // Use slate-500 for comparison
  };

  // Format values for tooltip and Y-axis
  const formatValue = (value: number) => {
    switch (chartType) {
      case 'energy':
        return `${value.toLocaleString()} kWh`;
      case 'revenue':
        return `$${value.toLocaleString()}`;
      case 'sessions':
        return value.toLocaleString();
      case 'users':
        return value.toLocaleString();
      case 'chargers':
        return value.toLocaleString();
      default:
        return value.toLocaleString();
    }
  };

  // Tooltip formatter for charts
  const tooltipFormatter = (value: number) => {
    return formatValue(value);
  };

  // Y-axis formatter for charts
  const getYAxisFormatter = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    } else {
      return value.toString();
    }
  };

  // Get comparison label
  const getComparisonLabel = () => {
    switch (comparisonType) {
      case 'previous-period':
        return 'Previous Period';
      case 'same-period-last-year':
        return 'Last Year';
      case 'forecast':
        return 'Forecast';
      default:
        return 'Comparison';
    }
  };

  // Format the data for the chart
  const data = formatChartData();
  
  // Add console log to see what's happening with the data
  useEffect(() => {
    console.log('Chart data state:', { 
      dataLength: data.length,
      isLoading, 
      error,
      isEmpty: data.length === 0 && !isLoading && !error 
    });
  }, [data, isLoading, error]);
  
  // Check if data is empty - only consider it empty if we're not loading and there's no error
  const isEmpty = data.length === 0 && !isLoading && !error;

  // Render the appropriate chart based on chartViewType
  const renderChart = () => {
    // If data is empty, don't render anything
    if (data.length === 0) return null;
    
    // Determine gradient colors for the selected chart type
    const gradientColors = CHART_GRADIENTS[chartType] || CHART_GRADIENTS.default;
    const gradientId = `chart-gradient-${chartType}`;
    const comparisonGradientId = `chart-comparison-gradient-${chartType}`;
    
    // Modern tooltip styling
    const tooltipStyle = { 
      backgroundColor: 'white', 
      border: 'none',
      borderRadius: '8px',
      padding: '10px 14px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      fontSize: '12px',
      fontWeight: 500,
    };
    
    switch (chartViewType) {
      case 'bar':
        return (
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            barGap={5}
            barCategoryGap={10}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColors[0]} stopOpacity={1} />
                <stop offset="100%" stopColor={gradientColors[1]} stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id={comparisonGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getComparisonColor()} stopOpacity={0.8} />
                <stop offset="100%" stopColor={getComparisonColor()} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              axisLine={{ stroke: '#E2E8F0' }} 
              tickLine={{ stroke: '#E2E8F0' }}
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              tickFormatter={getYAxisFormatter}
              axisLine={{ stroke: '#E2E8F0' }} 
              tickLine={{ stroke: '#E2E8F0' }}
              dx={-10}
            />
            <Tooltip 
              formatter={tooltipFormatter}
              contentStyle={tooltipStyle}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => <span style={{ fontSize: '12px', color: '#475569' }}>{value}</span>}
            />
            <Bar 
              dataKey="value" 
              name={getChartTitle()} 
              fill={`url(#${gradientId})`} 
              radius={[6, 6, 0, 0]} 
              barSize={30} 
              isAnimationActive={animate}
              animationDuration={1200}
            />
            {comparisonType !== 'none' && (
              <Bar 
                dataKey="comparisonValue" 
                name={getComparisonLabel()} 
                fill={`url(#${comparisonGradientId})`} 
                radius={[6, 6, 0, 0]} 
                barSize={30} 
                isAnimationActive={animate}
                animationDuration={1200}
                animationBegin={300}
              />
            )}
          </BarChart>
        );
        
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <defs>
              <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={gradientColors[0]} stopOpacity={1} />
                <stop offset="100%" stopColor={gradientColors[0]} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              axisLine={{ stroke: '#E2E8F0' }} 
              tickLine={{ stroke: '#E2E8F0' }}
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              tickFormatter={getYAxisFormatter}
              axisLine={{ stroke: '#E2E8F0' }} 
              tickLine={{ stroke: '#E2E8F0' }}
              dx={-10}
            />
            <Tooltip 
              formatter={tooltipFormatter}
              contentStyle={tooltipStyle}
              cursor={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
            />
            <Legend 
              iconType="line" 
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => <span style={{ fontSize: '12px', color: '#475569' }}>{value}</span>}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={`url(#${gradientId}-line)`}
              name={getChartTitle()}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, fill: 'white', stroke: gradientColors[0] }}
              activeDot={{ r: 6, strokeWidth: 0, fill: gradientColors[0] }}
              isAnimationActive={animate}
              animationDuration={1200}
            />
            {comparisonType !== 'none' && (
              <Line 
                type="monotone" 
                dataKey="comparisonValue" 
                stroke={getComparisonColor()}
                name={getComparisonLabel()}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, strokeWidth: 1, fill: 'white', stroke: getComparisonColor() }}
                activeDot={{ r: 5, strokeWidth: 0, fill: getComparisonColor() }}
                isAnimationActive={animate}
                animationDuration={1200}
                animationBegin={300}
              />
            )}
          </LineChart>
        );
        
      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <defs>
              <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColors[0]} stopOpacity={0.5} />
                <stop offset="100%" stopColor={gradientColors[0]} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id={`${comparisonGradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getComparisonColor()} stopOpacity={0.3} />
                <stop offset="100%" stopColor={getComparisonColor()} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              axisLine={{ stroke: '#E2E8F0' }} 
              tickLine={{ stroke: '#E2E8F0' }}
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              tickFormatter={getYAxisFormatter}
              axisLine={{ stroke: '#E2E8F0' }} 
              tickLine={{ stroke: '#E2E8F0' }}
              dx={-10}
            />
            <Tooltip 
              formatter={tooltipFormatter}
              contentStyle={tooltipStyle}
              cursor={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
            />
            <Legend 
              iconType="square" 
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => <span style={{ fontSize: '12px', color: '#475569' }}>{value}</span>}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={gradientColors[0]}
              strokeWidth={2}
              fill={`url(#${gradientId}-area)`}
              name={getChartTitle()}
              dot={{ r: 3, strokeWidth: 1, fill: 'white', stroke: gradientColors[0] }}
              activeDot={{ r: 5, strokeWidth: 0, fill: gradientColors[0] }}
              isAnimationActive={animate}
              animationDuration={1200}
            />
            {comparisonType !== 'none' && (
              <Area 
                type="monotone" 
                dataKey="comparisonValue" 
                stroke={getComparisonColor()}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill={`url(#${comparisonGradientId}-area)`}
                name={getComparisonLabel()}
                dot={{ r: 2, strokeWidth: 1, fill: 'white', stroke: getComparisonColor() }}
                activeDot={{ r: 4, strokeWidth: 0, fill: getComparisonColor() }}
                isAnimationActive={animate}
                animationDuration={1200}
                animationBegin={300}
              />
            )}
          </AreaChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Chart header with title and controls - optimized for space efficiency */}
      <div className="flex justify-between items-center py-2 px-3 border-b">
        <div className="flex items-center">
          <h3 className="text-sm font-medium mr-1">{getChartTitle()}</h3>
          
          <TooltipProvider>
            <TooltipUI>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-5 w-5">
                  <Info className="h-3 w-3 text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">
                  {
                    chartType === 'energy' ? 'Total energy delivered in kWh' :
                    chartType === 'revenue' ? 'Total revenue from charging sessions' :
                    chartType === 'sessions' ? 'Number of charging sessions' :
                    chartType === 'users' ? 'Number of active users' :
                    chartType === 'chargers' ? 'Number of active chargers' :
                    'Chart data'
                  }
                </p>
              </TooltipContent>
            </TooltipUI>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Chart type controls - more compact design */}
          <div className="flex p-0.5 bg-gray-100 rounded-md mr-1.5">
            <Button
              variant={chartViewType === 'bar' ? 'default' : 'ghost'}
              size="sm"
              className={`h-5 w-5 p-0 ${chartViewType === 'bar' ? '' : 'text-gray-500'}`}
              onClick={() => onChartViewTypeChange('bar')}
              aria-label="Bar chart"
            >
              <BarChart2 className="h-3 w-3" />
            </Button>
            <Button
              variant={chartViewType === 'line' ? 'default' : 'ghost'}
              size="sm"
              className={`h-5 w-5 p-0 ${chartViewType === 'line' ? '' : 'text-gray-500'}`}
              onClick={() => onChartViewTypeChange('line')}
              aria-label="Line chart"
            >
              <LineChartIcon className="h-3 w-3" />
            </Button>
            <Button
              variant={chartViewType === 'area' ? 'default' : 'ghost'}
              size="sm"
              className={`h-5 w-5 p-0 ${chartViewType === 'area' ? '' : 'text-gray-500'}`}
              onClick={() => onChartViewTypeChange('area')}
              aria-label="Area chart"
            >
              <AreaChartIcon className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Comparison selector - more compact */}
          <Select
            value={comparisonType}
            onValueChange={(value) => onComparisonTypeChange(value as ComparisonType)}
          >
            <SelectTrigger className="h-5 w-24 text-xs border-gray-200">
              <SelectValue placeholder="Compare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">NONE</SelectItem>
              <SelectItem value="previous-period">VS PREV</SelectItem>
              <SelectItem value="same-period-last-year">VS LAST YR</SelectItem>
              <SelectItem value="forecast">VS FORECAST</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main chart area with visualization - reduced padding */}
      <div className="flex-1 px-2 py-1">
        {/* Loading state */}
        {isLoading && (
          <EmptyState 
            type="loading" 
            message="Loading chart data..."
          />
        )}
        
        {/* Error state */}
        {!isLoading && error && (
          <EmptyState 
            type="error" 
            message={error.message || 'Could not load data. Please try again.'}
            onRetry={() => window.location.reload()} 
          />
        )}
        
        {/* Empty state */}
        {isEmpty && (
          <EmptyState 
            type="no-data" 
            chartType="bar"
            message={`No data available for the selected ${timePeriod} view`}
          />
        )}
        
        {/* Chart - reduced height for better visibility without scrolling */}
        {!isLoading && !error && data.length > 0 && (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Chart actions - more compact layout */}
      <div className="flex justify-end gap-1 p-1 border-t">
        {onDownload && (
          <TooltipProvider>
            <TooltipUI>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs text-gray-500 hover:text-gray-900"
                  onClick={onDownload}
                  aria-label="Download data"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Download data
              </TooltipContent>
            </TooltipUI>
          </TooltipProvider>
        )}
        
        {onExpand && (
          <TooltipProvider>
            <TooltipUI>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs text-gray-500 hover:text-gray-900"
                  onClick={onExpand}
                  aria-label="Expand chart"
                >
                  <Maximize className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Expand chart
              </TooltipContent>
            </TooltipUI>
          </TooltipProvider>
        )}
        
        {onExport && (
          <TooltipProvider>
            <TooltipUI>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs text-gray-500 hover:text-gray-900"
                  onClick={onExport}
                  aria-label="Export as image"
                >
                  <Printer className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Export as image
              </TooltipContent>
            </TooltipUI>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default PrimaryChart;
