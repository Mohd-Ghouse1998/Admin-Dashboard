import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from './skeleton';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  isLoading?: boolean;
  subtitle?: string;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = 'default',
  trend,
  className,
  isLoading = false,
  subtitle,
  description,
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    primary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-300',
    secondary: 'bg-gray-50 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/50',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-300',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300',
    info: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-300',
  };
  
  // Used for default variant text colors
  const defaultText = {
    title: 'text-gray-600 dark:text-gray-400',
    value: 'text-gray-900 dark:text-white',
    subtitle: 'text-gray-500 dark:text-gray-400',
    description: 'text-gray-500 dark:text-gray-400 text-xs'
  };

  if (isLoading) {
    return (
      <div className={cn(
        "rounded-xl border shadow-sm p-6 h-full flex flex-col",
        variantStyles[variant],
        className
      )}>
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border shadow-sm p-6 h-full transition-all duration-200 hover:shadow-md",
      variantStyles[variant],
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={cn(
            "text-sm font-medium",
            variant === 'default' ? defaultText.title : ""
          )}>
            {title}
          </h3>
          
          <div className="mt-2">
            <p className={cn(
              "text-2xl font-bold tracking-tight leading-none",
              variant === 'default' ? defaultText.value : ""
            )}>
              {value}
            </p>
            
            {description && (
              <p className={cn(
                "mt-1 text-xs",
                variant === 'default' ? defaultText.description : ""
              )}>
                {description}
              </p>
            )}
            
            {subtitle && (
              <p className={cn(
                "mt-1 text-sm font-medium",
                variant === 'default' ? defaultText.subtitle : ""
              )}>
                {subtitle}
              </p>
            )}
            
            {trend && (
              <div className="mt-2 flex items-center space-x-1 text-xs">
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
                  {trend.value}% {trend.label || ''}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {icon && (
          <div className={cn(
            "p-2 rounded-lg",
            variant === 'default' ? "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300" : "bg-white/20 dark:bg-black/10"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
