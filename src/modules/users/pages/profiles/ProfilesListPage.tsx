
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
import { AlertCircle, Search, Eye, Edit, User, Plus } from 'lucide-react';
import { useProfiles } from '@/modules/users/hooks/useProfiles';
import { Column } from '@/components/ui/data-table/types';
import { formatDate } from '@/lib/utils';
import { UserProfile } from '@/modules/users/services/profileService';

const ProfilesListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use our new profiles hook
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    listProfiles,
    refreshData
  } = useProfiles();
  
  // Get profiles list
  const { data, isLoading, error } = listProfiles();
  
  // Extract profiles from the paginated response
  const profiles = data?.results || [];
  
  // Compute pagination values from the API response
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refreshData();
  };

  // Filter profiles based on search query if needed
  const filteredProfiles = searchQuery
    ? profiles.filter((profile: UserProfile) =>
        profile.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.state?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : profiles;

  // Define table columns for profiles
  const columns: Column<any>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'User',
      accessorKey: 'user',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{row.user}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone_number',
      cell: (row) => (
        <div className="flex items-center">
          <div>{row.phone_number || 'Not provided'}</div>
          {row.is_phone_verified && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              Verified
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'City',
      accessorKey: 'city',
      cell: (row) => row.city || 'Not provided',
    },
    {
      header: 'State',
      accessorKey: 'state',
      cell: (row) => row.state || 'Not provided',
    },
    {
      header: 'OCPI Role',
      accessorKey: 'ocpi_role',
      cell: (row) => {
        const role = row.ocpi_role;
        return role ? (
          <Badge variant={role === 'CPO' ? 'outline' : 'secondary'}>
            {role}
          </Badge>
        ) : 'Not assigned';
      },
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button asChild size="icon" variant="outline">
            <Link to={`/users/profiles/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="outline">
            <Link to={`/users/profiles/${row.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      title="Profiles"
      description="Manage user profiles"
      actions={
        <Button asChild>
          <Link to="/users/profiles/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Profile
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Profiles | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load profiles'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search profiles..."
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
            data={filteredProfiles}
            isLoading={isLoading}
            keyField="id"
            pagination={{
              currentPage: currentPage,
              totalPages: totalPages,
              totalItems: totalItems,
              pageSize: pageSize,
              onPageChange: handlePageChange
            }}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ProfilesListPage;
