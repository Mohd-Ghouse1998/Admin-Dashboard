import React from 'react';
import { 
  BarChart2, 
  PieChart, 
  AlertCircle, 
  FileSpreadsheet,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyStateType = 'loading' | 'error' | 'no-data' | 'no-access';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  chartType?: 'bar' | 'pie' | 'table';
  onRetry?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  icon,
  chartType = 'bar',
  onRetry,
  className = ''
}) => {
  // Determine icon to show based on type and chart type
  const getIcon = () => {
    if (icon) return icon;
    
    if (type === 'loading') {
      return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
    } else if (type === 'error') {
      return <AlertCircle className="h-8 w-8 text-red-400" />;
    } else if (type === 'no-data') {
      if (chartType === 'bar') {
        return <BarChart2 className="h-8 w-8 text-gray-300" />;
      } else if (chartType === 'pie') {
        return <PieChart className="h-8 w-8 text-gray-300" />;
      } else {
        return <FileSpreadsheet className="h-8 w-8 text-gray-300" />;
      }
    } else if (type === 'no-access') {
      return <AlertCircle className="h-8 w-8 text-amber-400" />;
    }
    
    return <BarChart2 className="h-8 w-8 text-gray-300" />;
  };
  
  // Determine default title based on type
  const getTitle = () => {
    if (title) return title;
    
    if (type === 'loading') {
      return 'Loading data...';
    } else if (type === 'error') {
      return 'Error loading data';
    } else if (type === 'no-data') {
      return 'No data available';
    } else if (type === 'no-access') {
      return 'Access denied';
    }
    
    return 'No data available';
  };
  
  // Determine default message based on type
  const getMessage = () => {
    if (message) return message;
    
    if (type === 'loading') {
      return 'Please wait while we load your data';
    } else if (type === 'error') {
      return 'There was an error loading your data. Please try again.';
    } else if (type === 'no-data') {
      return 'No data is available for the selected filters.';
    } else if (type === 'no-access') {
      return 'You don\'t have permission to view this data.';
    }
    
    return '';
  };
  
  return (
    <div className={`flex flex-col items-center justify-center h-full p-4 text-center ${className}`}>
      <div className="mb-2">{getIcon()}</div>
      <p className="text-sm font-medium mb-1">{getTitle()}</p>
      <p className="text-xs text-gray-500 mb-3 max-w-xs">{getMessage()}</p>
      
      {type === 'error' && onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs flex items-center gap-1"
          onClick={onRetry}
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  );
};
