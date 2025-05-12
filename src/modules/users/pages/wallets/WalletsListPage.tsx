
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, Edit, Wallet, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWallets } from '@/modules/users/hooks/useWallets';
import { Column } from '@/components/ui/data-table/types';
import { formatCurrency } from '@/lib/utils';

const WalletsListPage = () => {
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { wallets, isLoading, error, refetch } = useWallets(searchQuery);
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = wallets?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for wallets
  const columns: Column<any>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'User',
      accessorKey: 'user.username',
      cell: (row: any) => (
        <div className="font-medium">
          <Link to={`/users/users/${row.user?.id}`} className="hover:underline text-primary">
            {row.user?.username || row.user?.email || 'N/A'}
          </Link>
        </div>
      ),
    },
    {
      header: 'Balance',
      accessorKey: 'balance',
      cell: (row: any) => (
        <Badge variant={row.balance > 0 ? 'success' : 'default'} className="font-semibold">
          {formatCurrency(row.balance, row.currency)}
        </Badge>
      ),
    },
    {
      header: 'Currency',
      accessorKey: 'currency',
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (row: any) => (
        <Badge variant={row.is_active ? 'success' : 'destructive'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Last Transaction',
      accessorKey: 'last_transaction_date',
      cell: (row: any) => (
        <div className="text-sm">
          {row.last_transaction_date ? new Date(row.last_transaction_date).toLocaleString() : 'N/A'}
          {row.last_transaction_type && (
            <Badge variant="outline" className="ml-2">
              {row.last_transaction_type}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/wallets/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/wallets/${row.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  return (
    <PageLayout
      title="Wallets"
      description="Manage user wallets"
      actions={
        <Button asChild>
          <Link to="/users/wallets/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Wallet
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Wallets | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load wallets'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search wallets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={wallets?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No wallets found."
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default WalletsListPage;
