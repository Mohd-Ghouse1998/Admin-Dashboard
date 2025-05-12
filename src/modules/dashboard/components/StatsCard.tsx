
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <h4 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
              {value}
            </h4>
            {trend && (
              <div className="flex items-center mt-2">
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
                {trend.label && (
                  <span className="text-xs text-gray-500 ml-2">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary-600/10 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
