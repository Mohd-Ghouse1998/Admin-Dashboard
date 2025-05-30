import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  BarChart2, 
  Wallet,
  Zap,
  Users,
  PercentSquare,
} from 'lucide-react';
import { ChartType } from '../Chart';

interface ChartTypeSelectorProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  chartType,
  onChartTypeChange,
}) => {
  return (
    <div className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200 mb-1">
      <h3 className="text-xs font-medium text-gray-700 mb-1">Chart Metrics</h3>
      <div className="flex flex-wrap gap-1">
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-2 transition-all",
            chartType === 'revenue' 
              ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border border-green-200" 
              : "hover:bg-gray-100"
          )}
          onClick={() => onChartTypeChange('revenue')}
        >
          <Wallet className={cn("mr-1 h-3 w-3", chartType === 'revenue' ? "text-green-500" : "text-gray-500")} />
          Revenue
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-2 transition-all",
            chartType === 'energy' 
              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200" 
              : "hover:bg-gray-100"
          )}
          onClick={() => onChartTypeChange('energy')}
        >
          <Zap className={cn("mr-1 h-3 w-3", chartType === 'energy' ? "text-blue-500" : "text-gray-500")} />
          Energy
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-2 transition-all",
            chartType === 'sessions' 
              ? "bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 border border-amber-200" 
              : "hover:bg-gray-100"
          )}
          onClick={() => onChartTypeChange('sessions')}
        >
          <BarChart2 className={cn("mr-1 h-3 w-3", chartType === 'sessions' ? "text-amber-500" : "text-gray-500")} />
          Sessions
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-2 transition-all",
            chartType === 'chargers' 
              ? "bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200" 
              : "hover:bg-gray-100"
          )}
          onClick={() => onChartTypeChange('chargers')}
        >
          <PercentSquare className={cn("mr-1 h-3 w-3", chartType === 'chargers' ? "text-purple-500" : "text-gray-500")} />
          Chargers
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "text-xs h-6 px-2 transition-all",
            chartType === 'users' 
              ? "bg-pink-50 text-pink-700 hover:bg-pink-100 hover:text-pink-800 border border-pink-200" 
              : "hover:bg-gray-100"
          )}
          onClick={() => onChartTypeChange('users')}
        >
          <Users className={cn("mr-1 h-3 w-3", chartType === 'users' ? "text-pink-500" : "text-gray-500")} />
          Users
        </Button>
      </div>
    </div>
  );
};

export default ChartTypeSelector;
