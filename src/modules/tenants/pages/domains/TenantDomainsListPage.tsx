
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge'; // Add import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenantDomains } from '@/modules/tenants/hooks/useTenantDomains';

const TenantDomainsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { domains, isLoading, error } = useTenantDomains(searchQuery);
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = domains?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Function to get domain status badge
  const getDomainStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <StatusBadge status="Verified" variant="success" />;
      case 'pending':
        return <StatusBadge status="Pending" variant="warning" />;
      case 'rejected':
        return <StatusBadge status="Rejected" variant="danger" />;
      default:
        return <StatusBadge status={status} variant="neutral" />;
    }
  };

  // Define table columns for domains
  const columns = [
    {
      header: 'Domain Name',
      accessorKey: 'domain',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{row.domain}</div>
          <div className="text-xs text-gray-500">Added: {new Date(row.created_at).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => getDomainStatusBadge(row.status),
    },
    {
      header: 'Client',
      accessorKey: 'client_name',
      cell: (row: any) => (
        <Badge variant="outline">
          {row.client_name || 'None'}
        </Badge>
      ),
    },
    {
      header: 'Apps',
      accessorKey: 'apps_count',
      cell: (row: any) => (
        <Badge variant="secondary">
          {row.apps_count || 0} App{row.apps_count !== 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      header: 'Verified At',
      accessorKey: 'verified_at',
      cell: (row: any) => (
        <div>
          {row.verified_at ? new Date(row.verified_at).toLocaleString() : 'Not verified'}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions', // Add accessorKey to fix type errors
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/tenant/domains/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/tenant/domains/${row.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <PageLayout
      title="Domains"
      description="Manage tenant domains"
      createRoute="/tenant/domains/create"
    >
      <Helmet>
        <title>Domains | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load domains'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search domains..."
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
            data={domains?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No domains found."
            rowClassName="cursor-pointer"
            onRowClick={(row) => window.location.href = `/tenant/domains/${row.id}`}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default TenantDomainsListPage;
