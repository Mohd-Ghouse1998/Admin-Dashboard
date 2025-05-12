
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Column } from './types';

interface TableEmptyProps<T> {
  columns: Column<T>[];
  message: string;
}

export function TableEmpty<T>({ columns, message }: TableEmptyProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead 
              key={`empty-header-${index}`} 
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
        <TableRow>
          <TableCell colSpan={columns.length} className="h-60 text-center">
            <div className="flex flex-col items-center justify-center p-8">
              <p className="text-muted-foreground">{message}</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
