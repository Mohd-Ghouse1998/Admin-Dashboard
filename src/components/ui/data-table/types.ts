
import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  enableTooltip?: boolean;
  minWidth?: string;
  maxWidth?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: PaginationProps;
  isLoading?: boolean;
  emptyMessage?: string;
  keyField: keyof T | ((row: T) => string);
  className?: string;
  rowClassName?: string | ((row: T) => string);
  onRowClick?: (row: T) => void;
}
