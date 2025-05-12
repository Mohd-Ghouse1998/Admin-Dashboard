
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from '@/lib/utils';

export interface PaginationDetails {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  siblingCount?: number;
}

interface PaginationControlProps extends PaginationDetails {
  onPageChange: (page: number) => void;
  className?: string;
  showPageSizeControl?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  siblingCount = 1,
  onPageChange,
  className,
  showPageSizeControl = false,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange
}: PaginationControlProps) {
  // Calculate range of pages to display
  const range = (start: number, end: number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const renderPageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // 2 siblings on each side + current page + first and last page
    
    // If we have less than total page numbers, we just show all pages
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages).map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8",
            currentPage === page && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {page}
        </Button>
      ));
    }
    
    // Calculate left and right sibling positions
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // Determine whether to show dots
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Always include first and last page
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Build array of page numbers to display
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftRange = range(1, leftSiblingIndex + siblingCount + 1);
      return [
        ...leftRange.map(page => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 w-8",
              currentPage === page && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {page}
          </Button>
        )),
        <Button key="right-dots" variant="ghost" size="sm" className="h-8 w-8" disabled>
          ...
        </Button>,
        <Button
          key={lastPageIndex}
          onClick={() => onPageChange(lastPageIndex)}
          variant={currentPage === lastPageIndex ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8",
            currentPage === lastPageIndex && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {lastPageIndex}
        </Button>
      ];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightRange = range(totalPages - (siblingCount + 2), totalPages);
      return [
        <Button
          key={1}
          onClick={() => onPageChange(1)}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8",
            currentPage === 1 && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          1
        </Button>,
        <Button key="left-dots" variant="ghost" size="sm" className="h-8 w-8" disabled>
          ...
        </Button>,
        ...rightRange.map(page => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 w-8",
              currentPage === page && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {page}
          </Button>
        ))
      ];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [
        <Button
          key={1}
          onClick={() => onPageChange(1)}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8",
            currentPage === 1 && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          1
        </Button>,
        <Button key="left-dots" variant="ghost" size="sm" className="h-8 w-8" disabled>
          ...
        </Button>,
        ...middleRange.map(page => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 w-8",
              currentPage === page && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {page}
          </Button>
        )),
        <Button key="right-dots" variant="ghost" size="sm" className="h-8 w-8" disabled>
          ...
        </Button>,
        <Button
          key={lastPageIndex}
          onClick={() => onPageChange(lastPageIndex)}
          variant={currentPage === lastPageIndex ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8",
            currentPage === lastPageIndex && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {lastPageIndex}
        </Button>
      ];
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="hidden sm:flex items-center gap-1">
          {renderPageNumbers()}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {totalItems !== undefined && (
        <div className="text-sm text-muted-foreground">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </div>
      )}
      
      {showPageSizeControl && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      )}
    </div>
  );
}
