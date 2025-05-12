import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { OCPIApiService } from '../../services';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';
import { OCPIConnection } from '../../types/ocpiTypes';

// Define our own column type since we don't have access to @tanstack/react-table
type ColumnDef<T> = {
  accessorKey?: string;
  id?: string;
  header: string;
  cell?: (props: { row: { original: T; getValue: (key: string) => any } }) => React.ReactNode;
};

// Connection status types
type ConnectionStatus = 'active' | 'pending' | 'inactive' | 'error';

// Connection registration is now handled by the ConnectionRegistrationPage

const ConnectionsPage = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { role } = useOCPIRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      return await OCPIApiService.common.connections.delete(connectionId);
    },
    onSuccess: () => {
      toast({
        title: 'Connection Deleted',
        description: 'The connection has been successfully removed.',
      });
      // Refresh connections list
      queryClient.invalidateQueries({ queryKey: ['ocpi-connections'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete connection: ${error?.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      // Use the connections test endpoint from our unified API service
      return await OCPIApiService.common.connections.test(connectionId);
    },
    onSuccess: () => {
      toast({
        title: 'Connection Test',
        description: 'The connection test was successful.',
      });
      // Refresh connections list to update status
      queryClient.invalidateQueries({ queryKey: ['ocpi-connections'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Test Failed',
        description: `Connection test failed: ${error?.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });
  
  // Fetch connections
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery<OCPIConnection[]>({
    queryKey: ['ocpi-connections', role],
    queryFn: async () => {
      try {
        const response = await OCPIApiService.common.connections.getAll();
        
        // Handle different response formats
        if (Array.isArray(response)) {
          // Direct array response
          return response;
        } else if (response && response.data) {
          // Handle nested response structure
          if (Array.isArray(response.data)) {
            // If response.data is the array
            return response.data;
          } else if (response.data.connections && Array.isArray(response.data.connections)) {
            // If response.data.connections is the array (current API format)
            return response.data.connections;
          }
        }
        
        // If we couldn't find the connections array, log and return empty
        console.warn('Unexpected response format from connections API:', response);
        return [];
      } catch (error) {
        console.error('Failed to fetch connections:', error);
        throw error;
      }
    },
    // Don't refetch on window focus to minimize API calls
    refetchOnWindowFocus: false
  });

  // Define columns for the data table
  const columns: ColumnDef<OCPIConnection>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'party_id',
      header: 'Party ID',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.party_id}</span>
          <span className="text-xs text-muted-foreground">{row.original.country_code}</span>
        </div>
      )
    },
    {
      accessorKey: 'country_code',
      header: 'Country',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => <span>{row.original.role || 'unknown'}</span>
    },
    {
      accessorKey: 'version',
      header: 'OCPI Version',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status || 'unknown';
        return (
          <Badge 
            variant={status === 'active' ? 'default' : 
                   status === 'pending' ? 'outline' : 
                   status === 'error' ? 'destructive' : 'secondary'}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const connection = row.original;
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testConnectionMutation.mutate(connection.id)}
              disabled={testConnectionMutation.isPending}
            >
              Test
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this connection?')) {
                  deleteConnectionMutation.mutate(connection.id);
                }
              }}
              disabled={deleteConnectionMutation.isPending}
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <PageLayout title="OCPI Connections" description="Manage your OCPI connections with other parties">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Connections</CardTitle>
              <CardDescription>
                Your established connections with other OCPI parties
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => refetch()} 
                variant="outline"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <div className="flex space-x-2">
                <Link to="/ocpi/connections/register">
                  <Button 
                    className="flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Register New Connection
                  </Button>
                </Link>
                
                <Link to="/ocpi/connections/simplified">
                  <Button variant="outline">
                    Simplified Version
                  </Button>
                </Link>
                
                <Link to="/ocpi/connections/diagnostic">
                  <Button variant="outline">
                    Diagnostics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">Loading connections...</div>
          ) : error ? (
            <div className="text-red-500 p-6">
              Error loading connections. Please try refreshing.
            </div>
          ) : !data || !Array.isArray(data) || data.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No connections found. Create a new connection to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.id || column.accessorKey}>{column.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((connection, i) => (
                  <TableRow key={connection.id || i}>
                    {columns.map((column) => (
                      <TableCell key={column.id || column.accessorKey}>
                        {column.cell 
                          ? column.cell({ 
                              row: { 
                                original: connection, 
                                getValue: (key) => connection[key as keyof OCPIConnection] 
                              } 
                            })
                          : column.accessorKey 
                            ? connection[column.accessorKey as keyof OCPIConnection] 
                            : null
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ConnectionsPage;
