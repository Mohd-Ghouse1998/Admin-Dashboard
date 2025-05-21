import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Plug, Power } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { connectorApi } from '@/modules/chargers/services/connectorService';
import { useConnectors } from '@/modules/chargers/hooks/useConnectors';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Get auth context and toast
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use custom hook for fetching connectors with filters
  const filters = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined
  };
  
  const {
    connectors,
    isLoading,
    error
  } = useConnectors(filters);
  
  const connectorsData = connectors?.results || [];
  const totalItems = connectors?.count || 0;
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
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
  
  // Filters component - Status and Type selectors
  const filtersComponent = (
    <div className="flex flex-wrap gap-3">
      <select
        id="status-filter"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background"
      >
        <option value="all">All Statuses</option>
        <option value="Available">Available</option>
        <option value="Unavailable">Unavailable</option>
        <option value="Charging">Charging</option>
        <option value="Faulted">Faulted</option>
        <option value="Reserved">Reserved</option>
      </select>
      
      <select
        id="type-filter"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background"
      >
        <option value="all">All Types</option>
        <option value="CCS1">CCS1</option>
        <option value="CCS2">CCS2</option>
        <option value="CHAdeMO">CHAdeMO</option>
        <option value="Type1">Type1</option>
        <option value="Type2">Type2</option>
      </select>
    </div>
  );
  
  // Delete confirmation dialog component
  const confirmDeleteComponent = (
    <AlertDialog open={!!selectedConnectorId} onOpenChange={(open) => !open && setSelectedConnectorId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this connector?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the connector and remove it from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            if (selectedConnectorId) {
              deleteMutation.mutate(selectedConnectorId);
              setSelectedConnectorId(null);
            }
          }}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  
  // Define row actions for each connector
  const rowActions = (connector: any) => [
    {
      label: connector.status === 'Available' ? 'Make Unavailable' : 'Make Available',
      icon: <Power className="h-4 w-4" />,
      onClick: () => {
        const newStatus = connector.status === 'Available' ? 'Unavailable' : 'Available';
        changeAvailabilityMutation.mutate({
          id: connector.id.toString(),
          connectorId: connector.connector_id,
          chargerId: connector.charger,
          status: newStatus
        });
      }
    },
    {
      label: 'Delete',
      className: 'text-destructive focus:text-destructive',
      onClick: () => setSelectedConnectorId(connector.id.toString())
    }
  ];
  
  // Define columns for the connector list
  const columns: Column<any>[] = [
    {
      header: "ID",
      key: "id",
      render: (connector) => connector.id
    },
    {
      header: "Connector ID",
      key: "connector_id",
      render: (connector) => connector.connector_id
    },
    {
      header: "Status",
      key: "status",
      render: (connector) => (
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(connector.status)}`}></div>
          {connector.status}
        </div>
      )
    },
    {
      header: "Type",
      key: "type",
      render: (connector) => connector.type || 'Unknown'
    },
    {
      header: "Power",
      key: "max_power",
      render: (connector) => connector.max_power ? `${connector.max_power} kW` : 'N/A'
    },
    {
      header: "Charger",
      key: "charger",
      render: (connector) => connector.charger || 'N/A'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Connectors | EV Admin</title>
      </Helmet>
      
      {confirmDeleteComponent}
      
      <ListTemplate
        title="Connectors"
        icon={<Plug className="h-5 w-5" />}
        description="View and manage EV charging connectors"
        data={connectorsData}
        isLoading={isLoading}
        error={error ? "Failed to load connectors" : null}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search connectors..."
        filterComponent={filtersComponent}
        createPath="/chargers/connectors/create"
        createButtonText="New Connector"
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onRowClick={(connector) => navigate(`/chargers/connectors/${connector.id}`)}
        rowActions={(connector) => (
          <div className="flex items-center space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={(e) => {
                e.stopPropagation();
                const newStatus = connector.status === 'Available' ? 'Unavailable' : 'Available';
                changeAvailabilityMutation.mutate({
                  id: connector.id.toString(),
                  connectorId: connector.connector_id,
                  chargerId: connector.charger,
                  status: newStatus
                });
              }}
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-destructive hover:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedConnectorId(connector.id.toString());
              }}
            >
              Delete
            </Button>
          </div>
        )}
        className="shadow-md border border-gray-100 rounded-lg overflow-hidden"
        tableClassName="[&_tr:hover]:bg-gray-50/80 [&_th]:bg-gray-50/70 [&_th]:text-gray-600 [&_th]:font-medium"
        actionBarClassName="border-b border-gray-100 bg-gray-50/40"
      />
    </>
  );
};

export default ConnectorsListPage;
