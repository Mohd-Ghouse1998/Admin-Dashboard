import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { 
  Calendar,
  CalendarIcon
} from 'lucide-react';
import { 
  TimePeriod,
  DateRange
} from '../Chart';
import { cn } from '@/lib/utils';

interface DateFilterSelectorProps {
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  dateRange: { from: Date | null; to: Date | null };
  onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
}

export const DateFilterSelector: React.FC<DateFilterSelectorProps> = ({
  timePeriod,
  onTimePeriodChange,
  dateRange,
  onDateRangeChange,
}) => {
  // Helper function to handle from date selection
  const handleFromDateSelect = (date: Date | undefined) => {
    onDateRangeChange({
      ...dateRange,
      from: date || null,
    });
  };

  // Helper function to handle to date selection
  const handleToDateSelect = (date: Date | undefined) => {
    onDateRangeChange({
      ...dateRange,
      to: date || null,
    });
  };

  return (
    <div className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200 mb-1">
      <h3 className="text-xs font-medium text-gray-700 mb-1">Time Period</h3>
      <div className="flex flex-wrap items-center gap-0.5 bg-gray-100 p-0.5 rounded-md">
        <Calendar className="h-3 w-3 text-gray-500 mx-0.5" />
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-1.5 rounded-sm",
            timePeriod === 'daily' && "bg-white shadow-sm"
          )}
          onClick={() => onTimePeriodChange('daily')}
        >
          D
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-1.5 rounded-sm",
            timePeriod === 'weekly' && "bg-white shadow-sm"
          )}
          onClick={() => onTimePeriodChange('weekly')}
        >
          W
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-1.5 rounded-sm",
            timePeriod === 'monthly' && "bg-white shadow-sm"
          )}
          onClick={() => onTimePeriodChange('monthly')}
        >
          M
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-1.5 rounded-sm",
            timePeriod === 'quarterly' && "bg-white shadow-sm"
          )}
          onClick={() => onTimePeriodChange('quarterly')}
        >
          Q
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-1.5 rounded-sm",
            timePeriod === 'yearly' && "bg-white shadow-sm"
          )}
          onClick={() => onTimePeriodChange('yearly')}
        >
          Y
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-1.5 rounded-sm",
            timePeriod === 'custom' && "bg-white shadow-sm"
          )}
          onClick={() => onTimePeriodChange('custom')}
        >
          C
        </Button>
      </div>
      
      {timePeriod === 'custom' && (
        <div className="flex space-x-1 mt-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-6 px-1.5 justify-start text-left text-xs bg-white",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {dateRange.from ? (
                  format(dateRange.from, "MM/dd")
                ) : (
                  <span>From</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateRange.from || undefined}
                onSelect={handleFromDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-6 px-1.5 justify-start text-left text-xs bg-white",
                  !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {dateRange.to ? (
                  format(dateRange.to, "MM/dd")
                ) : (
                  <span>To</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateRange.to || undefined}
                onSelect={handleToDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default DateFilterSelector;
