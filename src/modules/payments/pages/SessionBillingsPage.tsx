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
import { Eye } from 'lucide-react';
import { getSessionBillings, SessionBilling } from '@/services/api/sessionBillingsApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const SessionBillingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionBillings, setSessionBillings] = useState<SessionBilling[]>([]);
  const [filteredBillings, setFilteredBillings] = useState<SessionBilling[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  useEffect(() => {
    fetchSessionBillings();
  }, []);

  const fetchSessionBillings = async () => {
    setIsLoading(true);
    try {
      const response = await getSessionBillings();
      if (response.data && response.data.results) {
        setSessionBillings(response.data.results);
        setFilteredBillings(response.data.results);
      } else {
        console.error('Unexpected API response format:', response.data);
        setSessionBillings([]);
        setFilteredBillings([]);
      }
    } catch (error) {
      console.error('Failed to fetch session billings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session billings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterBillings();
  }, [searchTerm, dateRange, sessionBillings]);

  const filterBillings = () => {
    let filtered = [...sessionBillings];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (billing) =>
          billing.session.toString().includes(term) ||
          billing.id.toLowerCase().includes(term) ||
          (billing.amount_added?.toString() || '').includes(term)
      );
    }

    // Since we don't have created_at field in the new API response,
    // we're disabling date filtering for now
    // but keeping the UI elements in place for future implementation
    
    // Note: Uncomment and update with appropriate date field when available
    // if (dateRange.from) {
    //   filtered = filtered.filter(
    //     (billing) => /* Add date filtering when a date field is available */
    //   );
    // }
    // 
    // if (dateRange.to) {
    //   filtered = filtered.filter(
    //     (billing) => /* Add date filtering when a date field is available */
    //   );
    // }

    setFilteredBillings(filtered);
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

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const columns: Column<SessionBilling>[] = [
    {
      header: 'Session ID',
      accessorKey: 'session',
      cell: (row: SessionBilling) => row.session
    },
    {
      header: 'Amount Added',
      accessorKey: 'amount_added',
      cell: (row: SessionBilling) => row.amount_added !== null ? formatCurrency(row.amount_added) : 'N/A'
    },
    {
      header: 'Amount Consumed',
      accessorKey: 'amount_consumed',
      cell: (row: SessionBilling) => row.amount_consumed !== null ? formatCurrency(row.amount_consumed) : 'N/A'
    },
    {
      header: 'Energy Added',
      accessorKey: 'kwh_added',
      cell: (row: SessionBilling) => row.kwh_added !== null ? `${row.kwh_added} kWh` : 'N/A'
    },
    {
      header: 'Energy Consumed',
      accessorKey: 'kwh_consumed',
      cell: (row: SessionBilling) => row.kwh_consumed !== null ? `${row.kwh_consumed} kWh` : 'N/A'
    },
    {
      header: 'CDR Sent',
      accessorKey: 'cdr_sent',
      cell: (row: SessionBilling) => (
        <Badge
          variant={row.cdr_sent ? 'success' : 'secondary'}
        >
          {row.cdr_sent ? 'Yes' : 'No'}
        </Badge>
      )
    },

    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: SessionBilling) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/payment/session-billings/${row.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <PageLayout
      title="Session Billings"
      description="View and manage all charging session billings"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Session Billings', url: '/payment/session-billings' }
      ]}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by session ID, user, or charger ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
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
          data={filteredBillings}
          isLoading={isLoading}
          keyField="id"
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalItems: filteredBillings.length,
            pageSize: filteredBillings.length,
            onPageChange: () => {}, // No-op since we're showing all at once
          }}
          emptyMessage="No session billings found"
        />
      </Card>
    </PageLayout>
  );
};

export default SessionBillingsPage;
