import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, Eye, Edit, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { planService } from '@/services/planService';
import { Column } from '@/components/ui/data-table/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const PlanUsersListPage = () => {
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    data: planUsers,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['plan-users', searchQuery, currentPage],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return planService.getPlanUsers(accessToken, currentPage);
    },
    enabled: !!accessToken,
  });
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = planUsers?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for plan users
  const columns: Column<any>[] = [
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
      header: 'Plan',
      accessorKey: 'plan.name',
      cell: (row: any) => (
        <Link to={`/users/plans/${row.plan?.id}`} className="hover:underline text-primary">
          {row.plan?.name || 'N/A'}
        </Link>
      ),
    },
    {
      header: 'Price',
      accessorKey: 'plan.price',
      cell: (row: any) => (
        <div>
          {row.plan ? formatCurrency(row.plan.price, row.plan.currency) : 'N/A'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => {
        const getVariant = (status: string) => {
          switch (status) {
            case 'active': return 'success';
            case 'canceled': return 'destructive';
            case 'expired': return 'secondary';
            default: return 'secondary';
          }
        };
        
        return (
          <Badge variant={getVariant(row.status)}>
            {row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || 'Unknown'}
          </Badge>
        );
      },
    },
    {
      header: 'Start Date',
      accessorKey: 'start_date',
      cell: (row: any) => formatDate(row.start_date),
    },
    {
      header: 'End Date',
      accessorKey: 'end_date',
      cell: (row: any) => row.end_date ? formatDate(row.end_date) : 'N/A',
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/plan-users/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/plan-users/${row.id}/edit`}>
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
      title="Plan Subscriptions"
      description="Manage user plan subscriptions"
      actions={
        <Button asChild>
          <Link to="/users/plan-users/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Subscription
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Plan Subscriptions | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load plan subscriptions'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search subscriptions..."
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
            data={planUsers?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No plan subscriptions found."
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PlanUsersListPage;
