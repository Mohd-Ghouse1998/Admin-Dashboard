import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DataTableEnhancedProps<T> {
  columns: any[];
  data: T[];
  keyField: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  filters?: {
    name: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
}

export function DataTableEnhanced<T>({
  columns,
  data,
  keyField,
  pagination,
  className,
  isLoading = false,
  emptyMessage = "No data available",
  searchPlaceholder = "Search...",
  onSearch,
  searchValue = "",
  filters = [],
}: DataTableEnhancedProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue);

  React.useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    
    // Debounce search
    const handler = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("rounded-lg border overflow-hidden bg-card", className)}>
        <div className="relative w-full overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-9 w-[180px]" />
          </div>
          
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center p-4 border-b last:border-0">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex-1 px-3">
                  <Skeleton className="h-5 w-full max-w-[180px]" />
                </div>
              ))}
              <div className="flex-0 flex justify-end px-3">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
          
          <div className="flex items-center justify-between p-4 border-t">
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-8 w-[180px]" />
          </div>
        </div>
      </div>
    );
  }

  const activeFilters = filters.filter(f => f.value !== "all" && f.value !== "");

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden bg-card shadow-sm", className)}>
      {/* Table header with search and filters */}
      <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9 h-10 w-full sm:w-[260px] text-sm focus-visible:ring-1"
            value={localSearchValue}
            onChange={handleSearch}
          />
          {localSearchValue && (
            <button 
              onClick={() => onSearch?.("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {filters.map((filter) => (
            <div key={filter.name} className="relative">
              <select
                className="pl-9 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="px-4 py-2 border-b bg-muted/30 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {activeFilters.map((filter) => {
            const option = filter.options.find(o => o.value === filter.value);
            return (
              <Badge key={filter.name} className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary">
                {filter.name}: {option?.label}
                <button onClick={() => filter.onChange("all")} className="ml-1 rounded-full hover:bg-primary/20 p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs" 
            onClick={() => filters.forEach(f => f.onChange("all"))}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted/50 [&_tr]:border-b">
            <tr className="border-b transition-colors">
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <th 
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : (
                      <div 
                        className={cn(
                          "flex items-center gap-1",
                          header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </th>
                ))
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.original[keyField as keyof typeof row.original] as string} 
                  className="border-b last:border-0 transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td 
                      key={cell.id} 
                      className="p-4 align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{pagination.currentPage === 1 ? 1 : ((pagination.currentPage - 1) * 10) + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(pagination.currentPage * 10, pagination.totalItems)}
            </span>{" "}
            of <span className="font-medium">{pagination.totalItems}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
