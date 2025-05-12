import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/stat-card';
import { 
  Calendar, 
  CreditCard, 
  Download, 
  Eye, 
  Filter, 
  MoreHorizontal, 
  Printer, 
  RefreshCw, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

// Mock data for transactions
const mockTransactions = [
  {
    id: 'tx-001',
    userId: '101',
    username: 'johndoe',
    userEmail: 'john.doe@example.com',
    amount: 49.99,
    currency: 'USD',
    status: 'completed',
    type: 'payment',
    paymentMethod: 'credit_card',
    cardType: 'Visa',
    cardLast4: '4242',
    reference: 'Session #4589',
    description: 'Charging session payment',
    createdAt: '2025-05-01T14:30:00Z'
  },
  {
    id: 'tx-002',
    userId: '102',
    username: 'janedoe',
    userEmail: 'jane.doe@example.com',
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    type: 'topup',
    paymentMethod: 'bank_transfer',
    reference: 'Wallet topup',
    description: 'Wallet balance top-up',
    createdAt: '2025-04-30T10:15:00Z'
  },
  {
    id: 'tx-003',
    userId: '103',
    username: 'bobsmith',
    userEmail: 'bob.smith@example.com',
    amount: 25.50,
    currency: 'USD',
    status: 'pending',
    type: 'payment',
    paymentMethod: 'wallet',
    reference: 'Session #4612',
    description: 'Charging session payment',
    createdAt: '2025-05-02T09:45:00Z'
  },
  {
    id: 'tx-004',
    userId: '101',
    username: 'johndoe',
    userEmail: 'john.doe@example.com',
    amount: 35.75,
    currency: 'USD',
    status: 'failed',
    type: 'payment',
    paymentMethod: 'credit_card',
    cardType: 'Mastercard',
    cardLast4: '5678',
    reference: 'Session #4623',
    description: 'Charging session payment',
    createdAt: '2025-05-02T11:20:00Z'
  },
  {
    id: 'tx-005',
    userId: '104',
    username: 'alicegreen',
    userEmail: 'alice.green@example.com',
    amount: 75.25,
    currency: 'USD',
    status: 'completed',
    type: 'payment',
    paymentMethod: 'wallet',
    reference: 'Session #4650',
    description: 'Charging session payment',
    createdAt: '2025-05-03T08:30:00Z'
  },
  {
    id: 'tx-006',
    userId: '102',
    username: 'janedoe',
    userEmail: 'jane.doe@example.com',
    amount: 20.00,
    currency: 'USD',
    status: 'completed',
    type: 'refund',
    paymentMethod: 'credit_card',
    cardType: 'Visa',
    cardLast4: '1234',
    reference: 'Session #4590',
    description: 'Refund for incomplete session',
    createdAt: '2025-05-01T16:45:00Z'
  },
  {
    id: 'tx-007',
    userId: '105',
    username: 'carljenkins',
    userEmail: 'carl.jenkins@example.com',
    amount: 200.00,
    currency: 'USD',
    status: 'completed',
    type: 'topup',
    paymentMethod: 'credit_card',
    cardType: 'Amex',
    cardLast4: '7890',
    reference: 'Wallet topup',
    description: 'Wallet balance top-up',
    createdAt: '2025-04-29T13:10:00Z'
  },
  {
    id: 'tx-008',
    userId: '103',
    username: 'bobsmith',
    userEmail: 'bob.smith@example.com',
    amount: 45.50,
    currency: 'USD',
    status: 'completed',
    type: 'payment',
    paymentMethod: 'credit_card',
    cardType: 'Visa',
    cardLast4: '4444',
    reference: 'Session #4580',
    description: 'Charging session payment',
    createdAt: '2025-04-28T17:30:00Z'
  }
];

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date; }>({});
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [showFilters, setShowFilters] = useState(false);

  // Calculate summary metrics
  const totalRevenue = mockTransactions
    .filter(tx => tx.status === 'completed' && tx.type === 'payment')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalRefunds = mockTransactions
    .filter(tx => tx.status === 'completed' && tx.type === 'refund')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const pendingAmount = mockTransactions
    .filter(tx => tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const handleSearch = () => {
    applyFilters();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      applyFilters();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    applyFilters(value, statusFilter, dateRange);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(typeFilter, value, dateRange);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date; }) => {
    setDateRange(range);
    applyFilters(typeFilter, statusFilter, range);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update filters based on tab
    let newTypeFilter = typeFilter;
    let newStatusFilter = statusFilter;
    
    if (value === 'payments') {
      newTypeFilter = 'payment';
    } else if (value === 'refunds') {
      newTypeFilter = 'refund';
    } else if (value === 'topups') {
      newTypeFilter = 'topup';
    } else if (value === 'pending') {
      newStatusFilter = 'pending';
    }
    
    setTypeFilter(value === 'all' ? 'all' : newTypeFilter);
    setStatusFilter(value === 'pending' ? 'pending' : newStatusFilter);
    
    applyFilters(
      value === 'all' ? 'all' : newTypeFilter,
      value === 'pending' ? 'pending' : newStatusFilter,
      dateRange
    );
  };

  const applyFilters = (
    type = typeFilter, 
    status = statusFilter, 
    dates = dateRange
  ) => {
    let filtered = [...mockTransactions];
    
    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(tx => tx.type === type);
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(tx => tx.status === status);
    }
    
    // Apply date range filter
    if (dates.from) {
      filtered = filtered.filter(tx => new Date(tx.createdAt) >= dates.from!);
    }
    
    if (dates.to) {
      // Add 1 day to include the end date
      const endDate = new Date(dates.to);
      endDate.setDate(endDate.getDate() + 1);
      filtered = filtered.filter(tx => new Date(tx.createdAt) < endDate);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(term) ||
        tx.username.toLowerCase().includes(term) ||
        tx.userEmail.toLowerCase().includes(term) ||
        tx.reference.toLowerCase().includes(term) ||
        tx.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateRange({});
    setFilteredTransactions(mockTransactions);
  };

  const handleViewTransaction = (id: string) => {
    navigate(`/payments/transactions/${id}`);
  };

  // Reset filters when component loads
  React.useEffect(() => {
    clearFilters();
  }, []);

  return (
    <PageLayout
      title="Transaction Management"
      description="View and manage payment transactions"
    >
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(totalRevenue)}
            icon={<CreditCard className="h-4 w-4" />}
            description="From successful payments"
            trend={{ value: 5.3, label: 'vs last month', direction: 'up' }}
          />
          <StatCard 
            title="Refunds" 
            value={formatCurrency(totalRefunds)}
            icon={<RefreshCw className="h-4 w-4" />}
            description="Total refunded amount"
            trend={{ value: 1.2, label: 'vs last month', direction: 'down' }}
          />
          <StatCard 
            title="Pending Transactions" 
            value={formatCurrency(pendingAmount)}
            icon={<Calendar className="h-4 w-4" />}
            description="Awaiting processing"
            trend={{ value: 0.5, label: 'vs last month', direction: 'up' }}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Transaction List</CardTitle>
            <Tabs
              defaultValue={activeTab}
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
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <div className="relative w-full md:w-auto md:flex-1 max-w-sm">
                  <Input
                    placeholder="Search transactions..."
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

                <div className="flex flex-wrap gap-2 items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 p-4 border rounded-md grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Transaction Type
                    </label>
                    <Select value={typeFilter} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="payment">Payments</SelectItem>
                        <SelectItem value="refund">Refunds</SelectItem>
                        <SelectItem value="topup">Top-ups</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                      <SelectTrigger>
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
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date Range
                    </label>
                    <DateRangePicker 
                      date={dateRange}
                      onDateChange={handleDateRangeChange}
                    />
                  </div>
                  
                  <div className="md:col-span-3 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearFilters}
                      className="mr-2"
                    >
                      Clear Filters
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => applyFilters()}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Method</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center">
                          <SlidersHorizontal className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">No transactions found</p>
                          <Button 
                            variant="link" 
                            onClick={clearFilters}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleViewTransaction(transaction.id)}
                      >
                        <TableCell className="font-mono text-xs">
                          {transaction.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{transaction.username}</span>
                            <span className="text-sm text-gray-500">{transaction.userEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.type === 'payment' ? 'default' : 
                              transaction.type === 'refund' ? 'warning' : 
                              'success'
                            }
                          >
                            {transaction.type === 'payment' ? 'Payment' : 
                             transaction.type === 'refund' ? 'Refund' : 
                             'Top-up'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.status === 'completed' ? 'success' : 
                              transaction.status === 'pending' ? 'warning' : 
                              'destructive'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {transaction.paymentMethod === 'credit_card' ? 
                           `${transaction.cardType} ****${transaction.cardLast4}` : 
                           transaction.paymentMethod === 'bank_transfer' ? 
                           'Bank Transfer' : 'Wallet'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleViewTransaction(transaction.id);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Would trigger print function
                                }}
                              >
                                <Printer className="mr-2 h-4 w-4" />
                                Print receipt
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {transaction.status === 'pending' && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Would trigger cancel function
                                  }}
                                  className="text-red-600"
                                >
                                  Cancel transaction
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {filteredTransactions.length > 0 && (
              <div className="flex items-center justify-end space-x-2 mt-4">
                <div className="flex-1 text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredTransactions.length}</span> of{" "}
                  <span className="font-medium">{mockTransactions.length}</span> transactions
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={true}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={true}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TransactionsPage;
