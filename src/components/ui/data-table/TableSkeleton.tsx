
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Column } from './types';

interface TableSkeletonProps<T> {
  columns: Column<T>[];
  rows?: number;
}

export function TableSkeleton<T>({ columns, rows = 5 }: TableSkeletonProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead 
              key={`skeleton-header-${index}`} 
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
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`skeleton-row-${rowIndex}`}>
            {columns.map((column, colIndex) => (
              <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                <Skeleton className="h-5 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
