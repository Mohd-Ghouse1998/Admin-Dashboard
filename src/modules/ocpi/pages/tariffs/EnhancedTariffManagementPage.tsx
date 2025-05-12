import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Trash2, DollarSign, AlertCircle, BarChart, Download, Filter, Clock, MapPin, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { OCPIApiService } from '../../services';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define OCPITariff interface
interface OCPITariff {
  id: string;
  name: string;
  currency: string;
  type: string;
  start_date?: string;
  end_date?: string;
  price_components: {
    type: string;
    price: number;
    step_size?: number;
    unit?: string;
  }[];
  locations?: string[];
  evses?: string[];
  status?: string;
  assigned_locations_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Simulated analytics data (this would come from the API in a real implementation)
const mockAnalytics = {
  usageByTariff: [
    { tariff: 'Standard Tariff', usage: 1250 },
    { tariff: 'Fast Charging', usage: 850 },
    { tariff: 'Premium', usage: 450 },
    { tariff: 'Night Rate', usage: 350 },
  ],
  revenueByTariff: [
    { tariff: 'Standard Tariff', revenue: 1820.50 },
    { tariff: 'Fast Charging', revenue: 1650.75 },
    { tariff: 'Premium', revenue: 1250.30 },
    { tariff: 'Night Rate', revenue: 350.25 },
  ]
};

const EnhancedTariffManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useOCPIRole();
  const queryClient = useQueryClient();
  
  // State for active tab and filtering
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [filterCurrency, setFilterCurrency] = useState<string | null>(null);
  
  // Check if we're in CPO mode
  if (role !== 'CPO') {
    return (
      <PageLayout 
        title="Tariff Management"
        description="Role-based access control"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Tariff management is only available in CPO mode. Please switch to CPO mode to access this feature.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }
  
  // Fetch tariffs from API
  const { 
    data: tariffs = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ocpi', 'tariffs'],
    queryFn: async () => {
      // Use the unified OCPIApiService
      const response = await OCPIApiService.common.resources.tariffs.getAll();
      return response.data.results || [];
    },
    refetchOnWindowFocus: false
  });
  
  // Delete tariff mutation
  const deleteTariffMutation = useMutation({
    mutationFn: (id: string) => OCPIApiService.common.resources.tariffs.delete(id),
    onSuccess: () => {
      toast({
        title: "Tariff deleted",
        description: "The tariff has been successfully deleted.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'tariffs'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error?.response?.data?.message || error?.message || "An error occurred while deleting the tariff.",
      });
    }
  });
  
  // Filter tariffs based on active tab and search term
  const filteredTariffs = React.useMemo(() => {
    let filtered = [...tariffs];
    
    // Filter by tab
    if (activeTab === 'active') filtered = filtered.filter(t => t.status === 'ACTIVE');
    if (activeTab === 'inactive') filtered = filtered.filter(t => t.status !== 'ACTIVE');
    if (activeTab === 'assigned') filtered = filtered.filter(t => (t.locations?.length || 0) > 0);
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) || 
        t.id.toLowerCase().includes(term)
      );
    }
    
    // Filter by currency
    if (filterCurrency) {
      filtered = filtered.filter(t => t.currency === filterCurrency);
    }
    
    return filtered;
  }, [tariffs, activeTab, searchTerm, filterCurrency]);
  
  // Get unique currencies for the filter
  const uniqueCurrencies = React.useMemo(() => {
    return Array.from(new Set(tariffs.map(t => t.currency)));
  }, [tariffs]);
  
  // Table columns - properly typed according to the DataTable component requirements
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row: OCPITariff) => <div className="font-medium">{row.name}</div>
    },
    {
      header: 'Currency',
      accessorKey: 'currency',
      cell: (row: OCPITariff) => <div>{row.currency}</div>
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row: OCPITariff) => <div className="capitalize">{row.type?.toLowerCase() || 'Standard'}</div>
    },
    {
      header: 'Price Components',
      accessorKey: 'price_components',
      cell: (row: OCPITariff) => {
        const components = row.price_components || [];
        return (
          <div className="flex flex-col gap-1">
            {components.map((comp: any, idx: number) => (
              <Badge key={idx} variant="outline" className="justify-start">
                {comp.type}: {comp.price} {row.currency}/{comp.unit || 'unit'}
              </Badge>
            ))}
            
            {components.length === 0 && (
              <span className="text-muted-foreground">No components</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: OCPITariff) => {
        const status = row.status || 'INACTIVE';
        return (
          <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        );
      }
    },
    {
      header: 'Assigned To',
      accessorKey: 'locations',
      cell: (row: OCPITariff) => {
        const locationCount = row.locations?.length || 0;
        return (
          <div>
            {locationCount > 0 ? (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{locationCount} location{locationCount !== 1 ? 's' : ''}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Not assigned</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      accessorKey: 'id', // Using ID as the accessor key for the actions column
      cell: (row: OCPITariff) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage Tariff</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/ocpi/tariffs/${row.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/ocpi/tariffs/assignments/${row.id}`)}>
              <MapPin className="h-4 w-4 mr-2" />
              Assign Locations
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this tariff?')) {
                  deleteTariffMutation.mutate(row.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];
  
  // Card view renderer for tariffs
  const renderTariffCard = (tariff: OCPITariff) => (
    <Card key={tariff.id} className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{tariff.name}</CardTitle>
          <Badge variant={tariff.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {tariff.status || 'INACTIVE'}
          </Badge>
        </div>
        <CardDescription>
          {tariff.currency} • {tariff.type || 'Standard'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium mb-1">Price Components</h4>
            <div className="flex flex-col gap-1">
              {(tariff.price_components || []).map((comp, idx) => (
                <Badge key={idx} variant="outline" className="justify-start">
                  {comp.type}: {comp.price} {tariff.currency}/{comp.unit || 'unit'}
                </Badge>
              ))}
              {(tariff.price_components || []).length === 0 && (
                <span className="text-muted-foreground text-sm">No components</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Assigned To</h4>
            {(tariff.locations?.length || 0) > 0 ? (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{tariff.locations?.length} location{tariff.locations?.length !== 1 ? 's' : ''}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Not assigned</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => navigate(`/ocpi/tariffs/${tariff.id}`)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this tariff?')) {
                deleteTariffMutation.mutate(tariff.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  
  return (
    <PageLayout 
      title="Tariff Management" 
      description="Create and manage pricing tariffs for your charging locations"
    >
      <div className="mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>Tariffs</CardTitle>
              <CardDescription>
                Create and manage pricing tariffs for your charging infrastructure
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/ocpi/tariffs/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Tariff
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Tariffs</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  <TabsTrigger value="assigned">Assigned</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Input
                      placeholder="Search tariffs..."
                      className="w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Currency Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                        {filterCurrency && (
                          <Badge variant="secondary" className="ml-2">
                            {filterCurrency}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-4" align="end">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Filter by Currency</h4>
                        <Select
                          value={filterCurrency || ''}
                          onValueChange={(value) => setFilterCurrency(value || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Currencies" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Currencies</SelectItem>
                            {uniqueCurrencies.map((currency: string) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* View Options */}
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="px-3 rounded-none"
                      onClick={() => setViewMode('list')}
                    >
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      size="sm"
                      className="px-3 rounded-none"
                      onClick={() => setViewMode('card')}
                    >
                      Cards
                    </Button>
                  </div>
                  
                  {/* Export Button */}
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                    <p>Loading tariffs...</p>
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load tariffs. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : filteredTariffs.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tariffs found.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/ocpi/tariffs/create')}
                    >
                      Create your first tariff
                    </Button>
                  </div>
                ) : viewMode === 'list' ? (
                  // List view
                  <DataTable 
                    columns={columns} 
                    data={filteredTariffs} 
                    keyField={(row: OCPITariff) => row.id}
                  />
                ) : (
                  // Card view
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTariffs.map(tariff => renderTariffCard(tariff))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Usage Statistics
            </CardTitle>
            <CardDescription>
              Charging sessions by tariff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.usageByTariff.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.tariff}</span>
                    <span className="font-medium">{item.usage} sessions</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(item.usage / Math.max(...mockAnalytics.usageByTariff.map(i => i.usage))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Revenue Statistics
            </CardTitle>
            <CardDescription>
              Revenue by tariff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.revenueByTariff.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.tariff}</span>
                    <span className="font-medium">${item.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${(item.revenue / Math.max(...mockAnalytics.revenueByTariff.map(i => i.revenue))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Summary Statistics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tariff Overview</CardTitle>
          <CardDescription>
            Summary of your tariff configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{tariffs.length}</div>
              <div className="text-sm text-muted-foreground">Total Tariffs</div>
            </div>
            
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">
                {tariffs.filter(t => t.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Tariffs</div>
            </div>
            
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">
                {tariffs.filter(t => (t.locations?.length || 0) > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Assigned Tariffs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default EnhancedTariffManagementPage;
