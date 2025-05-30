import React from 'react';
import { 
  ChartType, 
  TimePeriod, 
  DateRange
} from '../Chart';
import { ChartTypeSelector } from './ChartTypeSelector';
import { DateFilterSelector } from './DateFilterSelector';

interface AnalyticsControlPanelProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  dateRange: { from: Date | null; to: Date | null };
  onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
}

export const AnalyticsControlPanel: React.FC<AnalyticsControlPanelProps> = ({
  chartType,
  onChartTypeChange,
  timePeriod,
  onTimePeriodChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
      {/* Chart Type Selector */}
      <div className="md:w-3/5">
        <ChartTypeSelector 
          chartType={chartType}
          onChartTypeChange={onChartTypeChange}
        />
      </div>
      
      {/* Date Filter */}
      <div className="md:w-2/5">
        <DateFilterSelector 
          timePeriod={timePeriod}
          onTimePeriodChange={onTimePeriodChange}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
        />
      </div>
    </div>
  );
};
