import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Filter, Search } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';

// Mock data for a wallet with extended transaction history
const getMockWallet = (id: string) => ({
  id,
  userId: `10${id}`,
  username: id === '1' ? 'johndoe' : id === '2' ? 'janedoe' : id === '3' ? 'bobsmith' : 'alicegreen',
  userEmail: id === '1' ? 'john.doe@example.com' : id === '2' ? 'jane.doe@example.com' : id === '3' ? 'bob.smith@example.com' : 'alice.green@example.com',
  balance: id === '1' ? 249.50 : id === '2' ? 125.75 : id === '3' ? 0.00 : 540.20,
  transactions: [
    // Sample transaction history with more entries
    {
      id: `tx-${id}-1`,
      type: 'topup',
      amount: id === '1' ? 200.00 : id === '2' ? 100.00 : id === '3' ? 50.00 : 300.00,
      date: '2025-04-15T10:00:00Z',
      status: 'completed',
      reference: 'Card payment',
      description: 'Manual wallet top-up',
      method: 'Credit Card'
    },
    {
      id: `tx-${id}-2`,
      type: 'topup',
      amount: id === '1' ? 100.00 : id === '2' ? 50.00 : id === '3' ? 0.00 : 250.00,
      date: '2025-03-10T15:30:00Z',
      status: 'completed',
      reference: 'Bank transfer',
      description: 'Manual wallet top-up',
      method: 'Bank Transfer'
    },
    {
      id: `tx-${id}-3`,
      type: 'payment',
      amount: id === '1' ? -50.50 : id === '2' ? -24.25 : id === '3' ? -50.00 : -9.80,
      date: '2025-04-30T14:28:30Z',
      status: 'completed',
      reference: 'Session #4589',
      description: 'Charging session payment',
      method: 'Wallet'
    },
    {
      id: `tx-${id}-4`,
      type: 'payment',
      amount: id === '1' ? -75.00 : id === '2' ? -30.00 : id === '3' ? 0.00 : -45.50,
      date: '2025-04-10T09:15:00Z',
      status: 'completed',
      reference: 'Session #4375',
      description: 'Charging session payment',
      method: 'Wallet'
    },
    {
      id: `tx-${id}-5`,
      type: 'topup',
      amount: id === '1' ? 150.00 : id === '2' ? 75.00 : id === '3' ? 0.00 : 100.00,
      date: '2025-02-20T11:45:00Z',
      status: 'completed',
      reference: 'Card payment',
      description: 'Manual wallet top-up',
      method: 'Credit Card'
    },
    {
      id: `tx-${id}-6`,
      type: 'payment',
      amount: id === '1' ? -35.00 : id === '2' ? -15.50 : id === '3' ? 0.00 : -25.25,
      date: '2025-02-05T16:20:00Z',
      status: 'completed',
      reference: 'Session #4012',
      description: 'Charging session payment',
      method: 'Wallet'
    },
    {
      id: `tx-${id}-7`,
      type: 'refund',
      amount: id === '1' ? 25.00 : id === '2' ? 15.00 : id === '3' ? 0.00 : 20.00,
      date: '2025-03-22T13:10:00Z',
      status: 'completed',
      reference: 'Session #4230',
      description: 'Charging session refund',
      method: 'Wallet'
    },
    {
      id: `tx-${id}-8`,
      type: 'payment',
      amount: id === '1' ? -65.00 : id === '2' ? -35.00 : id === '3' ? 0.00 : -45.00,
      date: '2025-01-18T08:30:00Z',
      status: 'completed',
      reference: 'Session #3890',
      description: 'Charging session payment',
      method: 'Wallet'
    },
    {
      id: `tx-${id}-9`,
      type: 'topup',
      amount: id === '1' ? 100.00 : id === '2' ? 50.00 : id === '3' ? 0.00 : 75.00,
      date: '2025-01-05T09:00:00Z',
      status: 'completed',
      reference: 'Bank transfer',
      description: 'Manual wallet top-up',
      method: 'Bank Transfer'
    },
    {
      id: `tx-${id}-10`,
      type: 'payment',
      amount: id === '1' ? -40.00 : id === '2' ? -25.50 : id === '3' ? 0.00 : -30.75,
      date: '2024-12-20T14:50:00Z',
      status: 'completed',
      reference: 'Session #3750',
      description: 'Charging session payment',
      method: 'Wallet'
    }
  ]
});

const WalletHistoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wallet = getMockWallet(id || '1');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date; }>({});
  const [filteredTransactions, setFilteredTransactions] = useState(wallet.transactions);

  const transactionColumns = [
    { 
      header: 'Transaction ID', 
      accessorKey: 'id',
      cell: (row: any) => <span className="font-mono text-xs">{row.id}</span>
    },
    { 
      header: 'Type', 
      accessorKey: 'type',
      cell: (row: any) => {
        let variant = 'default';
        let label = row.type;
        
        switch (row.type) {
          case 'topup':
            variant = 'success';
            label = 'Top-up';
            break;
          case 'payment':
            variant = 'default';
            label = 'Payment';
            break;
          case 'refund':
            variant = 'warning';
            label = 'Refund';
            break;
          default:
            break;
        }
        
        return <Badge variant={variant as any}>{label}</Badge>;
      }
    },
    { 
      header: 'Amount', 
      accessorKey: 'amount',
      cell: (row: any) => {
        const amount = parseFloat(row.amount);
        return (
          <span className={amount >= 0 ? 'text-green-600' : 'text-red-600'}>
            {amount >= 0 ? '+' : ''}{formatCurrency(amount)}
          </span>
        );
      }
    },
    { 
      header: 'Date', 
      accessorKey: 'date',
      cell: (row: any) => formatDate(row.date)
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row: any) => (
        <Badge 
          variant={
            row.status === 'completed' ? 'success' : 
            row.status === 'pending' ? 'warning' : 
            'danger'
          }
        >
          {row.status}
        </Badge>
      )
    },
    { header: 'Method', accessorKey: 'method' },
    { header: 'Reference', accessorKey: 'reference' },
    { header: 'Description', accessorKey: 'description' }
  ];

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

  const handleBack = () => {
    navigate(`/payments/wallets/${id}`);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      applyFilters(); // Re-apply filters without search term
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    applyFilters(value, dateRange);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date; }) => {
    setDateRange(range);
    applyFilters(typeFilter, range);
  };

  const applyFilters = (type = typeFilter, dates = dateRange) => {
    let filtered = [...wallet.transactions];
    
    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(tx => tx.type === type);
    }
    
    // Apply date range filter
    if (dates.from) {
      filtered = filtered.filter(tx => new Date(tx.date) >= dates.from!);
    }
    
    if (dates.to) {
      // Add 1 day to include the end date
      const endDate = new Date(dates.to);
      endDate.setDate(endDate.getDate() + 1);
      filtered = filtered.filter(tx => new Date(tx.date) < endDate);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(term) ||
        tx.reference.toLowerCase().includes(term) ||
        tx.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredTransactions(filtered);
  };

  // Calculate summary metrics
  const totalDeposits = filteredTransactions
    .filter(tx => tx.type === 'topup' || tx.type === 'refund')
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0);
    
  const totalSpent = filteredTransactions
    .filter(tx => tx.type === 'payment')
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount.toString())), 0);
    
  const transactionCount = filteredTransactions.length;

  return (
    <PageLayout
      title={`Wallet History: ${wallet.username}`}
      description="View all transactions for this wallet"
      breadcrumb={[
        { label: 'Payment & Billing', href: '/payments' },
        { label: 'Wallets', href: '/payments/wallets' },
        { label: wallet.username, href: `/payments/wallets/${id}` },
        { label: 'Transaction History', href: `/payments/wallets/${id}/history` }
      ]}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wallet
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDeposits)}</p>
              <p className="text-sm text-gray-500">All top-ups and refunds</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
              <p className="text-sm text-gray-500">All payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{transactionCount}</p>
              <p className="text-sm text-gray-500">Total transactions</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Complete record of all wallet transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
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
                <div className="w-full sm:w-auto">
                  <Label className="mr-2">Type:</Label>
                  <Select value={typeFilter} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="topup">Top-ups</SelectItem>
                      <SelectItem value="payment">Payments</SelectItem>
                      <SelectItem value="refund">Refunds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Date Range
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filter by Date Range</DialogTitle>
                      <DialogDescription>
                        Select a date range to filter transactions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <DateRangePicker 
                        date={dateRange}
                        onDateChange={handleDateRangeChange}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDateRange({});
                          applyFilters(typeFilter, {});
                        }}
                      >
                        Clear Dates
                      </Button>
                      <Button 
                        onClick={() => applyFilters(typeFilter, dateRange)}
                      >
                        Apply
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <DataTable
              columns={transactionColumns}
              data={filteredTransactions}
              pagination
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default WalletHistoryPage;
