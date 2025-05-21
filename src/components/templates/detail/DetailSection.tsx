import React, { ReactNode, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Edit, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  onEdit?: () => void;
  editPath?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  };
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  description,
  children,
  icon,
  collapsible = false,
  defaultCollapsed = false,
  className,
  onEdit,
  editPath,
  actionIcon,
  onAction,
  actionLabel,
  badge,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  return (
    <Card className={cn("overflow-hidden border border-primary/10 shadow-sm", className)}>
      {/* Header with light gray background */}
      <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-primary/10">
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary h-5 w-5">{icon}</span>}
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-medium text-gray-800">{title}</h3>
              
              {badge && (
                <Badge 
                  variant={badge.variant || "default"} 
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium", 
                    badge.variant === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                  )}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {editPath && (
            <Button 
              asChild 
              variant="outline"
              size="sm" 
              className="h-8 px-3 font-medium bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-700 border-blue-200 hover:border-blue-300 transition-all"
            >
              <Link to={editPath} className="flex items-center">
                <Edit className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                Edit
              </Link>
            </Button>
          )}
          
          {onEdit && (
            <Button 
              variant="outline"
              size="sm" 
              onClick={onEdit}
              className="h-8 px-3 font-medium bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-700 border-blue-200 hover:border-blue-300 transition-all"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
              Edit
            </Button>
          )}
          
          {onAction && (
            <Button 
              variant="outline"
              size="sm" 
              onClick={onAction}
              className="h-8 px-3 font-medium bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-700 border-blue-200 hover:border-blue-300 transition-all"
            >
              {actionIcon && <span className="mr-1.5 text-blue-600">{actionIcon}</span>}
              {actionLabel || 'Action'}
            </Button>
          )}
          
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                collapsed ? "" : "transform rotate-180"
              )} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {!collapsed && (
        <div className="p-5 bg-white">
          {children}
        </div>
      )}
    </Card>
  );
};
