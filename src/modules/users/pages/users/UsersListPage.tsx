
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Pencil, Trash2, Filter } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsers } from '@/modules/users/hooks/useUsers';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Column } from '@/components/ui/data-table';

const UsersListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { toast } = useToast();

  // Fetch users with API integration
  const { users, isLoading, error, deleteUser } = useUsers();
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = users?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Handle user deletion
  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to get role badge color
  const getRoleBadge = (role: string | undefined) => {
    // Add null check for role
    if (!role) {
      return <StatusBadge status="User" variant="info" />;
    }
    
    switch (role.toLowerCase()) {
      case 'admin':
        return <StatusBadge status="Admin" variant="danger" />;
      case 'manager':
        return <StatusBadge status="Manager" variant="warning" />;
      case 'user':
        return <StatusBadge status="User" variant="info" />;
      default:
        return <StatusBadge status={role} variant="neutral" />;
    }
  };

  // Define table columns for users based on the API response structure
  const columns: Column<any>[] = [
    {
      header: 'Username',
      accessorKey: 'username',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{row.username}</div>
          <div className="text-sm text-muted-foreground">{row.email || 'No email'}</div>
        </div>
      ),
    },
    {
      header: 'Name',
      accessorKey: 'first_name',
      cell: (row: any) => (
        <div>
          {row.first_name} {row.last_name}
        </div>
      ),
    },
    {
      header: 'Contact',
      accessorKey: 'profile.phone_number',
      cell: (row: any) => (
        <div>
          <div>{row.profile?.phone_number || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">
            {row.profile?.city}{row.profile?.state ? `, ${row.profile.state}` : ''} {row.profile?.pin || ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Verification',
      accessorKey: 'profile.is_phone_verified',
      cell: (row: any) => (
        <div className="space-y-1">
          <div>
            Phone: {row.profile?.is_phone_verified ? 
              <StatusBadge status="Verified" variant="success" /> : 
              <StatusBadge status="Unverified" variant="neutral" />}
          </div>
          <div>
            Email: {row.profile?.is_email_verified ? 
              <StatusBadge status="Verified" variant="success" /> : 
              <StatusBadge status="Unverified" variant="neutral" />}
          </div>
        </div>
      ),
    },
    {
      header: 'OCPI',
      accessorKey: 'profile.ocpi_role',
      cell: (row: any) => (
        <div>
          {row.profile?.ocpi_role ? 
            <StatusBadge 
              status={row.profile.ocpi_role} 
              variant={row.profile.ocpi_role === 'CPO' ? 'info' : 'warning'} 
            /> : 'N/A'}
        </div>
      ),
    },
    {
      header: 'Verification',
      accessorKey: 'profile.is_phone_verified',
      cell: (row: any) => (
        <div className="space-y-1">
          <div>
            Phone: {row.profile?.is_phone_verified ? 
              <StatusBadge status="Verified" variant="success" /> : 
              <StatusBadge status="Unverified" variant="neutral" />}
          </div>
          <div>
            Email: {row.profile?.is_email_verified ? 
              <StatusBadge status="Verified" variant="success" /> : 
              <StatusBadge status="Unverified" variant="neutral" />}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (row: any) => {
        return row.is_active ? 
          <StatusBadge status="Active" variant="success" /> : 
          <StatusBadge status="Inactive" variant="neutral" />;
      },
    },
    {
      header: 'Last Login',
      accessorKey: 'last_login',
      cell: (row: any) => (
        <span>
          {row.last_login ? new Date(row.last_login).toLocaleString() : 'Never'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/users/${row.id}`}>
                <Eye className="h-4 w-4 mr-2" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/users/${row.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteUser(row.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }
  ];

  // Handle status filter change
  const handleStatusFilterChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <PageLayout
      title="Users"
      description="Manage user accounts and profiles"
      createRoute="/users/create"
    >
      <Helmet>
        <title>Users | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load users'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="relative md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name, email, or phone..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" /> 
                {statusFilter === 'all' ? 'All Users' : 
                 statusFilter === 'active' ? 'Active Users' : 'Inactive Users'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusFilterChange('all')}>
                All Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilterChange('active')}>
                Active Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilterChange('inactive')}>
                Inactive Users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={users?.results || []} 
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages: Math.ceil((users?.count || 0) / 10),
              totalItems: users?.count || 0,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No users found."
            rowClassName="cursor-pointer"
            onRowClick={(row) => window.location.href = `/users/${row.id}`}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default UsersListPage;
