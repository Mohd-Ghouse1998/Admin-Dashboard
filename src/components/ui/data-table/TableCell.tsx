
import React from 'react';
import { cn } from '@/lib/utils';
import { TableCell as ShadcnTableCell } from '@/components/ui/table';
import { Column } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TableCellProps<T> {
  row: T;
  column: Column<T>;
}

export function TableCell<T extends Record<string, any>>({ row, column }: TableCellProps<T>) {
  // Helper function to get value from a nested path like "user.name"
  const getValueByPath = (obj: T, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj as any);
  };
  
  const renderCellContent = () => {
    if (column.cell) {
      return column.cell(row);
    }
    
    const key = column.accessorKey.toString();
    const value = key.includes('.') ? getValueByPath(row, key) : row[key as keyof T];
    const displayValue = value === null || value === undefined ? 'N/A' : value;
    
    return <div className="truncate">{String(displayValue)}</div>;
  };
  
  // If tooltip is enabled for this column, wrap content in a tooltip
  if (column.enableTooltip) {
    return (
      <ShadcnTableCell 
        className={cn("whitespace-nowrap", column.className)}
        style={{ 
          minWidth: column.minWidth,
          maxWidth: column.maxWidth 
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{renderCellContent()}</div>
            </TooltipTrigger>
            <TooltipContent>
              {column.cell ? column.cell(row) : 
                (row[column.accessorKey as keyof T]?.toString() || 'N/A')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ShadcnTableCell>
    );
  }
  
  return (
    <ShadcnTableCell 
      className={cn("whitespace-nowrap", column.className)}
      style={{ 
        minWidth: column.minWidth,
        maxWidth: column.maxWidth 
      }}
    >
      {renderCellContent()}
    </ShadcnTableCell>
  );
}
