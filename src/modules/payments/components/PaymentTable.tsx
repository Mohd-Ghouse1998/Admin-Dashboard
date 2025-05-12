import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Payment, PaymentFilters } from '@/types/payment.types';
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
import { PaymentBadge } from './PaymentBadge';
import { PaymentFilters as FilterComponent } from './PaymentFilters';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from '@/components/ui/pagination';
import { formatCurrency } from '@/utils/formatters';
import { Loader2, Search, Edit } from 'lucide-react';

export function PaymentTable() {
  const navigate = useNavigate();
  const { getPayments, paymentFilters, setPaymentFilters } = usePayments();
  const { data, isLoading, error } = getPayments();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setPaymentFilters({ ...paymentFilters, search: searchTerm, page: 1 });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (filters: PaymentFilters) => {
    setPaymentFilters(filters);
  };

  const handlePageChange = (page: number) => {
    setPaymentFilters({ ...paymentFilters, page });
  };

  const handleRowClick = (id: string) => {
    navigate(`/payments/${id}`);
  };

  const handleEditClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/payments/${id}/edit`);
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
        <p>Error loading payments: {error.message}</p>
        <Button variant="outline" className="mt-2" onClick={() => getPayments()}>
          Retry
        </Button>
      </div>
    );
  }

  const payments = data?.results || [];
  const currentPage = paymentFilters.page || 1;
  const totalItems = data?.count || 0;
  const pageSize = data?.page_size || 10;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              placeholder="Search payments..."
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
        
        <FilterComponent
          onFilterChange={handleFilterChange}
          currentFilters={paymentFilters}
        />
      </div>

      {payments.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-gray-500">No payments found</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow 
                    key={payment.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(payment.id)}
                  >
                    <TableCell className="font-medium">{payment.transaction_id || 'N/A'}</TableCell>
                    <TableCell>
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{payment.user?.username || 'N/A'}</TableCell>
                    <TableCell>
                      {payment.created_at ? format(new Date(payment.created_at), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <PaymentBadge status={payment.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentBadge method={payment.payment_method} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(payment.id, e)}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Edit</span>
                        <Edit className="h-4 w-4" />
                      </Button>
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
