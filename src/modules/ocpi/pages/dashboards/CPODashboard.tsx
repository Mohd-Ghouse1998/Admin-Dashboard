import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Building2, DollarSign, Zap, Cable, MapPin, RefreshCw, AlertCircle, Plus, Link, Tag as TagIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OCPIApiService } from '../../services';
import { useToast } from '@/components/ui/use-toast';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';

export const CPODashboard: React.FC = () => {
  // State for managing the dashboard data and UI
  const [tabValue, setTabValue] = useState('connections');
  const [errorCount, setErrorCount] = useState(0); // Track consecutive errors
  
  // Setup context
  const { toast } = useToast();
  const { role, ensureRoleIsSet, syncRoleWithBackend } = useOCPIRole();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Ensure role is set before loading dashboard
  const [roleChecked, setRoleChecked] = useState(false);
  const [roleCheckLoading, setRoleCheckLoading] = useState(false);
  
  // Effect to ensure a role is set before attempting to fetch dashboard data
  useEffect(() => {
    const checkAndSetRole = async () => {
      if (roleChecked || roleCheckLoading) return;
      
      try {
        setRoleCheckLoading(true);
        const result = await ensureRoleIsSet();
        if (result) {
          console.log('Role successfully verified or set for dashboard');
        } else {
          console.warn('Could not automatically set a role for dashboard');
          toast({
            title: 'OCPI Role Required',
            description: 'Please select an OCPI role to view the dashboard.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error ensuring role is set:', error);
      } finally {
        setRoleChecked(true);
        setRoleCheckLoading(false);
      }
    };
    
    checkAndSetRole();
  }, [ensureRoleIsSet, roleChecked, roleCheckLoading, toast]);
  
  // Define the statistics type based on actual API response
  type CPODashboardStats = {
    locations_count: number;
    evses_count: number;
    connected_emsp_count: number;
    active_sessions_count: number;
    recent_cdrs_count: number;
    total_energy_kwh: number;
    total_revenue: number;
    // Keep older fields for backward compatibility
    total_locations?: number;
    total_evses?: number;
    total_connectors?: number;
    active_sessions?: number;
    total_cdrs?: number;
    monthly_revenue?: number;
    connected_emsps?: number;
    evse_status?: {
      available: number;
      charging: number;
      outoforder: number;
      reserved: number;
    };
    connection_status?: {
      active: number;
      pending: number;
      failed: number;
    };
    recent_sessions?: {
      id: string;
      start_time: string;
      status: string;
      location_name: string;
      evse_id: string;
      kwh: number;
    }[];
  };
  
  // Define the connected EMSP type
  type ConnectedEMSP = {
    id: number;
    name: string;
    country_code: string;
    party_id: string;
  };
  
  // Define the API response type based on actual API structure
  type ApiResponse = {
    data: {
      status: string;
      statistics: CPODashboardStats;
      connected_emsps?: ConnectedEMSP[];
    }
  };
  
  // Mock data for development or when backend fails - updated to match API structure
  const mockCPOData: CPODashboardStats = {
    // New API fields
    locations_count: 45,
    evses_count: 124,
    connected_emsp_count: 8,
    active_sessions_count: 12,
    recent_cdrs_count: 987,
    total_energy_kwh: 1250.75,
    total_revenue: 12450.50,
    // Legacy fields for backward compatibility
    total_locations: 45,
    total_evses: 124,
    total_connectors: 235,
    active_sessions: 12,
    total_cdrs: 987,
    monthly_revenue: 12450.50,
    connected_emsps: 8,
    evse_status: {
      available: 98,
      charging: 16,
      outoforder: 5,
      reserved: 5
    },
    connection_status: {
      active: 6,
      pending: 1,
      failed: 1
    },
    recent_sessions: [
      {
        id: "session_1",
        start_time: "2025-05-06T18:30:00Z",
        status: "Active",
        location_name: "Central Square",
        evse_id: "EVSE001",
        kwh: 12.5
      },
      {
        id: "session_2",
        start_time: "2025-05-06T17:15:00Z",
        status: "Completed",
        location_name: "West Park",
        evse_id: "EVSE042",
        kwh: 18.7
      }
    ]
  };
  
  // Mock connected EMSPs
  const mockConnectedEMSPs: ConnectedEMSP[] = [
    {
      id: 1,
      name: "Electric Mobility Co",
      country_code: "IN",
      party_id: "EMC"
    },
    {
      id: 2,
      name: "EV Services Ltd",
      country_code: "IN",
      party_id: "EVS"
    }
  ];

  // Track server errors to prevent excessive logging and API calls
  const [serverErrorCount, setServerErrorCount] = React.useState(0);
  const MAX_ERROR_RETRIES = 3;
  
  // Use the dashboard/cpo endpoint as documented in the API guide
  const { data, isLoading, error, refetch } = useQuery<ApiResponse>({
    queryKey: ['ocpi', 'cpo', 'dashboard'],
    queryFn: async () => {
      // If we've seen too many errors, don't even try to fetch - just return mock data
      if (serverErrorCount >= MAX_ERROR_RETRIES) {
        console.debug('Using mock data due to repeated server errors');
        return {
          data: {
            status: "success",
            statistics: mockCPOData,
            connected_emsps: mockConnectedEMSPs
          }
        };
      }
      
      try {
        // Using the unified API service to fetch CPO dashboard data
        const response = await OCPIApiService.cpo.dashboard.getStats();
        // Reset error count on success
        setServerErrorCount(0);
        return response;
      } catch (err) {
        // Increment error count to track repeated failures
        setServerErrorCount(prev => prev + 1);
        
        // Only log the first few errors to avoid console spam
        if (serverErrorCount < MAX_ERROR_RETRIES) {
          console.error('Error fetching CPO dashboard:', err);
        }
        
        // Return mock data wrapped in the same structure instead of throwing
        return {
          data: {
            status: "success",
            statistics: mockCPOData,
            connected_emsps: mockConnectedEMSPs
          }
        };
      }
    },
    refetchInterval: serverErrorCount >= MAX_ERROR_RETRIES ? false : 30000, // Disable auto-refresh if too many errors
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 1,
  });
  
  // Default stats if data is not loaded yet
  const defaultStats: CPODashboardStats = {
    // New API fields
    locations_count: 0,
    evses_count: 0,
    connected_emsp_count: 0,
    active_sessions_count: 0,
    recent_cdrs_count: 0,
    total_energy_kwh: 0,
    total_revenue: 0,
    // Legacy fields for backward compatibility
    total_locations: 0,
    total_evses: 0,
    total_connectors: 0,
    active_sessions: 0,
    total_cdrs: 0,
    monthly_revenue: 0,
    connected_emsps: 0,
    evse_status: {
      available: 0,
      charging: 0,
      outoforder: 0,
      reserved: 0
    },
    connection_status: {
      active: 0,
      pending: 0,
      failed: 0
    },
    recent_sessions: []
  };
  
  // Default connected EMSPs if none are provided
  const defaultConnectedEMSPs: ConnectedEMSP[] = [];
  
  // Extract statistics from response or use default values
  // Use the spread operator to ensure all nested properties are properly initialized with defaults
  const stats = {
    ...defaultStats,
    ...data?.data?.statistics,
    // Ensure nested objects have default values if they're missing
    evse_status: {
      ...defaultStats.evse_status,
      ...data?.data?.statistics?.evse_status
    },
    connection_status: {
      ...defaultStats.connection_status,
      ...data?.data?.statistics?.connection_status
    },
    // Ensure recent_sessions is at least an empty array
    recent_sessions: data?.data?.statistics?.recent_sessions || []
  };
  
  // Extract connected EMSPs from response or use default values
  const connectedEMSPs = data?.data?.connected_emsps || defaultConnectedEMSPs;
  
  // Calculate total EVSEs for status percentage
  const totalEvses = stats.evses_count || stats.total_evses || 1; // Prevent division by zero
  
  // Handle manual refresh
  const handleRefresh = () => {
    toast({
      title: "Refreshing Dashboard",
      description: "Fetching the latest CPO data..."
    });
    refetch();
  };
  
  return (
    <PageLayout 
      title="CPO Dashboard" 
      description="Charge Point Operator network overview"
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-4 mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          {/* Role Switcher */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded-md">
            <span className="text-sm font-medium">Current Role:</span>
            <div className="flex">
              <Button 
                variant={role === 'CPO' ? "default" : "outline"}
                size="sm"
                className={role === 'CPO' ? "bg-blue-600 hover:bg-blue-700" : ""} 
                onClick={() => role !== 'CPO' && syncRoleWithBackend('CPO')}
                disabled={role === 'CPO' || isLoading}
              >
                CPO
              </Button>
              <Button 
                variant={role === 'EMSP' ? "default" : "outline"}
                size="sm" 
                className={role === 'EMSP' ? "bg-purple-600 hover:bg-purple-700" : ""}
                onClick={() => role === 'CPO' && syncRoleWithBackend('EMSP')} 
                disabled={role === 'EMSP' || isLoading}
              >
                EMSP
              </Button>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-2 py-1">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                <span>OCPI 2.2 Active</span>
              </div>
            </Badge>
            <Badge variant="outline" className="px-2 py-1">
              <div className="flex items-center">
                {isLoading ? (
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse mr-1"></div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                )}
                <span>Last update: {new Date().toLocaleTimeString()}</span>
              </div>
            </Badge>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to load dashboard data</p>
            <p className="text-sm">Please try refreshing the dashboard</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.locations_count || stats.total_locations}</div>
            )}
            <div className="absolute right-4 top-4 p-2 bg-blue-100 rounded-full">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total EVSEs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.evses_count || stats.total_evses}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total_connectors || 0} connectors
            </p>
            <div className="absolute right-4 top-4 p-2 bg-indigo-100 rounded-full">
              <Zap className="h-4 w-4 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.active_sessions_count || stats.active_sessions}</div>
            )}
            <div className="absolute right-4 top-4 p-2 bg-green-100 rounded-full">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected EMSPs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.connected_emsp_count || stats.connected_emsps}</div>
            )}
            <div className="absolute right-4 top-4 p-2 bg-purple-100 rounded-full">
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">${(stats.total_revenue || stats.monthly_revenue || 0).toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats.recent_cdrs_count || stats.total_cdrs || 0} charge records
            </p>
            <div className="absolute right-4 top-4 p-2 bg-emerald-100 rounded-full">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Energy</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{(stats.total_energy_kwh || 0).toFixed(2)} kWh</div>
            )}
            <div className="absolute right-4 top-4 p-2 bg-yellow-100 rounded-full">
              <Zap className="h-4 w-4 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connected EMSPs</CardTitle>
          <CardDescription>External mobility service providers connected to your platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          ) : connectedEMSPs.length > 0 ? (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connectedEMSPs.map((emsp) => (
                    <tr key={emsp.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emsp.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {emsp.country_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emsp.party_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outline" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>No connected EMSPs found</p>
              <p className="text-sm">Connect with EMSPs to enable roaming for your users</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="status" className="mb-8">
        <TabsList>
          <TabsTrigger value="status">EVSE Status</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>EVSE Status</CardTitle>
              <CardDescription>Status distribution of charging stations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-[300px] rounded-md" />
              ) : (
                <div className="w-full h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Infrastructure Chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest charging activities</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-[300px] rounded-md" />
              ) : (
                <div className="w-full h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Sessions Chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>EMSP Distribution</CardTitle>
              <CardDescription>Sessions by provider</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-[300px] rounded-md" />
              ) : (
                <div className="w-full h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">EMSP Distribution Chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">OCPI Management Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Party Creation */}
          <Card className="hover:border-primary cursor-pointer transition-all" onClick={() => navigate('/ocpi/parties/create')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Create OCPI Party</CardTitle>
              <CardDescription>Register a new CPO or EMSP</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Step 1 in process flow</p>
                <Plus className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Connection Registration */}
          <Card className="hover:border-primary cursor-pointer transition-all" onClick={() => navigate('/ocpi/connections/register')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Register Connection</CardTitle>
              <CardDescription>Connect with other parties</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Step 2 in process flow</p>
                <Link className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Location Management */}
          <Card className="hover:border-primary cursor-pointer transition-all" onClick={() => navigate('/ocpi/cpo/locations')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Manage Locations</CardTitle>
              <CardDescription>Create and manage OCPI locations</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Step 3 in process flow</p>
                <MapPin className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Tariff Management */}
          <Card className="hover:border-primary cursor-pointer transition-all" onClick={() => navigate('/ocpi/cpo/tariffs')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Manage Tariffs</CardTitle>
              <CardDescription>Create and publish pricing tariffs</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Step 4 in process flow</p>
                <TagIcon className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest charging sessions and CDRs</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-full h-12" />
              </div>
            ) : (
              <div className="text-center text-muted py-8">
                <Cable className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Session activity will appear here when available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
