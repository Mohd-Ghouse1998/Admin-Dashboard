import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { SessionBilling, SessionBillingFilters } from '@/types/payment.types';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePayments } from '@/hooks/usePayments';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from '@/components/ui/pagination';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { Loader2, Search, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function SessionBillingTable() {
  const navigate = useNavigate();
  const { getSessionBillings, sessionBillingFilters, setSessionBillingFilters } = usePayments();
  const { data, isLoading, error } = getSessionBillings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setSessionBillingFilters({ 
      ...sessionBillingFilters, 
      session_id: searchTerm, 
      page: 1 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    setSessionBillingFilters({ ...sessionBillingFilters, page });
  };

  const handleRowClick = (id: string) => {
    navigate(`/session-billings/${id}`);
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>Error loading session billings: {error.message}</p>
        <Button variant="outline" className="mt-2" onClick={() => getSessionBillings()}>
          Retry
        </Button>
      </div>
    );
  }

  const sessionBillings = data?.results || [];
  const currentPage = sessionBillingFilters.page || 1;
  const totalItems = data?.count || 0;
  const pageSize = data?.page_size || 10;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      <Collapsible
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        className="border rounded-md overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <h3 className="text-sm font-medium">Filters</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}
              />
              <span className="sr-only">Toggle filters</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Input
                  placeholder="Search by session ID..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  className="pr-8"
                />
                <Search
                  className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={handleSearch}
                />
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleSearch}
                className="ml-2 hidden sm:flex"
              >
                Search
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {sessionBillings.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-gray-500">No session billings found</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>kWh Consumed</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionBillings.map((billing) => (
                  <TableRow 
                    key={billing.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(billing.id)}
                  >
                    <TableCell className="font-medium">{billing.session_id}</TableCell>
                    <TableCell>
                      {formatCurrency(billing.amount)}
                    </TableCell>
                    <TableCell>
                      {billing.kwh_consumed !== null && billing.kwh_consumed !== undefined 
                        ? `${billing.kwh_consumed.toFixed(2)} kWh` 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatDuration(billing.time_consumed_seconds)}
                    </TableCell>
                    <TableCell>{billing.user?.username || 'N/A'}</TableCell>
                    <TableCell>
                      {billing.created_at ? format(new Date(billing.created_at), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show current page and nearby pages
                  let pageNumber: number;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={pageNumber === currentPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
