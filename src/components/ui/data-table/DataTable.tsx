
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PaginationControl } from '@/components/ui/pagination-control';
import { cn } from '@/lib/utils';
import { TableSkeleton } from './TableSkeleton';
import { TableEmpty } from './TableEmpty';
import { TableCell } from './TableCell';
import { DataTableProps } from './types';

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
  console.log("DataTable received data:", data);
  console.log("DataTable received columns:", columns);

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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className={cn("rounded-md border", className)}>
          <TableSkeleton columns={columns} rows={5} />
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className={cn("rounded-md border", className)}>
          <TableEmpty columns={columns} message={emptyMessage} />
        </div>
      </div>
    );
  }

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
            {data.map((row, index) => (
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
                    row={row}
                    column={column}
                  />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {pagination && (
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
