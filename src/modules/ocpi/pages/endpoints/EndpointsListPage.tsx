
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOcpiEndpoints } from '@/modules/ocpi/hooks/useOcpiEndpoints';

const EndpointsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { endpoints, isLoading, error } = useOcpiEndpoints(searchQuery);
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = endpoints?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for endpoints
  const columns = [
    {
      header: 'Identifier',
      accessorKey: 'identifier',
    },
    {
      header: 'URL',
      accessorKey: 'url',
      cell: (row: any) => (
        <div className="max-w-xs truncate">
          {row.url}
        </div>
      ),
    },
    {
      header: 'Version',
      accessorKey: 'version',
      cell: (row: any) => (
        <Badge variant="outline">
          {row.version}
        </Badge>
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
      header: 'Last Updated',
      accessorKey: 'last_updated',
      cell: (row: any) => (
        <span>{new Date(row.last_updated).toLocaleString()}</span>
      ),
    }
  ];

  return (
    <PageLayout
      title="OCPI Endpoints"
      description="Manage OCPI endpoints"
      actions={
        <Button asChild>
          <Link to="/ocpi/endpoints/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Endpoint
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>OCPI Endpoints | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load OCPI endpoints'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search endpoints..."
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
            data={endpoints?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No OCPI endpoints found."
            rowClassName="cursor-pointer"
            onRowClick={(row) => window.location.href = `/ocpi/endpoints/${row.id}`}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default EndpointsListPage;
