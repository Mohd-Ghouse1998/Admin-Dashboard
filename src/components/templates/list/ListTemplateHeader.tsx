import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListTemplateHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  createPath?: string;
  createButtonText: string;
  onCreateClick?: () => void;
  className?: string;
}

export function ListTemplateHeader({
  title,
  description,
  icon,
  createPath,
  createButtonText,
  onCreateClick,
  className,
}: ListTemplateHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-primary h-8 w-8 flex items-center justify-center">
            {icon}
          </div>
        )}
        
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            {title}
          </h1>
          {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {createPath ? (
          <Button size="sm" className="h-9 rounded-md bg-primary hover:bg-primary/90">
            <Link to={createPath} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              {createButtonText}
            </Link>
          </Button>
        ) : onCreateClick ? (
          <Button size="sm" className="h-9 rounded-md bg-primary hover:bg-primary/90" onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-1.5" />
            {createButtonText}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
