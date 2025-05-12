import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AlertCircle, Play, Pause, Search, Settings, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useChargers } from '@/modules/chargers/hooks/useChargers';

// UI Components
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ChargersListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, count, isLoading, error } = useChargers(searchQuery);
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = count;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define table columns for data based on the GeoJSON properties structure
  const columns = [
    {
      header: 'Charger ID',
      accessorKey: 'charger_id',
      cell: (row: any) => (
        <div className="font-medium">{row.charger_id}</div>
      ),
    },
    {
      header: 'Name/Location',
      accessorKey: 'name',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.address}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => {
        // Define status based on online status and connectors
        let status = row.online ? 'Online' : 'Offline';
        let variant: "success" | "warning" | "danger" | "info" | "neutral" = "neutral";
        
        // If the charger has connectors, show their status
        if (row.connectors && row.connectors.length > 0) {
          status = row.connectors[0].status;
          
          // Map from OCPP status to UI variant
          switch (status) {
            case 'Available':
              variant = "success";
              break;
            case 'Charging':
              variant = "info";
              break;
            case 'Preparing':
            case 'SuspendedEVSE':
            case 'SuspendedEV':
              variant = "warning";
              break;
            case 'Finishing':
              variant = "info";
              break;
            case 'Reserved':
              variant = "warning";
              break;
            case 'Unavailable':
            case 'Faulted':
              variant = "danger";
              break;
            default:
              variant = row.online ? "success" : "danger";
          }
        } else {
          // No connectors, just use online status
          variant = row.online ? "success" : "danger";
        }
        
        return (
          <div className="flex flex-col">
            <StatusBadge status={status} variant={variant} />
            {row.enabled ? 
              <span className="text-xs text-muted-foreground mt-1">Enabled</span> : 
              <span className="text-xs text-destructive mt-1">Disabled</span>
            }
          </div>
        );
      },
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row: any) => (
        <div className="text-sm">
          <div>{row.type || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">
            {row.price_per_kwh ? `₹${row.price_per_kwh}/kWh` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Model',
      accessorKey: 'model',
      cell: (row: any) => (
        <div className="text-sm">
          {row.model || 'N/A'}
          {row.vendor && <div className="text-xs text-muted-foreground">{row.vendor}</div>}
        </div>
      ),
    },
    {
      header: 'Connectors',
      accessorKey: 'connectors',
      cell: (row: any) => {
        if (!row.connectors || row.connectors.length === 0) {
          return <span className="text-muted-foreground text-sm">No connectors</span>;
        }
        
        return (
          <div className="space-y-1">
            {row.connectors.map((connector: any) => (
              <div key={connector.id} className="flex items-center text-sm">
                <div className="h-2 w-2 rounded-full mr-2" 
                  style={{ 
                    backgroundColor: connector.status === 'Available' ? 'green' : 
                      connector.status === 'Charging' ? 'blue' : 'gray'
                  }} 
                />
                <span>{connector.type} (#{connector.connector_id})</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: any) => {
        const { deleteCharger } = useChargers('');
        
        return (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/chargers/${row.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/chargers/${row.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            
            {row.enabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      // Logic to toggle enabled status would go here
                      // This would call the API to update the charger
                    }}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Disable Charger</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      // Logic to toggle enabled status would go here
                      // This would call the API to update the charger
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enable Charger</TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete charger ${row.charger_id}?`)) {
                      deleteCharger(row.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    }
  ];

  return (
    <PageLayout
      title="Charger Management"
      description="Manage EV charging stations"
      actions={
        <Button asChild>
          <Link to="/chargers/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Charger
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Chargers | Electric Flow Admin Portal</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load chargers'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4 flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, ID, or address..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        {/* Additional filters could be added here if needed */}
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage={searchQuery ? "No chargers match your search." : "No chargers found."}
            rowClassName="cursor-pointer hover:bg-accent/50 transition-colors"
            onRowClick={(row) => window.location.href = `/chargers/${row.id}`}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargersListPage;
