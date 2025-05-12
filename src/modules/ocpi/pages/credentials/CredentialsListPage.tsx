import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOcpiCredentials } from '@/modules/ocpi/hooks/useOcpiCredentials';

const CredentialsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { credentials, isLoading, error } = useOcpiCredentials(searchQuery);
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = credentials?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for credentials
  const columns = [
    {
      header: 'Party ID',
      accessorKey: 'party_id',
    },
    {
      header: 'Country Code',
      accessorKey: 'country_code',
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (row: any) => (
        <Badge variant="outline">
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Token',
      accessorKey: 'token',
      cell: () => (
        <div className="flex items-center">
          <Lock className="h-4 w-4 mr-1" />
          <span>••••••••</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => (
        <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: any) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/ocpi/credentials/${row.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
      ),
    }
  ];

  return (
    <PageLayout
      title="OCPI Credentials"
      description="Manage OCPI credentials"
      actions={
        <Button asChild>
          <Link to="/ocpi/credentials/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Credentials
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>OCPI Credentials | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load OCPI credentials'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search credentials..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={credentials?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No OCPI credentials found."
            rowClassName="cursor-pointer"
            onRowClick={(row) => window.location.href = `/ocpi/credentials/${row.id}`}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CredentialsListPage;
