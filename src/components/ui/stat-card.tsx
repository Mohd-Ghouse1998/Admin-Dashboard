
import React from 'react';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from './skeleton';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  isLoading?: boolean; // Added isLoading prop
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = 'default',
  trend,
  className,
  isLoading = false, // Default to false
}) => {
  const variantStyles = {
    default: 'bg-card text-card-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-50 border-green-200 text-green-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  if (isLoading) {
    return (
      <Card className={cn(variantStyles[variant], 'border', className)}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(variantStyles[variant], 'border', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <h2 className="text-3xl font-bold mt-2">{value}</h2>
            
            {trend && (
              <div className="flex items-center mt-2">
                <div className={`mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <p className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.value}%
                </p>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="p-3 bg-background/10 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
