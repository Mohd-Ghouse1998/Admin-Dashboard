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
import { Column } from '@/components/ui/data-table/types';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock service for session billings - replace with actual service when available
const sessionBillingService = {
  getSessionBillings: async (accessToken: string, page = 1, search = '') => {
    // This would be replaced with an actual API call
    return {
      count: 10,
      next: null,
      previous: null,
      results: [
        {
          id: '1',
          user: { id: '1', username: 'user1' },
          session_id: 'SESSION123',
          amount: 125.50,
          start_time: '2025-04-25T10:00:00Z',
          end_time: '2025-04-25T11:30:00Z',
          status: 'paid',
          created_at: '2025-04-25T11:35:00Z',
          updated_at: '2025-04-25T11:40:00Z'
        },
        // Add more mock data as needed
      ]
    };
  }
};

const SessionBillingsListPage = () => {
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    data: sessionBillings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['session-billings', searchQuery, currentPage],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return sessionBillingService.getSessionBillings(accessToken, currentPage, searchQuery);
    },
    enabled: !!accessToken,
  });
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = sessionBillings?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for session billings
  const columns: Column<any>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="font-medium">
          <Link to={`/users/session-billings/${row.id}`} className="hover:underline text-primary">
            {row.id}
          </Link>
        </div>
      ),
    },
    {
      header: 'User',
      accessorKey: 'user.username',
      cell: (row: any) => (
        <Link to={`/users/users/${row.user?.id}`} className="hover:underline text-primary">
          {row.user?.username || 'N/A'}
        </Link>
      ),
    },
    {
      header: 'Session ID',
      accessorKey: 'session_id',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: any) => formatCurrency(row.amount, 'USD'),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => {
        const getVariant = (status: string) => {
          switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'secondary';
            case 'failed': return 'destructive';
            default: return 'secondary';
          }
        };
        
        return (
          <Badge variant={getVariant(row.status)}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: 'Start Time',
      accessorKey: 'start_time',
      cell: (row: any) => formatDate(row.start_time),
    },
    {
      header: 'End Time',
      accessorKey: 'end_time',
      cell: (row: any) => formatDate(row.end_time),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/session-billings/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/session-billings/${row.id}/edit`}>
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
      title="Session Billings"
      description="Manage charging session billing records"
      actions={
        <Button asChild>
          <Link to="/users/session-billings/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Billing
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Session Billings | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load session billings'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search session billings..."
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
            data={sessionBillings?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No session billings found."
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default SessionBillingsListPage;
