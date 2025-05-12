import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, Info, Plus, MoreHorizontal, Sliders, Plug, Power } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { connectorApi } from '@/modules/chargers/services/connectorService';
import { useConnectors } from '@/modules/chargers/hooks/useConnectors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Status colors based on connector status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'bg-green-500';
    case 'Preparing':
    case 'SuspendedEV':
    case 'SuspendedEVSE':
      return 'bg-yellow-500';
    case 'Charging':
      return 'bg-blue-500';
    case 'Finishing':
      return 'bg-purple-500';
    case 'Reserved':
      return 'bg-orange-500';
    case 'Unavailable':
    case 'Faulted':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Connector type badges
const getConnectorTypeBadge = (type: string) => {
  switch (type) {
    case 'CCS1':
    case 'CCS2':
      return <Badge variant="outline" className="font-normal">CCS {type.slice(-1)}</Badge>;
    case 'CHAdeMO':
      return <Badge variant="outline" className="font-normal">CHAdeMO</Badge>;
    case 'Type1':
    case 'Type2':
      return <Badge variant="outline" className="font-normal">Type {type.slice(-1)}</Badge>;
    default:
      return <Badge variant="outline" className="font-normal">{type || 'Unknown'}</Badge>;
  }
};

const ConnectorsListPage = () => {
  // State for filters
  const [chargerId, setChargerId] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  
  // Get auth context and toast
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use custom hook for fetching connectors with filters
  const filters = {
    charger: chargerId,
    status: statusFilter,
    type: typeFilter
  };
  
  const {
    connectors,
    isLoading,
    error,
    pagination: { currentPage, setCurrentPage, totalPages, totalItems }
  } = useConnectors(filters);
  
  // Reset all filters
  const resetFilters = () => {
    setChargerId(undefined);
    setStatusFilter(undefined);
    setTypeFilter(undefined);
  };
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => connectorApi.deleteConnector(accessToken, id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Connector successfully deleted.",
      });
      // Refresh the data
      queryClient.invalidateQueries({
        queryKey: ["connectors"],
      });
    },
    onError: (error: any) => {
      console.error('Error deleting connector:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to delete connector. Please try again.",
      });
    },
  });
  
  // Map UI status to API availability type
  const mapStatusToAvailability = (status: string): 'Operative' | 'Inoperative' => {
    return status === 'Available' ? 'Operative' : 'Inoperative';
  };
  
  // Change availability mutation
  const changeAvailabilityMutation = useMutation({
    mutationFn: ({ id, connectorId, chargerId, status }: { 
      id: string, 
      connectorId: number,
      chargerId: string | number,
      status: string
    }) => {
      // Map UI status to API availability type
      const type = mapStatusToAvailability(status);
      
      return connectorApi.changeAvailability(
        accessToken, 
        id, 
        { 
          type, 
          connector_id: connectorId, 
          charger_id: String(chargerId)
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Connector availability changed successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["connectors"],
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to change connector availability.",
      });
    },
  });
  
  return (
    <PageLayout
      title="Charger Connectors"
      description="Manage and monitor charging connectors"
      createRoute="/chargers/connectors/create"
    >
      <Helmet>
        <title>Charger Connectors | Electric Flow Admin</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load connectors'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter by ID..."
              className="pl-8 md:w-64 lg:w-80"
              onChange={(e) => setChargerId(e.target.value || undefined)}
              value={chargerId || ''}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm" className="h-10" onClick={resetFilters}>
            Reset Filters
          </Button>
          <Button size="sm" className="h-10" asChild>
            <Link to="/chargers/connectors/create">
              <Plus className="mr-2 h-4 w-4" />
              New Connector
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Filter options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Charger ID</label>
          <Input
            placeholder="Filter by charger"
            value={chargerId || ''}
            onChange={(e) => setChargerId(e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Unavailable">Unavailable</SelectItem>
              <SelectItem value="Charging">Charging</SelectItem>
              <SelectItem value="Faulted">Faulted</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="SuspendedEVSE">Suspended (EVSE)</SelectItem>
              <SelectItem value="SuspendedEV">Suspended (EV)</SelectItem>
              <SelectItem value="Finishing">Finishing</SelectItem>
              <SelectItem value="Preparing">Preparing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Connector Type</label>
          <Select
            value={typeFilter || 'all'}
            onValueChange={(value) => setTypeFilter(value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CCS1">CCS1</SelectItem>
              <SelectItem value="CCS2">CCS2</SelectItem>
              <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
              <SelectItem value="Type1">Type1</SelectItem>
              <SelectItem value="Type2">Type2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading connectors...</p>
                </div>
              </div>
            ) : connectors?.results && connectors.results.length > 0 ? (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="p-3 text-left font-medium">ID</th>
                      <th className="p-3 text-left font-medium">Charger</th>
                      <th className="p-3 text-left font-medium">Connector ID</th>
                      <th className="p-3 text-left font-medium">Type</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connectors.results.map((connector) => (
                      <tr key={connector.id} className="hover:bg-muted/50 border-b">
                        <td className="p-3 font-medium">{connector.id}</td>
                        <td className="p-3">
                          <Link 
                            to={`/chargers/chargers/${connector.charger}`}
                            className="text-primary hover:underline"
                          >
                            {connector.charger}
                          </Link>
                        </td>
                        <td className="p-3">{connector.connector_id}</td>
                        <td className="p-3">
                          {getConnectorTypeBadge(connector.type)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(connector.status)}`}></div>
                            <span>{connector.status}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/chargers/connectors/${connector.id}`}>
                                <Info className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/chargers/connectors/${connector.id}/edit`}>
                                <Sliders className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    const newStatus = connector.status === 'Available' ? 'Unavailable' : 'Available';
                                    changeAvailabilityMutation.mutate({
                                      id: connector.id.toString(),
                                      connectorId: connector.connector_id,
                                      chargerId: connector.charger,
                                      status: newStatus
                                    });
                                  }}
                                >
                                  <Power className="h-4 w-4 mr-2" />
                                  {connector.status === 'Available' ? 'Make Unavailable' : 'Make Available'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete this connector?`)) {
                                      deleteMutation.mutate(connector.id.toString());
                                    }
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination controls */}
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{connectors.results.length}</span> of{' '}
                      <span className="font-medium">{connectors.count}</span> items
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1 || !connectors.previous}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!connectors.next || currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No connectors found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ConnectorsListPage;
