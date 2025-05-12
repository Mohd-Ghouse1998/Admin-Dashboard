
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UnfoldTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[]
  columns: {
    key: string
    header: string
    cell?: (row: T) => React.ReactNode
    className?: string
  }[]
  isLoading?: boolean
  emptyMessage?: string
  rowClassName?: string | ((row: T, index: number) => string)
  onRowClick?: (row: T) => void
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems?: number
    pageSize?: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    pageSizeOptions?: number[]
  }
}

const UnfoldTable = <T extends Record<string, any>>({
  className,
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found",
  rowClassName,
  onRowClick,
  pagination,
  ...props
}: UnfoldTableProps<T>) => {
  const getColumnValue = (row: T, key: string) => {
    // Handle nested object paths like "user.name"
    if (key.includes('.')) {
      return key.split('.').reduce((o, i) => o?.[i], row as any);
    }
    return row[key as keyof T];
  };

  const getRowClasses = (row: T, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    return rowClassName || '';
  };

  return (
    <div 
      className={cn("bg-card rounded-lg border border-border overflow-hidden", className)} 
      {...props}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((column, i) => (
                <th 
                  key={i} 
                  className={cn(
                    "text-left py-3 px-4 font-medium text-muted-foreground",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    onRowClick && "cursor-pointer",
                    getRowClasses(row, rowIndex)
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={cn("py-3 px-4", column.className)}>
                      {column.cell ? 
                        column.cell(row) : 
                        (getColumnValue(row, column.key) ?? 'N/A')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && !isLoading && data.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/50">
          <div className="text-sm text-muted-foreground">
            {pagination.totalItems !== undefined && (
              <span>
                Showing {(pagination.currentPage - 1) * (pagination.pageSize || 10) + 1} to{' '}
                {Math.min(pagination.currentPage * (pagination.pageSize || 10), pagination.totalItems)} of{' '}
                {pagination.totalItems} entries
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {pagination.onPageSizeChange && pagination.pageSizeOptions && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={String(pagination.pageSize || 10)}
                  onValueChange={(value) => pagination.onPageSizeChange?.(Number(value))}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    {pagination.pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.currentPage <= 1}
                className="h-8 w-8 p-0"
                aria-label="Go to first page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="h-8 w-8 p-0"
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-sm mx-2">
                <span className="font-medium">{pagination.currentPage}</span>
                <span className="mx-1">/</span>
                <span>{pagination.totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="h-8 w-8 p-0"
                aria-label="Go to next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="h-8 w-8 p-0"
                aria-label="Go to last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

UnfoldTable.displayName = "UnfoldTable"

export { UnfoldTable }
