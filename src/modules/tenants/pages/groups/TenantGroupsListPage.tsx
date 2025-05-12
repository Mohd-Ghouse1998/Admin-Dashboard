import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Pencil } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenantGroups } from '@/modules/tenants/hooks/useTenantGroups';

const TenantGroupsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { groups, isLoading, error } = useTenantGroups(searchQuery);
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = groups?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for groups
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Description',
      accessorKey: 'description',
    },
    {
      header: 'Members',
      accessorKey: 'members_count',
      cell: (row: any) => (
        <Badge variant="secondary">
          {row.members_count || 0}
        </Badge>
      ),
    },
    {
      header: 'Created Date',
      accessorKey: 'created_at',
      cell: (row: any) => (
        <span>{new Date(row.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/tenant/groups/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/tenant/groups/${row.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    }
  ];

  return (
    <PageLayout
      title="Groups"
      description="Manage tenant groups"
      createRoute="/tenant/groups/create"
    >
      <Helmet>
        <title>Groups | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load groups'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search groups..."
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
            data={groups?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No groups found."
            rowClassName="cursor-pointer"
            onRowClick={(row) => window.location.href = `/tenant/groups/${row.id}`}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default TenantGroupsListPage;
