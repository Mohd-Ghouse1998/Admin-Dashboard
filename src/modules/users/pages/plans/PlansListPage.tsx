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
import { AlertCircle, Search, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { planService } from '@/services/planService';
import { Column } from '@/components/ui/data-table/types';
import { formatCurrency } from '@/lib/utils';
import { Plan } from '@/services/planService';

const PlansListPage = () => {
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    data: plans,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['plans', searchQuery, currentPage],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return planService.getPlans(accessToken, currentPage);
    },
    enabled: !!accessToken,
  });
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = plans?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for plans
  const columns: Column<Plan>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row: any) => (
        <div className="font-medium">
          <Link to={`/users/plans/${row.id}`} className="hover:underline text-primary">
            {row.name}
          </Link>
        </div>
      ),
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: (row: any) => (
        <div>{formatCurrency(row.price, row.currency)}</div>
      ),
    },
    {
      header: 'Billing Cycle',
      accessorKey: 'billing_cycle',
      cell: (row: any) => (
        <Badge variant="outline" className="capitalize">
          {row.billing_cycle ? row.billing_cycle.replace('_', ' ') : 'N/A'}
        </Badge>
      ),
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
      header: 'Subscribers',
      accessorKey: 'subscribers_count',
      cell: (row: any) => (
        <div className="text-center">
          {row.subscribers_count || 0}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/plans/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/plans/${row.id}/edit`}>
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
      title="Plans"
      description="Manage subscription plans"
      actions={
        <Button asChild>
          <Link to="/users/plans/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Plans | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load plans'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search plans..."
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
            data={plans?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No plans found."
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PlansListPage;
