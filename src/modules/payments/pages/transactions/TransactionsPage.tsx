import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/stat-card';
import { 
  CreditCard, 
  Download, 
  Eye, 
  Filter,
  MoreHorizontal, 
  Printer, 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { transactionService, Transaction, TransactionFilters } from '@/modules/payments/services/transactionService';

// Interface for transaction stats
interface TransactionStats {
  totalRevenue: number;
  totalRefunds: number;
  pendingAmount: number;
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  trends: {
    revenue: number;
    refunds: number;
    pending: number;
  };
}

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Transaction stats
  const [stats, setStats] = useState<TransactionStats>({
    totalRevenue: 0,
    totalRefunds: 0,
    pendingAmount: 0,
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    trends: {
      revenue: 0,
      refunds: 0,
      pending: 0
    }
  });

  // Fetch transaction data from API
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Prepare filters for API call
      const filters: TransactionFilters = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined
      };
      
      // Add type filter if not 'all'
      if (typeFilter !== 'all') {
        filters.type = typeFilter;
      }
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      // Add date range filters
      if (dateRange.from) {
        filters.start_date = dateRange.from.toISOString().split('T')[0];
      }
      
      if (dateRange.to) {
        // Add 1 day to include the end date
        const endDate = new Date(dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        filters.end_date = endDate.toISOString().split('T')[0];
      }
      
      // Call API to get transactions with filters
      const response = await transactionService.getTransactions(filters);
      
      // Update state with fetched data
      setTransactions(response.results);
      setFilteredTransactions(response.results);
      setTotalItems(response.count);
      
      // Fetch stats separately
      fetchStats();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch transaction stats for KPI cards
  const fetchStats = async () => {
    try {
      const statsData = await transactionService.getTransactionStats();
      setStats({
        totalRevenue: statsData.total_revenue || 0,
        totalRefunds: statsData.total_refunds || 0,
        pendingAmount: statsData.pending_amount || 0,
        totalCount: statsData.total_count || 0,
        completedCount: statsData.completed_count || 0,
        pendingCount: statsData.pending_count || 0,
        failedCount: statsData.failed_count || 0,
        trends: {
          revenue: statsData.trends?.revenue || 5.3, // Fallback to default if API doesn't provide
          refunds: statsData.trends?.refunds || -1.2,
          pending: statsData.trends?.pending || 0.5
        }
      });
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      // Don't show toast for stats error as it's not critical
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update filters based on tab
    let newTypeFilter = 'all';
    let newStatusFilter = 'all';
    
    if (value === 'payments') {
      newTypeFilter = 'payment';
    } else if (value === 'refunds') {
      newTypeFilter = 'refund';
    } else if (value === 'topups') {
      newTypeFilter = 'topup';
    } else if (value === 'pending') {
      newStatusFilter = 'pending';
    }
    
    setTypeFilter(newTypeFilter);
    setStatusFilter(newStatusFilter);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateRange({});
    setActiveTab('all');
    setCurrentPage(1);
  };

  const handleViewTransaction = (id: string) => {
    navigate(`/payments/transactions/${id}`);
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Fetch data when component loads or when filters change
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchTransactions();
    } else {
      setIsLoading(false);
      toast({
        title: 'Authentication Required',
        description: 'Please login to view transaction data.',
        variant: 'destructive',
      });
    }
  }, [currentPage, pageSize, typeFilter, statusFilter, dateRange, searchTerm, isAuthenticated, accessToken]);
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Handle bulk selection
  const handleSelectionChange = (selected: Transaction[]) => {
    setSelectedTransactions(selected);
  };
  
  // Define columns for the transaction list
  const columns: Column<Transaction>[] = [
    {
      header: "ID",
      key: "id",
      render: (transaction) => (
        <div className="font-mono text-xs">{transaction.id}</div>
      )
    },
    {
      header: "Date",
      key: "createdAt",
      render: (transaction) => (
        <div>
          <div>{formatDate(transaction.createdAt).split(',')[0]}</div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
          </div>
        </div>
      )
    },
    {
      header: "User",
      render: (transaction) => (
        <div>
          <div className="font-medium">{transaction.username}</div>
          <div className="text-xs text-muted-foreground">{transaction.userEmail}</div>
        </div>
      )
    },
    {
      header: "Type",
      key: "type",
      render: (transaction) => {
        const typeConfig = {
          payment: { label: "Payment", variant: "default", icon: <CreditCard className="h-3 w-3 mr-1" /> },
          refund: { label: "Refund", variant: "destructive", icon: <RefreshCw className="h-3 w-3 mr-1" /> },
          topup: { label: "Top-up", variant: "secondary", icon: <Calendar className="h-3 w-3 mr-1" /> }
        };
        
        const config = typeConfig[transaction.type];
        
        return (
          <Badge variant={config.variant as any} className="flex items-center gap-1">
            {config.icon}
            {config.label}
          </Badge>
        );
      }
    },
    {
      header: "Amount",
      key: "amount",
      align: "right",
      render: (transaction) => (
        <div className="font-medium text-right">
          {formatCurrency(transaction.amount, transaction.currency)}
        </div>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (transaction) => {
        const statusConfig = {
          completed: { label: "Completed", variant: "success", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
          pending: { label: "Pending", variant: "warning", icon: <Clock className="h-3 w-3 mr-1" /> },
          failed: { label: "Failed", variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> }
        };
        
        const config = statusConfig[transaction.status];
        
        return (
          <Badge variant={config.variant as any} className="flex items-center gap-1">
            {config.icon}
            {config.label}
          </Badge>
        );
      }
    },
    {
      header: "Method",
      key: "paymentMethod",
      render: (transaction) => {
        const methodLabel: Record<string, string> = {
          credit_card: transaction.cardType ? `${transaction.cardType} (${transaction.cardLast4})` : "Credit Card",
          bank_transfer: "Bank Transfer",
          wallet: "Wallet"
        };
        
        return (
          <div className="text-sm">
            {methodLabel[transaction.paymentMethod] || transaction.paymentMethod}
          </div>
        );
      }
    },
    {
      header: "Reference",
      key: "reference",
      render: (transaction) => (
        <div className="max-w-[180px] truncate" title={transaction.reference}>
          {transaction.reference}
        </div>
      )
    }
  ];
  
  // Create the custom filter component for the ListTemplate
  const filterComponent = (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-[160px]">
        <Select value={typeFilter} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="topup">Top-up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-shrink-0 w-[160px]">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-shrink-0 w-[160px]">
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
        />
      </div>
      
      <Button variant="ghost" size="sm" className="ml-2" onClick={clearFilters}>
        Reset Filters
      </Button>
    </div>
  );
  
  // Custom filter bar to display above the table
  const customFilterBar = (
    <div className="flex items-center justify-between mb-4 mt-4 border-b pb-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Transaction Type</span>
        <span className="ml-28">Status</span>
        <span className="ml-28">Date Range</span>
      </div>
    </div>
  );
  
  // Create stats cards for the ListTemplate
  const statsCards = (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          <div className="flex-shrink-0">
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium flex items-center ${stats.trends.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trends.revenue >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.revenue).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Refunds</h3>
          <div className="flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRefunds)}</p>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium flex items-center ${stats.trends.refunds >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trends.refunds >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.refunds).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Pending Transactions</h3>
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium flex items-center ${stats.trends.pending >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trends.pending >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.pending).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {statsCards}
      
      <div className="flex justify-between items-center mb-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
            <TabsTrigger value="topups">Top-ups</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {customFilterBar}
      
      <ListTemplate
        title="Transaction List"
        description="View and manage payment transactions"
        icon={<CreditCard className="h-4 w-4" />}
        data={filteredTransactions}
        columns={columns}
        isLoading={isLoading}
        searchQuery={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by ID, user, or reference..."
        filterComponent={filterComponent}
        onRowClick={(transaction) => handleViewTransaction(transaction.id)}
        rowActions={(transaction) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewTransaction(transaction.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert(`Downloading receipt for ${transaction.id}`)}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        selectedItems={selectedTransactions}
        onSelectItems={handleSelectionChange}
        selectable={true}

        emptyState={
          <div className="text-center py-10">
            <div className="text-lg font-medium">No transactions found</div>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Reset Filters
            </Button>
          </div>
        }
        // Pagination props
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={Math.ceil(totalItems / pageSize)}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        // Export option
        onExport={() => alert('Exporting transactions...')}
        className="border border-border rounded-lg shadow-sm"
      />
    </div>
  );
};

export default TransactionsPage;
