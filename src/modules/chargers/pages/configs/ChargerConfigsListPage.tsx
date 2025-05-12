
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, Settings, MoreHorizontal, Sliders, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChargerConfigs } from '@/modules/chargers/hooks/useChargerConfigs';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const ChargerConfigsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [chargerIdFilter, setChargerIdFilter] = useState<string | undefined>();
  const [keyFilter, setKeyFilter] = useState<string | undefined>();
  const [readonlyFilter, setReadonlyFilter] = useState<boolean | undefined>();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  const { chargerConfigs, isLoading, error, refetch } = useChargerConfigs(
    searchQuery,
    chargerIdFilter,
    keyFilter,
    readonlyFilter
  );
  
  // Debug data
  useEffect(() => {
    // Data is now working properly with the correct API path
  }, [chargerConfigs]);
  
  // Reset filters
  const resetFilters = () => {
    setChargerIdFilter(undefined);
    setKeyFilter(undefined);
    setReadonlyFilter(undefined);
    setSearchQuery('');
  };
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = chargerConfigs?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => chargerApi.deleteChargerConfig(accessToken, id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Configuration successfully deleted.",
      });
      // Refresh the data
      queryClient.invalidateQueries({
        queryKey: ["chargerConfigs"],
      });
    },
    onError: (error: any) => {
      console.error('Error deleting charger config:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to delete configuration. Please try again.",
      });
    },
  });

  // Define table columns for charger configs
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.id}</span>;
      },
    },
    {
      header: 'Charger ID',
      accessorKey: 'charger',
      cell: ({ row }) => {
        return <span>{row.original.charger}</span>;
      },
    },
    {
      header: 'Configuration Key',
      accessorKey: 'key',
      cell: ({ row }) => {
        return (
          <div className="font-medium">{row.original.key}</div>
        );
      },
    },
    {
      header: 'Value',
      accessorKey: 'value',
      cell: ({ row }) => {
        return <span>{row.original.value}</span>;
      },
    },
    {
      header: 'Read Only',
      accessorKey: 'readonly',
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.readonly ? "secondary" : "outline"}>
            {row.original.readonly ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/chargers/configs/${row.original.id}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/chargers/configs/edit/${row.original.id}`}>
                  <Sliders className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete this configuration: ${row.original.key}?`)) {
                    deleteMutation.mutate(row.original.id.toString());
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }
  ];

  return (
    <PageLayout
      title="Charger Configurations"
      description="Manage charger configurations"
      createRoute="/chargers/configs/create"
    >
      <Helmet>
        <title>Charger Configurations | Electric Flow Admin</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load charger configurations'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search configurations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select 
            value={chargerIdFilter || "all"} 
            onValueChange={(val) => setChargerIdFilter(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Charger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chargers</SelectItem>
              <SelectItem value="1">Charger 1</SelectItem>
              <SelectItem value="5">Charger 5</SelectItem>
              <SelectItem value="9">Charger 9</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={keyFilter || "all"} 
            onValueChange={(val) => setKeyFilter(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Keys</SelectItem>
              <SelectItem value="HeartbeatInterval">HeartbeatInterval</SelectItem>
              <SelectItem value="AuthorizationCacheEnabled">AuthorizationCacheEnabled</SelectItem>
              <SelectItem value="AllowOfflineTxForUnknownId">AllowOfflineTxForUnknownId</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={readonlyFilter !== undefined ? readonlyFilter.toString() : 'all'} 
            onValueChange={(val) => setReadonlyFilter(val === 'all' ? undefined : val === 'true')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Read Only" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Read Only</SelectItem>
              <SelectItem value="false">Writable</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>

      {/* API is now properly connected and working */}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading configuration data...</p>
                </div>
              </div>
            ) : chargerConfigs?.results && chargerConfigs.results.length > 0 ? (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="p-3 text-left font-medium">ID</th>
                      <th className="p-3 text-left font-medium">Charger</th>
                      <th className="p-3 text-left font-medium">Key</th>
                      <th className="p-3 text-left font-medium">Value</th>
                      <th className="p-3 text-left font-medium">Read Only</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chargerConfigs.results.map((config) => (
                      <tr key={config.id} className="hover:bg-muted/50 border-b">
                        <td className="p-3">{config.id}</td>
                        <td className="p-3">{config.charger}</td>
                        <td className="p-3 font-medium">{config.key}</td>
                        <td className="p-3">{config.value}</td>
                        <td className="p-3">
                          <Badge variant={config.readonly ? "secondary" : "outline"}>
                            {config.readonly ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/chargers/configs/${config.id}`}>
                                <Settings className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/chargers/configs/edit/${config.id}`}>
                                <Sliders className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete configuration '${config.key}'?`)) {
                                  deleteMutation.mutate(config.id.toString());
                                }
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                      Showing <span className="font-medium">{chargerConfigs.results.length}</span> of{' '}
                      <span className="font-medium">{chargerConfigs.count}</span> items
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1 || !chargerConfigs.previous}
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
                      disabled={!chargerConfigs.next || currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No charger configurations found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargerConfigsListPage;
