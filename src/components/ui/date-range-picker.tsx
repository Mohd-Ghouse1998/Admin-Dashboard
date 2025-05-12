import * as React from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  align?: "center" | "start" | "end";
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  dateRange,
  onSelect,
  align = "start",
  className,
  placeholder = "Select date range"
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onSelect}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function predefinedDateRanges() {
  const today = new Date();
  
  return [
    {
      name: "Today",
      range: {
        from: today,
        to: today
      }
    },
    {
      name: "Yesterday",
      range: {
        from: addDays(today, -1),
        to: addDays(today, -1)
      }
    },
    {
      name: "Last 7 days",
      range: {
        from: addDays(today, -6),
        to: today
      }
    },
    {
      name: "Last 30 days",
      range: {
        from: addDays(today, -29),
        to: today
      }
    },
    {
      name: "This month",
      range: {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0)
      }
    },
    {
      name: "Last month",
      range: {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0)
      }
    }
  ];
}
