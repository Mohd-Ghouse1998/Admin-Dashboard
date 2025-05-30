import React, { ReactNode, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  iconColor = "bg-blue-50 text-blue-500",
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="will-change-transform"
    >
      <Card 
        className={cn(
          "border border-primary/5 shadow-sm transition-all duration-200", 
          isHovered ? "shadow-md shadow-primary/5" : "shadow-sm",
          "bg-gradient-to-br from-white to-primary/5",
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className={cn("p-2 rounded-full transition-all duration-300", 
              iconColor,
              isHovered ? "shadow-sm scale-110" : ""
            )}>
              {icon}
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <div className={cn(
                "text-2xl font-bold transition-all duration-300",
                isHovered ? "text-primary" : ""
              )}>
                {value}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            
            {trend && (
              <motion.div 
                initial={{ opacity: 0.9 }}
                animate={{ opacity: isHovered ? 1 : 0.9 }}
                className={cn(
                  "text-xs font-medium rounded-full px-2 py-1 shadow-sm",
                  trend.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
