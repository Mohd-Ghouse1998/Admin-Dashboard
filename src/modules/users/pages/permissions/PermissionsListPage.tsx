
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePermissions } from '@/modules/users/hooks/usePermissions';
import { Column } from '@/components/ui/data-table/types';

const PermissionsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { permissions, isLoading, error, refetch } = usePermissions(searchQuery);
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = permissions?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for permissions
  const columns: Column<any>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row: any) => (
        <div className="font-medium">
          <Link to={`/users/permissions/${row.id}`} className="hover:underline text-primary">
            {row.name}
          </Link>
        </div>
      ),
    },
    {
      header: 'Code',
      accessorKey: 'codename',
      cell: (row: any) => (
        <code className="bg-muted px-1 py-0.5 rounded text-sm">
          {row.codename}
        </code>
      ),
    },
    {
      header: 'Content Type',
      accessorKey: 'content_type_name',
    },
    {
      header: 'Groups',
      accessorKey: 'group_count',
      cell: (row: any) => (
        <Badge variant="outline">
          {row.group_count || 0}
        </Badge>
      ),
    },
    {
      header: 'Users',
      accessorKey: 'user_count',
      cell: (row: any) => (
        <Badge variant="outline">
          {row.user_count || 0}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/users/permissions/${row.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
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
      title="Permissions"
      description="View system permissions"
    >
      <Helmet>
        <title>Permissions | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load permissions'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search permissions..."
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
            data={permissions?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No permissions found."
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PermissionsListPage;
