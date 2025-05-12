
import React from 'react';
import { cn } from '@/lib/utils';

interface ColumnConfig {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface GridProps {
  children: React.ReactNode;
  columns?: number | ColumnConfig;
  gap?: number;
  className?: string;
}

export function Grid({ children, columns = 1, gap = 4, className }: GridProps) {
  // For simple numeric columns
  if (typeof columns === 'number') {
    return (
      <div
        className={cn(
          `grid gap-${gap}`,
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 md:grid-cols-2',
          columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          className
        )}
      >
        {children}
      </div>
    );
  }

  // For responsive column configuration
  const { sm = 1, md, lg, xl } = columns;
  
  return (
    <div
      className={cn(
        `grid gap-${gap}`,
        `grid-cols-${sm}`,
        md && `md:grid-cols-${md}`,
        lg && `lg:grid-cols-${lg}`,
        xl && `xl:grid-cols-${xl}`,
        className
      )}
    >
      {children}
    </div>
  );
}

export default Grid;
