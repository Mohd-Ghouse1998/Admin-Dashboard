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
import { AlertCircle, Search, Eye, Edit, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Column } from '@/components/ui/data-table/types';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock service for promotions - replace with actual service when available
const promotionService = {
  getPromotions: async (accessToken: string, page = 1, search = '') => {
    // This would be replaced with an actual API call
    return {
      count: 10,
      next: null,
      previous: null,
      results: [
        {
          id: '1',
          name: 'Summer Discount',
          code: 'SUMMER25',
          description: 'Get 25% off on all charging sessions during summer',
          discount_type: 'percentage',
          discount_value: 25,
          start_date: '2025-06-01T00:00:00Z',
          end_date: '2025-08-31T23:59:59Z',
          active: true,
          created_at: '2025-05-01T10:00:00Z',
          updated_at: '2025-05-01T10:00:00Z'
        },
        {
          id: '2',
          name: 'Welcome Gift',
          code: 'WELCOME10',
          description: 'Get $10 off on your first charging session',
          discount_type: 'fixed',
          discount_value: 10,
          start_date: '2025-01-01T00:00:00Z',
          end_date: '2025-12-31T23:59:59Z',
          active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        // Add more mock data as needed
      ]
    };
  }
};

const PromotionsListPage = () => {
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    data: promotions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['promotions', searchQuery, currentPage],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return promotionService.getPromotions(accessToken, currentPage, searchQuery);
    },
    enabled: !!accessToken,
  });
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = promotions?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for promotions
  const columns: Column<any>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row: any) => (
        <div className="font-medium">
          <Link to={`/users/promotions/${row.id}`} className="hover:underline text-primary">
            {row.name}
          </Link>
        </div>
      ),
    },
    {
      header: 'Code',
      accessorKey: 'code',
      cell: (row: any) => <span className="font-mono">{row.code}</span>,
    },
    {
      header: 'Discount',
      accessorKey: 'discount_value',
      cell: (row: any) => {
        if (row.discount_type === 'percentage') {
          return <span>{row.discount_value}%</span>;
        } else {
          return <span>{formatCurrency(row.discount_value, 'USD')}</span>;
        }
      },
    },
    {
      header: 'Valid Period',
      accessorKey: 'start_date',
      cell: (row: any) => (
        <div className="text-sm">
          <div>{formatDate(row.start_date)}</div>
          <div>to</div>
          <div>{formatDate(row.end_date)}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: (row: any) => {
        const isActive = row.active && 
          new Date(row.start_date) <= new Date() && 
          new Date(row.end_date) >= new Date();
        
        return (
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/promotions/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/promotions/${row.id}/edit`}>
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
      title="Promotions"
      description="Manage discount codes and promotional offers"
      actions={
        <Button asChild>
          <Link to="/users/promotions/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Promotions | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load promotions'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search promotions..."
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
            data={promotions?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No promotions found."
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PromotionsListPage;
