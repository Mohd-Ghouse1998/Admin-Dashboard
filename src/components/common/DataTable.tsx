
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export interface Column<T> {
  header: string;
  accessorKey?: string;  // Made accessorKey optional
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  viewRoute?: string;
  editRoute?: string;
  deleteAction?: (id: string | number) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  extraActions?: (row: T) => React.ReactNode[];
  noDataMessage?: string;
  idAccessor?: keyof T;
  keyField?: string;
  emptyMessage?: string;
  rowClassName?: string;
  onRowClick?: (row: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading = false,
  viewRoute,
  editRoute,
  deleteAction,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  extraActions,
  noDataMessage = "No data available",
  idAccessor = 'id' as keyof T,
  keyField = 'id',
  emptyMessage = "No data found",
  rowClassName,
  onRowClick,
  pagination
}: DataTableProps<T>) {
  
  const renderValue = (row: T, accessorKey?: string) => {
    // If no accessorKey provided, return empty string
    if (!accessorKey) return '';
    
    // Handle nested properties
    const keys = accessorKey.split('.');
    let value = row as any;
    
    for (const key of keys) {
      if (value === null || value === undefined) return '';
      value = value[key];
    }
    
    // Return formatted values based on type
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    return value;
  };
  
  const getId = (row: T): string | number => {
    return (row[idAccessor] as unknown) as string | number || '';
  };

  // Use pagination if provided, otherwise use direct props
  const paginationCurrentPage = pagination?.currentPage || currentPage;
  const paginationTotalPages = pagination?.totalPages || totalPages;
  const paginationOnPageChange = pagination?.onPageChange || onPageChange;

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
              {(viewRoute || editRoute || deleteAction) && (
                <TableHead>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
                {(viewRoute || editRoute || deleteAction) && (
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  // No data state
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-gray-500">{emptyMessage || noDataMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {(viewRoute || editRoute || deleteAction || extraActions) && (
                <TableHead className="w-24">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: any, rowIndex) => (
              <TableRow 
                key={row[keyField] || rowIndex} 
                className={rowClassName}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {column.cell 
                      ? column.cell(row)
                      : renderValue(row, column.accessorKey)
                    }
                  </TableCell>
                ))}
                
                {(viewRoute || editRoute || deleteAction || extraActions) && (
                  <TableCell className="space-x-1">
                    {viewRoute && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`${viewRoute}/${getId(row)}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    
                    {editRoute && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`${editRoute}/${getId(row)}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    
                    {deleteAction && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteAction(getId(row))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {extraActions && extraActions(row).length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {extraActions(row).map((action, index) => (
                            <React.Fragment key={index}>
                              {action}
                              {index < extraActions(row).length - 1 && <DropdownMenuSeparator />}
                            </React.Fragment>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {paginationTotalPages > 1 && paginationOnPageChange && (
        <div className="flex items-center justify-center mt-4 space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => paginationOnPageChange(1)} 
            disabled={paginationCurrentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => paginationOnPageChange(paginationCurrentPage - 1)} 
            disabled={paginationCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm mx-2">
            Page {paginationCurrentPage} of {paginationTotalPages}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => paginationOnPageChange(paginationCurrentPage + 1)} 
            disabled={paginationCurrentPage === paginationTotalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => paginationOnPageChange(paginationTotalPages)} 
            disabled={paginationCurrentPage === paginationTotalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}

export default DataTable;
