import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  ChevronRight
} from 'lucide-react';
import { Skeleton } from './skeleton';
import { Badge } from './badge';

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  status?: 'success' | 'pending' | 'error' | 'warning';
  statusText?: string;
  icon?: React.ReactNode;
  url?: string;
}

interface ActivityCardProps {
  title: string;
  activities: ActivityItem[];
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  viewAllUrl?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  onClickItem?: (activity: ActivityItem) => void;
  maxItems?: number;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  activities,
  className,
  isLoading = false,
  emptyMessage = "No recent activities",
  viewAllUrl,
  viewAllLabel = "View all",
  onViewAll,
  onClickItem,
  maxItems = 5
}) => {
  // Status icons mapping
  const statusIcons = {
    success: <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />,
    pending: <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
    error: <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
  };

  // Badge variants mapping
  const badgeVariants = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };

  if (isLoading) {
    return (
      <div className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden",
        className
      )}>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-3 w-[60%]" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={cn(
      "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md",
      className
    )}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        {(viewAllUrl || onViewAll) && (
          <a 
            href={viewAllUrl} 
            onClick={(e) => {
              if (onViewAll) {
                e.preventDefault();
                onViewAll();
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
          >
            {viewAllLabel}
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </a>
        )}
      </div>

      {displayActivities.length > 0 ? (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {displayActivities.map((activity) => (
            <div 
              key={activity.id}
              className={cn(
                "px-5 py-4 flex items-start gap-3",
                activity.url || onClickItem ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80" : ""
              )}
              onClick={() => {
                if (onClickItem) onClickItem(activity);
                else if (activity.url) window.location.href = activity.url;
              }}
            >
              <div className="mt-0.5 flex-shrink-0">
                {activity.icon || (activity.status ? statusIcons[activity.status] : null)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  {activity.time}
                </p>
              </div>
              
              {activity.statusText && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "h-6 text-xs font-medium whitespace-nowrap",
                    activity.status && badgeVariants[activity.status]
                  )}
                >
                  {activity.statusText}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
