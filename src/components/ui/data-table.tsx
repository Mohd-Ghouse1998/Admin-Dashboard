import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PaginationControl } from '@/components/ui/pagination-control';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  enableTooltip?: boolean;
  minWidth?: string;
  maxWidth?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };
  isLoading?: boolean;
  emptyMessage?: string;
  keyField: keyof T | ((row: T) => string);
  className?: string;
  rowClassName?: string | ((row: T) => string);
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pagination,
  isLoading = false,
  emptyMessage = "No data available",
  keyField,
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  // Helper function to get value from a nested path like "user.name"
  const getValueByPath = (obj: T, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj as any);
  };

  console.log("DataTable received data:", data);
  console.log("DataTable received columns:", columns);

  const renderCell = (row: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(row);
    }
    
    const key = column.accessorKey.toString();
    const value = key.includes('.') ? getValueByPath(row, key) : row[key as keyof T];
    const displayValue = value === null || value === undefined ? 'N/A' : value;
    
    // If tooltip is enabled for this column, wrap the content in a tooltip
    if (column.enableTooltip && typeof displayValue === 'string') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{displayValue}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{displayValue}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Otherwise just return the value
    return <div className="truncate">{String(displayValue)}</div>;
  };

  const getRowKey = (row: T, index: number): string => {
    if (typeof keyField === 'function') {
      return keyField(row);
    }
    
    const key = row[keyField];
    return key !== undefined ? String(key) : `row-${index}`;
  };

  const getRowClassNames = (row: T) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row);
    }
    return rowClassName || '';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-60 text-center">
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!data || data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-60 text-center">
            <div className="flex flex-col items-center justify-center p-8">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return data.map((row, index) => (
      <TableRow 
        key={getRowKey(row, index)}
        className={cn(
          getRowClassNames(row),
          onRowClick && "cursor-pointer hover:bg-accent/50"
        )}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
      >
        {columns.map((column, colIndex) => (
          <TableCell 
            key={`cell-${colIndex}`} 
            className={cn("whitespace-nowrap", column.className)}
            style={{ 
              minWidth: column.minWidth,
              maxWidth: column.maxWidth 
            }}
          >
            {renderCell(row, column)}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={`header-${index}`} 
                  className={column.className}
                  style={{ 
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth 
                  }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderContent()}
          </TableBody>
        </Table>
      </div>
      
      {pagination && !isLoading && data && data.length > 0 && (
        <PaginationControl
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          pageSizeOptions={pagination.pageSizeOptions}
          showPageSizeControl={!!pagination.onPageSizeChange}
          className="mt-4"
        />
      )}
    </div>
  );
}
