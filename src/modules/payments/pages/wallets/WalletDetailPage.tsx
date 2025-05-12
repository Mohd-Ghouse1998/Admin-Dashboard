import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { ArrowLeft, ArrowUpRight, Ban, Download, History, User, CreditCard } from 'lucide-react';

// Mock data for a wallet
const getMockWallet = (id: string) => ({
  id,
  userId: `10${id}`,
  username: id === '1' ? 'johndoe' : id === '2' ? 'janedoe' : id === '3' ? 'bobsmith' : 'alicegreen',
  userEmail: id === '1' ? 'john.doe@example.com' : id === '2' ? 'jane.doe@example.com' : id === '3' ? 'bob.smith@example.com' : 'alice.green@example.com',
  balance: id === '1' ? 249.50 : id === '2' ? 125.75 : id === '3' ? 0.00 : 540.20,
  availableBalance: id === '1' ? 249.50 : id === '2' ? 100.00 : id === '3' ? 0.00 : 540.20,
  pendingBalance: id === '1' ? 0.00 : id === '2' ? 25.75 : id === '3' ? 0.00 : 0.00,
  currency: 'USD',
  status: id === '3' ? 'inactive' : 'active',
  lastTransaction: id === '1' ? '2025-04-30T14:28:30Z' : id === '2' ? '2025-05-01T11:15:45Z' : id === '3' ? '2025-03-15T16:42:10Z' : '2025-04-29T08:54:12Z',
  createdAt: id === '1' ? '2024-12-15T09:00:00Z' : id === '2' ? '2025-01-05T10:30:00Z' : id === '3' ? '2025-02-20T12:00:00Z' : '2025-01-10T14:15:00Z',
  transactions: [
    {
      id: `tx-${id}-1`,
      type: 'topup',
      amount: id === '1' ? 200.00 : id === '2' ? 100.00 : id === '3' ? 50.00 : 300.00,
      date: '2025-04-15T10:00:00Z',
      status: 'completed',
      reference: 'Card payment',
      description: 'Manual wallet top-up'
    },
    {
      id: `tx-${id}-2`,
      type: 'topup',
      amount: id === '1' ? 100.00 : id === '2' ? 50.00 : id === '3' ? 0.00 : 250.00,
      date: '2025-03-10T15:30:00Z',
      status: 'completed',
      reference: 'Bank transfer',
      description: 'Manual wallet top-up'
    },
    {
      id: `tx-${id}-3`,
      type: 'payment',
      amount: id === '1' ? -50.50 : id === '2' ? -24.25 : id === '3' ? -50.00 : -9.80,
      date: '2025-04-30T14:28:30Z',
      status: 'completed',
      reference: 'Session #4589',
      description: 'Charging session payment'
    }
  ],
  userData: {
    name: id === '1' ? 'John Doe' : id === '2' ? 'Jane Doe' : id === '3' ? 'Bob Smith' : 'Alice Green',
    phone: id === '1' ? '+1 (555) 123-4567' : id === '2' ? '+1 (555) 987-6543' : id === '3' ? '+1 (555) 456-7890' : '+1 (555) 789-0123',
    joinDate: id === '1' ? '2024-12-01T00:00:00Z' : id === '2' ? '2025-01-01T00:00:00Z' : id === '3' ? '2025-02-15T00:00:00Z' : '2025-01-05T00:00:00Z',
    type: id === '1' || id === '2' ? 'personal' : 'business'
  }
});

const WalletDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wallet = getMockWallet(id || '1');

  const transactionColumns = [
    { 
      header: 'Transaction ID', 
      accessorKey: 'id',
      cell: (row: any) => <span className="font-mono text-xs">{row.id}</span>
    },
    { 
      header: 'Type', 
      accessorKey: 'type',
      cell: (row: any) => (
        <Badge variant={row.type === 'topup' ? 'success' : 'default'}>
          {row.type === 'topup' ? 'Top-up' : 'Payment'}
        </Badge>
      )
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
            row.status === 'pending' ? 'secondary' : 
            'destructive'
          }
        >
          {row.status}
        </Badge>
      )
    },
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
    navigate('/payment/wallets');
  };

  const handleTopUp = () => {
    navigate(`/payments/wallets/${id}/topup`);
  };

  const handleViewHistory = () => {
    navigate(`/payments/wallets/${id}/history`);
  };

  return (
    <PageLayout
      title={`Wallet: ${wallet.username}`}
      description="View wallet details and transaction history"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Wallets', url: '/payment/wallets' },
        { label: wallet.username, url: `/payment/wallets/${id}` }
      ]}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleTopUp}
            disabled={wallet.status !== 'active'}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Top Up
          </Button>
          {wallet.status === 'active' ? (
            <Button variant="destructive">
              <Ban className="mr-2 h-4 w-4" />
              Disable
            </Button>
          ) : (
            <Button variant="default">
              <Ban className="mr-2 h-4 w-4" />
              Enable
            </Button>
          )}
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Total Balance"
            value={formatCurrency(wallet.balance)}
            icon={<CreditCard className="h-4 w-4" />}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Available Balance"
            value={formatCurrency(wallet.availableBalance)}
            icon={<CreditCard className="h-4 w-4" />}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Pending Balance"
            value={formatCurrency(wallet.pendingBalance)}
            icon={<CreditCard className="h-4 w-4" />}
            trend={{ value: 0, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
              <CardDescription>Details about this wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    <TableCell>
                      <Badge 
                        variant={wallet.status === 'active' ? 'success' : 'secondary'}
                      >
                        {wallet.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Wallet ID</TableCell>
                    <TableCell className="font-mono">{wallet.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Currency</TableCell>
                    <TableCell>{wallet.currency}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Created On</TableCell>
                    <TableCell>{formatDate(wallet.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Last Transaction</TableCell>
                    <TableCell>{formatDate(wallet.lastTransaction)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Owner of this wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">User ID</TableCell>
                    <TableCell className="font-mono">{wallet.userId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Name</TableCell>
                    <TableCell>{wallet.userData.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell>{wallet.userEmail}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Phone</TableCell>
                    <TableCell>{wallet.userData.phone}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Account Type</TableCell>
                    <TableCell className="capitalize">{wallet.userData.type}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Button variant="outline" className="mt-4 w-full">
                <User className="mr-2 h-4 w-4" />
                View User Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleViewHistory}>
                <History className="mr-2 h-4 w-4" />
                View Full History
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <TabsContent value="recent">
            <Card>
              <CardContent className="pt-6">
                <DataTable
                  columns={transactionColumns}
                  data={wallet.transactions.slice(0, 5)}
                  keyField="id"
                  pagination={{
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: wallet.transactions.length,
                    pageSize: wallet.transactions.length,
                    onPageChange: () => {}
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="all">
            <Card>
              <CardContent className="pt-6">
                <DataTable
                  columns={transactionColumns}
                  data={wallet.transactions}
                  keyField="id"
                  pagination={{
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: wallet.transactions.length,
                    pageSize: wallet.transactions.length,
                    onPageChange: () => {}
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default WalletDetailPage;
