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
import { Eye, Plus } from 'lucide-react';
import { getOrders, Order, PaginatedResponse } from '@/services/api/ordersApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching orders...');
      const response = await getOrders();
      console.log('API Response:', response);
      
      // Extract data from the response
      const responseData = response.data;
      
      // Handle paginated response structure
      let orderData: Order[] = [];
      
      if (responseData && 'results' in responseData && Array.isArray(responseData.results)) {
        // Handle paginated response
        console.log('Found paginated response with results array');
        orderData = responseData.results;
      } else if (Array.isArray(responseData)) {
        // Handle direct array response
        console.log('Response is a direct array');
        orderData = responseData;
      } else {
        console.error('Unexpected response structure:', responseData);
        toast({
          title: 'Data Structure Error',
          description: 'Received unexpected data structure from API.',
          variant: 'destructive',
        });
        setOrders([]);
        setFilteredOrders([]);
        return;
      }
      
      console.log('Processing order data:', orderData);
      setOrders(orderData);
      setFilteredOrders(orderData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders. Please try again. Error: ' + (error instanceof Error ? error.message : String(error)),
        variant: 'destructive',
      });
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterOrders();
  }, [searchTerm, dateRange, orders]);

  const filterOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(term) ||
          order.status.toLowerCase().includes(term) ||
          order.payment_method.toLowerCase().includes(term)
      );
    }

    // Apply date filter
    if (dateRange.from) {
      filtered = filtered.filter(
        (order) => new Date(order.created_at) >= dateRange.from!
      );
    }

    if (dateRange.to) {
      filtered = filtered.filter(
        (order) => new Date(order.created_at) <= dateRange.to!
      );
    }

    setFilteredOrders(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    // Return a fallback string if date is null/undefined
    if (!dateString) return 'N/A';
    
    try {
      // Check if it's a valid date string before formatting
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Error';
    }
  };

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    
    switch (status) {
      case 'completed':
        variant = 'success';
        break;
      case 'pending':
        variant = 'secondary';
        break;
      case 'cancelled':
      case 'failed':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    
    switch (status) {
      case 'paid':
        variant = 'success';
        break;
      case 'unpaid':
        variant = 'secondary';
        break;
      case 'refunded':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const columns: Column<Order>[] = [
    {
      header: 'Order ID',
      accessorKey: 'id',
      cell: (row: Order) => row.id?.substring(0, 8) || 'N/A'
    },
    {
      header: 'User',
      accessorKey: 'username',
      cell: (row: Order) => row.username || 'N/A'
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: Order) => formatCurrency(row.amount)
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: Order) => getStatusBadge(row.status)
    },
    {
      header: 'Payment Status',
      accessorKey: 'payment_info.status',
      cell: (row: Order) => row.payment_info?.status ? (
        <Badge variant="default">
          {row.payment_info.status}
        </Badge>
      ) : 'N/A'
    },
    {
      header: 'Created',
      accessorKey: 'payment_info.created',
      cell: (row: Order) => formatDate(row.payment_info?.created)
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: Order) => {
        const id = row.id;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/payment/orders/${id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <PageLayout
      title="Orders"
      description="View and manage all orders"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Orders', url: '/payment/orders' }
      ]}
      actions={
        <Button onClick={() => navigate('/payment/orders/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      }
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by order number, status, or payment method..."
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
          data={filteredOrders}
          isLoading={isLoading}
          keyField="id"
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalItems: filteredOrders.length,
            pageSize: filteredOrders.length,
            onPageChange: () => {}, // No-op since we're showing all at once
          }}
          emptyMessage="No orders found"
        />
      </Card>
    </PageLayout>
  );
};

export default OrdersPage;
