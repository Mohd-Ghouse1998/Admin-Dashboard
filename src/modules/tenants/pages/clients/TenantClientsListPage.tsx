
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, Edit, Trash2, Plus, MoreHorizontal } from 'lucide-react';
import { useTenantClients } from '../../hooks/useTenantClients';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TenantClientsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { 
    clients, 
    isLoading, 
    error,
    deleteClient,
    isLoadingDelete
  } = useTenantClients(searchQuery);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (clientId: number) => {
    setSelectedClientId(clientId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedClientId) {
      try {
        await deleteClient(selectedClientId);
        setIsDeleteDialogOpen(false);
        setSelectedClientId(null);
        
        toast({
          title: "Client deleted",
          description: "The tenant client has been successfully deleted.",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete client",
          variant: "destructive",
        });
      }
    }
  };

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Schema Name',
      accessorKey: 'schema_name',
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (row: any) => (
        <Badge variant="outline" className={row.is_active ? 
          'bg-green-100 text-green-800 border-green-300' : 
          'bg-red-100 text-red-800 border-red-300'
        }>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Domain Count',
      accessorKey: 'domains',
      cell: (row: any) => row.domains?.length || 0,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to={`/tenants/clients/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to={`/tenants/clients/${row.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/tenants/clients/${row.id}`} className="w-full cursor-pointer">View details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/tenants/clients/${row.id}/edit`} className="w-full cursor-pointer">Edit client</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => handleDeleteClick(row.id)}
              >
                Delete client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      title="Tenant Clients"
      description="View and manage tenant clients"
    >
      <Helmet>
        <title>Tenant Clients | Admin Dashboard</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Button asChild>
          <Link to="/tenants/clients/create">
            <Plus className="h-4 w-4 mr-1" />
            New Client
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={clients?.results || []}
            pagination={{
              currentPage,
              pageSize: clients?.page_size || 10,
              totalPages: Math.ceil((clients?.count || 0) / (clients?.page_size || 10)),
              totalItems: clients?.count || 0,
              onPageChange: setCurrentPage,
            }}
            isLoading={isLoading}
            keyField="id"
            emptyMessage="No tenant clients found."
            rowClassName="cursor-pointer"
            onRowClick={(row) => window.location.href = `/tenants/clients/${row.id}`}
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the tenant
              client and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoadingDelete}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoadingDelete}
            >
              {isLoadingDelete ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default TenantClientsListPage;
