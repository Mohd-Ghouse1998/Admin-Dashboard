import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { 
  Eye, 
  Plus, 
  FileText, 
  Send, 
  Download,
  FileDown
} from 'lucide-react';
import { 
  getInvoices, 
  Invoice, 
  InvoiceListResponse,
  InvoiceFilters,
  markInvoiceAsSent,
  generateInvoicePdf
} from '@/services/api/invoicesApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, dateRange, searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    
    const filters: InvoiceFilters = {
      page: currentPage,
      pageSize: pageSize,
      search: searchTerm || undefined,
      status: statusFilter,
    };
    
    if (dateRange.from) {
      filters.startDate = format(dateRange.from, 'yyyy-MM-dd');
    }
    
    if (dateRange.to) {
      filters.endDate = format(dateRange.to, 'yyyy-MM-dd');
    }
    
    try {
      const response = await getInvoices(filters);
      const data = response.data as InvoiceListResponse;
      
      setInvoices(data.results);
      setTotalInvoices(data.count);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    
    switch (status) {
      case 'paid':
        variant = 'success';
        break;
      case 'sent':
        variant = 'secondary';
        break;
      case 'draft':
        variant = 'outline';
        break;
      case 'overdue':
        variant = 'destructive';
        break;
      case 'cancelled':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const handleMarkAsSent = async (id: number) => {
    try {
      await markInvoiceAsSent(id);
      toast({
        title: 'Success',
        description: 'Invoice marked as sent',
        variant: 'success',
      });
      fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Failed to mark invoice as sent:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark invoice as sent',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      const response = await generateInvoicePdf(id);
      
      // Create a blob from the PDF stream
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Invoice PDF downloaded',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to download invoice PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download invoice PDF',
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice #',
      accessorKey: 'invoice_number',
      cell: (info: any) => info.row.original.invoice_number
    },
    {
      header: 'Customer',
      accessorKey: 'user_name',
      cell: (info: any) => info.row.original.user_name
    },
    {
      header: 'Amount',
      accessorKey: 'total_amount',
      cell: (info: any) => formatCurrency(info.row.original.total_amount)
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => getStatusBadge(info.row.original.status)
    },
    {
      header: 'Issue Date',
      accessorKey: 'issue_date',
      cell: (info: any) => formatDate(info.row.original.issue_date)
    },
    {
      header: 'Due Date',
      accessorKey: 'due_date',
      cell: (info: any) => formatDate(info.row.original.due_date)
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (info: any) => {
        const invoice = info.row.original;
        const id = invoice.id;
        
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/payment/invoices/${id}`)}
              title="View Invoice"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FileDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadPdf(id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </DropdownMenuItem>
                {invoice.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleMarkAsSent(id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Mark as Sent
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate(`/payment/invoices/${id}/edit`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Invoice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  return (
    <PageLayout
      title="Invoices"
      description="View and manage all invoices"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Invoices', url: '/payment/invoices' }
      ]}
      actions={
        <Button onClick={() => navigate('/payment/invoices/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      }
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by invoice number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <DateRangePicker
          dateRange={dateRange}
          onSelect={setDateRange}
          align="end"
          placeholder="Filter by date..."
        />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={invoices}
          isLoading={isLoading}
          keyField="id"
          pagination={{
            currentPage,
            totalPages: Math.ceil(totalInvoices / pageSize),
            totalItems: totalInvoices,
            pageSize,
            onPageChange: handlePageChange,
          }}
          emptyMessage="No invoices found"
        />
      </Card>
    </PageLayout>
  );
};

export default InvoicesPage;
