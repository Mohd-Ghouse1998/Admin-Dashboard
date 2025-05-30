import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { 
  CreditCard, 
  RefreshCw, 
  Clock, 
  Download,
  MoreHorizontal,
  RefreshCcw
} from 'lucide-react';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/modules/payments/services/paymentService';

// Interface for payment item
interface PaymentItem {
  id: string;
  order_id: string;
  username: string;
  total: number;
  refund: number;
  status: string;
  method: string;
  created: string;
}

// Interface for payment statistics
interface PaymentStats {
  totalRevenue: number;
  totalRefunds: number;
  pendingAmount: number;
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
}

function PaymentsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
  // State variables
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // Fixed page size to 10 items per page
  const [pageSize] = useState(10); // Removed setPageSize since we want to keep it fixed at 10
  const [totalItems, setTotalItems] = useState(0);
  
  // Payment stats
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalRefunds: 0,
    pendingAmount: 0,
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0
  });
  
  // Fetch payments from API
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      // Prepare filters
      const filters: Record<string, any> = {
        page: currentPage,
        page_size: 10  // Always request exactly 10 items per page
      };
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      if (methodFilter !== 'all') {
        filters.payment_method = methodFilter;
      }
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (dateRange?.from) {
        filters.start_date = dateRange.from.toISOString().split('T')[0];
      }
      
      if (dateRange?.to) {
        filters.end_date = dateRange.to.toISOString().split('T')[0];
      }
      
      // Call API
      if (accessToken) {
        const response = await paymentService.getPayments(accessToken, filters);
        
        if (response) {
          console.log('Raw API response structure:', Object.keys(response));
          console.log('Raw API response:', response);
          
          // Check if we're getting paginated results
          let results: any[] = [];
          let totalCount = 0;
          
          if (Array.isArray(response)) {
            // Direct array response
            results = response.slice(0, 10); // Force limit to 10
            totalCount = response.length;
            console.log('Response is an array, limited to 10 items');
          } else if (response.results && Array.isArray(response.results)) {
            // Standard paginated response with results field
            results = response.results.slice(0, 10); // Force limit to 10
            totalCount = response.count || response.results.length;
            console.log('Response has results array, limited to 10 items');
          } else {
            // Try to extract from other fields
            const possibleArrayFields = Object.keys(response)
              .filter(key => Array.isArray(response[key]));
            
            if (possibleArrayFields.length > 0) {
              results = response[possibleArrayFields[0]].slice(0, 10);
              totalCount = response[possibleArrayFields[0]].length;
              console.log(`Found data in field: ${possibleArrayFields[0]}, limited to 10 items`);
            } else {
              console.log('Could not find array data in response');
            }
          }
          
          console.log('Extracted results array length:', results.length);
          
          const mappedPayments = results.map((item: any) => {
            console.log('Processing item:', item);
            const mappedItem = {
              id: item.id || item.payment_id || '',
              order_id: item.order_id || item.order || item.transaction_id || '',
              username: item.username || item.billing_email || item.user_email || 'Anonymous',
              total: parseFloat(item.amount || item.total || 0),
              refund: parseFloat(item.refund_amount || item.refund || 0),
              status: item.status || 'unknown',
              method: item.variant || item.payment_method || item.method || 'unknown',
              created: item.created_at || item.created || new Date().toISOString()
            };
            console.log('Mapped to:', mappedItem);
            return mappedItem;
          });
          
          console.log('Mapped payments total length:', mappedPayments.length);
          
          // Set payments state with strictly limited data
          setPayments(mappedPayments);
          
          // Handle pagination properly
          setTotalItems(totalCount);
          console.log('Total items for pagination:', totalCount);
          
          // Make sure we're not on an invalid page
          if (totalCount > 0 && Math.ceil(totalCount / pageSize) < currentPage) {
            handlePageChange(1);
          }
          
          console.log('Set payments state, length:', mappedPayments.length);
        } else {
          setPayments([]);
          setTotalItems(0);
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
      setTotalItems(0);
      
      toast({
        title: 'Error',
        description: 'Failed to fetch payment data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set default stats data instead of making API call
  const setDefaultStats = () => {
    // Calculate stats from current payment data
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.total, 0);
    const totalRefunds = payments.reduce((sum, payment) => sum + payment.refund, 0);
    const pendingCount = payments.filter(p => p.status.toLowerCase() === 'pending').length;
    const completedCount = payments.filter(p => ['paid', 'completed'].includes(p.status.toLowerCase())).length;
    const failedCount = payments.filter(p => p.status.toLowerCase() === 'failed').length;
    
    setStats({
      totalRevenue: totalRevenue,
      totalRefunds: totalRefunds,
      pendingAmount: pendingCount * 100, // Estimate
      totalCount: payments.length,
      completedCount: completedCount,
      pendingCount: pendingCount,
      failedCount: failedCount
    });
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update filters based on tab
    if (value === 'razorpay' || value === 'wallet') {
      setMethodFilter(value);
      setStatusFilter('all');
    } else if (value === 'pending' || value === 'refunded') {
      setStatusFilter(value);
      setMethodFilter('all');
    } else {
      setMethodFilter('all');
      setStatusFilter('all');
    }
  };
  
  // Handle method filter change
  const handleMethodChange = (value: string) => {
    setMethodFilter(value);
  };
  
  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setMethodFilter('all');
    setStatusFilter('all');
    setDateRange(undefined);
    setActiveTab('all');
  };
  
  // Handle row click
  const handleRowClick = (payment: PaymentItem) => {
    navigate(`/payments/${payment.id}`);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // No page size change handler needed since we fixed it at 10 items per page
  
  // Handle export data
  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Your payment data export is being generated'
    });
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'outline';
    
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        variant = 'default';
        break;
      case 'refunded':
      case 'partially_refunded':
      case 'pending':
        variant = 'secondary';
        break;
      case 'failed':
        variant = 'destructive';
        break;
    }
    
    return React.createElement(Badge, { variant }, status);
  };
  
  // Table columns definition
  const columns: Column[] = [
    {
      id: 'id',
      header: 'Payment ID',
      key: 'id',
      render: (row: any) => React.createElement('span', { className: 'font-medium' }, row.id),
      sortable: true
    },
    {
      id: 'order_id',
      header: 'Order ID',
      key: 'order_id',
      render: (row: any) => React.createElement('span', null, row.order_id),
      sortable: true
    },
    {
      id: 'username',
      header: 'User',
      key: 'username',
      render: (row: any) => React.createElement('span', null, row.username),
      sortable: true
    },
    {
      id: 'total',
      header: 'Amount',
      key: 'total',
      render: (row: any) => React.createElement('span', { className: 'font-medium' }, formatCurrency(row.total)),
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      key: 'status',
      render: (row: any) => renderStatusBadge(row.status),
      sortable: true
    },
    {
      id: 'method',
      header: 'Method',
      key: 'method',
      render: (row: any) => React.createElement('span', null, row.method),
      sortable: true
    },
    {
      id: 'created',
      header: 'Date',
      key: 'created',
      render: (row: any) => React.createElement('span', null, formatDate(row.created)),
      sortable: true
    }
    // Removed actions column with three dots button
  ];
  
  // Load data when dependencies change
  useEffect(() => {
    fetchPayments();
  }, [currentPage, pageSize, methodFilter, statusFilter, dateRange, searchTerm, accessToken]);
  
  // Update stats whenever payments data changes
  useEffect(() => {
    setDefaultStats();
  }, [payments]);
  
  // Stats cards component
  const StatsCards = () => {
    return React.createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
      [
        // Revenue Card
        React.createElement(
          Card,
          { key: 'revenue', className: 'border-primary/10' },
          React.createElement(
            CardContent,
            { className: 'p-4 flex justify-between items-center bg-gradient-to-r from-primary/5 to-primary/10' },
            [
              React.createElement(
                'div',
                { key: 'info' },
                [
                  React.createElement('p', { key: 'label', className: 'text-sm font-medium text-muted-foreground' }, 'Total Revenue'),
                  React.createElement('h2', { key: 'value', className: 'text-2xl font-bold' }, formatCurrency(stats.totalRevenue))
                ]
              ),
              React.createElement(CreditCard, { key: 'icon', className: 'h-8 w-8 text-primary' })
            ]
          )
        ),
        
        // Refunds Card
        React.createElement(
          Card,
          { key: 'refunds', className: 'border-primary/10' },
          React.createElement(
            CardContent,
            { className: 'p-4 flex justify-between items-center bg-gradient-to-r from-primary/5 to-primary/10' },
            [
              React.createElement(
                'div',
                { key: 'info' },
                [
                  React.createElement('p', { key: 'label', className: 'text-sm font-medium text-muted-foreground' }, 'Total Refunds'),
                  React.createElement('h2', { key: 'value', className: 'text-2xl font-bold' }, formatCurrency(stats.totalRefunds))
                ]
              ),
              React.createElement(RefreshCcw, { key: 'icon', className: 'h-8 w-8 text-primary' })
            ]
          )
        ),
        
        // Pending Card
        React.createElement(
          Card,
          { key: 'pending', className: 'border-primary/10' },
          React.createElement(
            CardContent,
            { className: 'p-4 flex justify-between items-center bg-gradient-to-r from-primary/5 to-primary/10' },
            [
              React.createElement(
                'div',
                { key: 'info' },
                [
                  React.createElement('p', { key: 'label', className: 'text-sm font-medium text-muted-foreground' }, 'Pending Amount'),
                  React.createElement('h2', { key: 'value', className: 'text-2xl font-bold' }, formatCurrency(stats.pendingAmount))
                ]
              ),
              React.createElement(Clock, { key: 'icon', className: 'h-8 w-8 text-primary' })
            ]
          )
        ),
        
        // Total Payments Card
        React.createElement(
          Card,
          { key: 'total', className: 'border-primary/10' },
          React.createElement(
            CardContent,
            { className: 'p-4 flex justify-between items-center bg-gradient-to-r from-primary/5 to-primary/10' },
            [
              React.createElement(
                'div',
                { key: 'info' },
                [
                  React.createElement('p', { key: 'label', className: 'text-sm font-medium text-muted-foreground' }, 'Total Payments'),
                  React.createElement('h2', { key: 'value', className: 'text-2xl font-bold' }, stats.totalCount),
                  React.createElement(
                    'div',
                    { key: 'details', className: 'flex gap-2 text-xs mt-1' },
                    [
                      React.createElement('span', { key: 'completed', className: 'text-success' }, `${stats.completedCount} completed`),
                      React.createElement('span', { key: 'pending', className: 'text-warning' }, `${stats.pendingCount} pending`)
                    ]
                  )
                ]
              ),
              React.createElement(CreditCard, { key: 'icon', className: 'h-8 w-8 text-primary' })
            ]
          )
        )
      ]
    );
  };
  
  // Main render
  return React.createElement(
    'div',
    { className: 'container mx-auto py-6 space-y-6' },
    [
      // Header
      React.createElement(
        'div',
        { key: 'header', className: 'flex justify-between items-center' },
        [
          React.createElement('h1', { key: 'title', className: 'text-2xl font-bold' }, 'Payments'),
          React.createElement(
            'div',
            { key: 'actions', className: 'flex gap-2' },
            React.createElement(
              Button,
              { key: 'export', variant: 'outline', size: 'sm', onClick: handleExportData },
              [
                React.createElement(Download, { key: 'icon', className: 'h-4 w-4 mr-2' }),
                'Export Data'
              ]
            )
          )
        ]
      ),
      
      // Stats Cards
      React.createElement(StatsCards, { key: 'stats' }),
      
      // Tabs and Filters
      React.createElement(
        Tabs,
        { key: 'tabs', value: activeTab, onValueChange: handleTabChange },
        [
          // Tab Header
          React.createElement(
            'div',
            { key: 'tab-header', className: 'flex justify-between items-center mb-4' },
            [
              React.createElement(
                TabsList,
                { key: 'tabs-list' },
                [
                  React.createElement(TabsTrigger, { key: 'all', value: 'all' }, 'All Payments'),
                  React.createElement(TabsTrigger, { key: 'razorpay', value: 'razorpay' }, 'Razorpay'),
                  React.createElement(TabsTrigger, { key: 'wallet', value: 'wallet' }, 'Wallet'),
                  React.createElement(TabsTrigger, { key: 'pending', value: 'pending' }, 'Pending'),
                  React.createElement(TabsTrigger, { key: 'refunded', value: 'refunded' }, 'Refunded')
                ]
              ),
              
              React.createElement(
                Button,
                { key: 'reset', variant: 'outline', size: 'sm', onClick: handleResetFilters },
                [
                  React.createElement(RefreshCw, { key: 'icon', className: 'h-4 w-4 mr-2' }),
                  'Reset Filters'
                ]
              )
            ]
          ),
          
          // Filters
          React.createElement(
            'div',
            { key: 'filters', className: 'flex flex-col md:flex-row gap-4 mb-6' },
            [
              // Search
              React.createElement(
                'div',
                { key: 'search', className: 'w-full md:w-1/3' },
                React.createElement(Input, {
                  placeholder: 'Search by ID, order, or user...',
                  value: searchTerm,
                  onChange: handleSearchChange
                })
              ),
              
              // Status Filter
              React.createElement(
                'div',
                { key: 'status', className: 'w-full md:w-1/5' },
                React.createElement(
                  Select,
                  { value: statusFilter, onValueChange: handleStatusChange },
                  [
                    React.createElement(
                      SelectTrigger,
                      { key: 'trigger' },
                      React.createElement(SelectValue, { placeholder: 'Status' })
                    ),
                    React.createElement(
                      SelectContent,
                      { key: 'content' },
                      [
                        React.createElement(SelectItem, { key: 'all', value: 'all' }, 'All Statuses'),
                        React.createElement(SelectItem, { key: 'completed', value: 'completed' }, 'Completed'),
                        React.createElement(SelectItem, { key: 'pending', value: 'pending' }, 'Pending'),
                        React.createElement(SelectItem, { key: 'failed', value: 'failed' }, 'Failed'),
                        React.createElement(SelectItem, { key: 'refunded', value: 'refunded' }, 'Refunded')
                      ]
                    )
                  ]
                )
              ),
              
              // Method Filter
              React.createElement(
                'div',
                { key: 'method', className: 'w-full md:w-1/5' },
                React.createElement(
                  Select,
                  { value: methodFilter, onValueChange: handleMethodChange },
                  [
                    React.createElement(
                      SelectTrigger,
                      { key: 'trigger' },
                      React.createElement(SelectValue, { placeholder: 'Payment Method' })
                    ),
                    React.createElement(
                      SelectContent,
                      { key: 'content' },
                      [
                        React.createElement(SelectItem, { key: 'all', value: 'all' }, 'All Methods'),
                        React.createElement(SelectItem, { key: 'razorpay', value: 'razorpay' }, 'Razorpay'),
                        React.createElement(SelectItem, { key: 'wallet', value: 'wallet' }, 'Wallet'),
                        React.createElement(SelectItem, { key: 'cash', value: 'cash' }, 'Cash'),
                        React.createElement(SelectItem, { key: 'card', value: 'card' }, 'Card')
                      ]
                    )
                  ]
                )
              ),
              
              // Date Range
              React.createElement(
                'div',
                { key: 'date', className: 'w-full md:w-1/4' },
                React.createElement(DateRangePicker, {
                  dateRange: dateRange,
                  onSelect: handleDateRangeChange,
                  placeholder: 'Filter by date'
                })
              )
            ]
          ),
          
          // Table Content
          React.createElement(
            TabsContent,
            { key: 'content', value: activeTab, className: 'mt-0' },
            React.createElement(ListTemplate, {
              title: 'Payments',
              data: payments,
              columns: columns,
              totalItems: totalItems,
              currentPage: currentPage,
              totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
              pageSize: pageSize,
              isLoading: isLoading,
              onRowClick: handleRowClick,
              onPageChange: handlePageChange,
              searchQuery: searchTerm,
              emptyState: React.createElement(
                'div', 
                { className: 'text-center py-10' },
                [
                  React.createElement('p', { className: 'text-lg text-muted-foreground' }, 'No payment records found'),
                  React.createElement('p', { className: 'text-sm text-muted-foreground mt-2' }, 'Try adjusting your filters or search criteria')
                ]
              )
            })
          )
        ]
      )
    ]
  );
}

export default PaymentsPage;
