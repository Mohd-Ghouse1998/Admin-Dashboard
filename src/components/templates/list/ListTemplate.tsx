import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Plus, AlertCircle, ChevronDown, Calendar, Filter, Download, Settings, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListTemplateHeader } from './ListTemplateHeader';

export interface Column<T> {
  header: string;
  key?: keyof T;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string;
}

export interface ListTemplateProps<T> {
  // Page metadata
  title: string;
  description?: string;
  icon?: ReactNode;
  
  // Data props
  data: T[];
  isLoading?: boolean;
  error?: Error | string | null;
  totalItems?: number;
  emptyState?: ReactNode;
  
  // Search props
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  
  // Filtering props
  filterComponent?: ReactNode;
  
  // Columns and rendering
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  rowActions?: (item: T) => ReactNode;
  
  // Selection
  selectedItems?: T[];
  onSelectItems?: (items: T[]) => void;
  selectable?: boolean;
  
  // Create entity options
  createPath?: string;
  createButtonText?: string;
  onCreateClick?: () => void;
  
  // Pagination options
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  
  // Export options
  onExport?: () => void;
  
  // Classes
  className?: string;
  actionBarClassName?: string;
  tableClassName?: string;
}

export function ListTemplate<T extends { id?: string | number }>({ 
  // Page metadata
  title,
  description,
  icon,
  
  // Data props
  data = [],
  isLoading = false,
  error,
  totalItems = 0,
  emptyState,
  
  // Search props
  searchQuery = '',
  onSearchChange,
  searchPlaceholder,
  
  // Filtering props
  filterComponent,
  
  // Columns and rendering
  columns = [],
  onRowClick,
  rowActions,
  
  // Selection
  selectedItems = [],
  onSelectItems,
  selectable = false,
  
  // Create entity options
  createPath,
  createButtonText,
  onCreateClick,
  
  // Pagination options
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  
  // Export options
  onExport,
  
  // Classes
  className,
  actionBarClassName,
  tableClassName,
}: ListTemplateProps<T>) {
  // Default values
  const finalCreateButtonText = createButtonText || `New ${title.endsWith('s') ? title.slice(0, -1) : title}`;
  const finalSearchPlaceholder = searchPlaceholder || `Search ${title.toLowerCase()}...`;

  // Helper function for getting status style
  const getStatusStyle = (status?: string) => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
      case 'in progress':
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'warning':
      case 'attention':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'inactive':
      case 'offline':
      case 'disabled':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'error':
      case 'rejected':
      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Toggle row selection
  const toggleRowSelection = (item: T) => {
    if (!onSelectItems) return;
    
    const itemId = (item as any).id;
    const isSelected = selectedItems.some((selectedItem) => (selectedItem as any).id === itemId);
    
    if (isSelected) {
      onSelectItems(selectedItems.filter((selectedItem) => (selectedItem as any).id !== itemId));
    } else {
      onSelectItems([...selectedItems, item]);
    }
  };

  // Toggle all rows selection
  const toggleAllSelection = () => {
    if (!onSelectItems) return;
    
    if (selectedItems.length === data.length) {
      onSelectItems([]);
    } else {
      onSelectItems([...data]);
    }
  };

  // Render cell content based on column configuration
  const renderCell = (item: T, column: Column<T>): ReactNode => {
    // If render function is provided, use it
    if (column.render) {
      return column.render(item);
    }
    
    // Otherwise use the key to extract data
    if (column.key) {
      const value = item[column.key];
      
      // Handle different types of values
      if (value === null || value === undefined) {
        return '-';
      }
      
      if (typeof value === 'boolean') {
        return value ? 
          <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium px-2 py-1 rounded-full">
            Yes
          </Badge> : 
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium px-2 py-1 rounded-full">
            No
          </Badge>;
      }
      
      if (typeof value === 'string' && value.toLowerCase() === 'active') {
        return <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium px-2 py-1 rounded-full">Active</Badge>;
      }
      
      if (typeof value === 'string' && value.toLowerCase() === 'inactive') {
        return <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium px-2 py-1 rounded-full">Inactive</Badge>;
      }
      
      // Status badges for common status values
      if (typeof value === 'string' && ['active', 'inactive', 'pending', 'approved', 'rejected'].includes(value.toLowerCase())) {
        return (
          <Badge className={cn(getStatusStyle(value), "font-medium px-2 py-1 rounded-full border") }>
            {value}
          </Badge>
        );
      }
      
      return value as ReactNode;
    }
    
    return null;
  };

  // Default empty state
  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-primary/10 p-3 mb-3">
        <Search className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">No {title.toLowerCase()} found</h3>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        {searchQuery 
          ? `No ${title.toLowerCase()} found for "${searchQuery}". Try adjusting your search.` 
          : `There are no ${title.toLowerCase()} available. Create one to get started.`
        }
      </p>
      {createPath && !searchQuery && (
        <Button asChild className="mt-4">
          <Link to={createPath}>
            <Plus className="mr-2 h-4 w-4" />
            {finalCreateButtonText}
          </Link>
        </Button>
      )}
      {onCreateClick && !searchQuery && (
        <Button onClick={onCreateClick} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          {finalCreateButtonText}
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn("container space-y-6 py-6 font-sans !font-inter !text-gray-900 bg-[#FAFBFC]", className)} style={{ fontFamily: 'Inter, Poppins, Roboto, sans-serif' }}>
      <Helmet>
        <title>{title} | Admin Dashboard</title>
      </Helmet>

      <div className="space-y-4">
        {/* Page header with title and create button */}
        <ListTemplateHeader 
          title={title}
          description={description}
          icon={icon}
          createPath={createPath}
          createButtonText={finalCreateButtonText}
          onCreateClick={onCreateClick}
        />
        
        {/* Action bar with search and filters */}
        <div className={cn("flex flex-col sm:flex-row gap-3 pb-4", actionBarClassName)}>
          <div className="relative">
            {onSearchChange && (
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="search"
                  placeholder={finalSearchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 h-9 w-full"
                />
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Filters */}
            {filterComponent && (
              <div className="relative w-full sm:max-w-xs flex items-center">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <div className="pl-9 h-9 w-full">
                  {filterComponent}
                </div>
              </div>
            )}
            
            {/* Export button if provided */}
            {onExport && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onExport}
                className="h-9"
              >
                <Download className="h-4 w-4 mr-2" /> 
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Selected count badge */}
      {selectable && selectedItems.length > 0 && (
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-md text-sm mb-4 flex items-center justify-between">
          <span>
            <strong>{selectedItems.length}</strong> {selectedItems.length === 1 ? 'item' : 'items'} selected
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onSelectItems?.([])}>
            Clear selection
          </Button>
        </div>
      )}

      {/* Main content card with table */}
      <Card className={cn("overflow-hidden border rounded-lg shadow-sm", tableClassName)}>
        <CardContent className="p-0">
          {/* Error state */}
          {error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : String(error)}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className={cn("min-w-full divide-y divide-gray-100", tableClassName)}>
                {data.length > 0 && (
                  <thead>
                    <tr>
                      {/* Checkbox column for selectable tables */}
                      {selectable && (
                        <th scope="col" className="relative w-12 px-4 py-3.5 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/25"
                            checked={data.length > 0 && selectedItems.length === data.length}
                            onChange={toggleAllSelection}
                          />
                        </th>
                      )}

                      {/* Column headers */}
                      {columns.map((column, idx) => (
                        <th
                          key={idx}
                          scope="col"
                          className={cn(
                            "px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-700 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10",
                            column.align === 'center' && "text-center",
                            column.align === 'right' && "text-right"
                          )}
                        >
                          {column.sortable ? (
                            <button className="group inline-flex items-center gap-1">
                              {column.header}
                              <ArrowUpDown className="h-4 w-4 text-primary/60 group-hover:text-primary" />
                            </button>
                          ) : (
                            column.header
                          )}
                        </th>
                      ))}

                      {/* Actions column header */}
                      {rowActions && (
                        <th scope="col" className="relative px-4 py-3.5 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                )}
                
                {/* Loading state */}
                {isLoading ? (
                  <tbody>
                    <tr>
                      <td 
                        colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} 
                        className="text-center py-20"
                      >
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                ) : !data || data.length === 0 ? (
                  <tbody>
                    <tr>
                      <td 
                        colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                        className="text-center py-10"
                      >
                        {emptyState || defaultEmptyState}
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={(item as any).id || index}
                        className={cn(
                          onRowClick && "cursor-pointer hover:bg-gray-50/80",
                          "border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        )}
                        onClick={() => onRowClick && onRowClick(item)}
                      >
                        {/* Selectable checkbox */}
                        {selectable && (
                          <td 
                            className="w-12 px-4 py-3 whitespace-nowrap" 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click when clicking checkbox
                              toggleRowSelection(item);
                            }}
                          >
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-primary focus:ring-primary/25 transition-all duration-200"
                              checked={selectedItems.some((selectedItem) => 
                                (selectedItem as any).id === (item as any).id
                              )}
                              onChange={() => toggleRowSelection(item)}
                            />
                          </td>
                        )}
                        {columns.map((column, colIdx) => (
                          <td
                            key={colIdx}
                            className={cn(
                              "px-4 py-3 text-sm text-gray-800",
                              column.align === 'center' && "text-center",
                              column.align === 'right' && "text-right"
                            )}
                          >
                            {renderCell(item, column)}
                          </td>
                        ))}
                        {/* Actions column */}
                        {rowActions && (
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            {rowActions(item)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
              
              <div className="mt-6 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="text-sm text-gray-500 font-medium">
                  Showing page {currentPage} of {totalPages} • {totalItems} total items
                </div>
                
                <div className="flex items-center gap-2 border rounded-md px-2 py-1 h-9">
                  <Button 
                    variant="ghost"
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className="h-7 px-2 text-sm"
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="hidden sm:flex items-center border-l border-r px-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-7 w-7 p-0 text-sm",
                            currentPage === pageNum && "bg-primary text-white pointer-events-none"
                          )}
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="h-7 px-2 text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
