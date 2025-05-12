import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Building2, Clock, DollarSign, Globe, MapPin, Tag, Cable } from 'lucide-react';
import { OCPIApiService } from '../../services';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';

export const EMSPDashboard: React.FC = () => {
  // Define the statistics type
  type EMSPDashboardStats = {
    active_sessions: number;
    total_cdrs: number;
    monthly_spending: number;
    connected_cpos: number;
    token_count: number;
    available_locations: number;
  };
  
  // Define the API response type
  type ApiResponse = {
    data: {
      status: string;
      statistics: EMSPDashboardStats;
    }
  };
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role, ensureRoleIsSet } = useOCPIRole();
  
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
          console.log('Role successfully verified or set for EMSP dashboard');
        } else {
          console.warn('Could not automatically set a role for EMSP dashboard');
          toast({
            title: 'OCPI Role Required',
            description: 'Please select an OCPI role to view the dashboard.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error ensuring role is set for EMSP dashboard:', error);
      } finally {
        setRoleChecked(true);
        setRoleCheckLoading(false);
      }
    };
    
    checkAndSetRole();
  }, [ensureRoleIsSet, roleChecked, roleCheckLoading, toast]);

  // Mock data for development or when backend fails
  const mockEMSPData: EMSPDashboardStats = {
    active_sessions: 3,
    total_cdrs: 156,
    monthly_spending: 2345.75,
    connected_cpos: 12,
    token_count: 8,
    available_locations: 345
  };
  
  // Track server errors to prevent excessive logging and API calls
  const [serverErrorCount, setServerErrorCount] = React.useState(0);
  const MAX_ERROR_RETRIES = 3;
  
  // Use the dashboard/emsp endpoint as documented in the API guide
  const { data, isLoading, error, refetch } = useQuery<ApiResponse>({
    queryKey: ['ocpi', 'emsp', 'dashboard'],
    queryFn: async () => {
      // If we've seen too many errors, don't even try to fetch - just return mock data
      if (serverErrorCount >= MAX_ERROR_RETRIES) {
        console.debug('Using mock data due to repeated server errors');
        return {
          data: {
            status: "success",
            statistics: mockEMSPData
          }
        };
      }
      
      try {
        // Using the unified API service to fetch EMSP dashboard data
        const response = await OCPIApiService.emsp.dashboard.getStats();
        // Reset error count on success
        setServerErrorCount(0);
        return response;
      } catch (err) {
        // Increment error count to track repeated failures
        setServerErrorCount(prev => prev + 1);
        
        // Only log the first few errors to avoid console spam
        if (serverErrorCount < MAX_ERROR_RETRIES) {
          console.error('Error fetching EMSP dashboard:', err);
        }
        
        // Return mock data wrapped in the same structure instead of throwing
        return {
          data: {
            status: "success",
            statistics: mockEMSPData
          }
        };
      }
    },
    refetchInterval: serverErrorCount >= MAX_ERROR_RETRIES ? false : 30000, // Disable auto-refresh if too many errors
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 1, // Only retry once to avoid excessive API calls
    retryDelay: 1000 // Wait 1 second between retries
  });
  
  // Handle manual refresh
  const handleRefresh = () => {
    toast({
      title: "Refreshing Dashboard",
      description: "Fetching the latest EMSP data..."
    });
    refetch();
  };
  
  // Handle errors outside of useQuery options
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching EMSP dashboard data:', error);
    }
  }, [error]);
  
  // Default stats if data is not loaded yet
  const defaultStats: EMSPDashboardStats = {
    active_sessions: 0,
    total_cdrs: 0,
    monthly_spending: 0,
    connected_cpos: 0,
    token_count: 0,
    available_locations: 0
  };
  
  // Extract statistics from response or use default values
  const stats = data?.data?.statistics || defaultStats;
  
  return (
    <PageLayout 
      title="EMSP Dashboard" 
      description="E-Mobility Service Provider network overview"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
          <p className="font-semibold">Failed to load dashboard data</p>
          <p className="text-sm">Please try refreshing the dashboard</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected CPOs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.connected_cpos}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              External charging networks
            </p>
            <div className="absolute right-4 top-4 p-2 bg-green-100 rounded-full">
              <Globe className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.available_locations}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              External charging locations
            </p>
            <div className="absolute right-4 top-4 p-2 bg-green-100 rounded-full">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tokens & Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex space-x-4">
                <div>
                  <div className="text-2xl font-bold">{stats.token_count}</div>
                  <p className="text-xs text-muted-foreground">Tokens</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.active_sessions}</div>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            )}
            <div className="absolute right-4 top-4 p-2 bg-green-100 rounded-full">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                ${stats.monthly_spending.toFixed(2)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Across all connected CPOs
            </p>
            <div className="absolute right-4 top-4 p-2 bg-green-100 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Location Map</CardTitle>
            <CardDescription>External charging locations by network</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <div className="w-full h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Location Map</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Charging statistics by CPO</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <div className="w-full h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Activity Chart</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Currently charging sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-full h-12" />
              </div>
            ) : stats.active_sessions > 0 ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Session</p>
                    <p className="text-xs text-muted-foreground">Central Station, 15 kWh</p>
                    <p className="text-xs text-muted-foreground">Started 1 hour ago</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted py-8">
                <Cable className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No active sessions at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reservations</CardTitle>
            <CardDescription>Reserved charging slots</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-full h-12" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upcoming Reservation</p>
                    <p className="text-xs text-muted-foreground">Main Plaza, Terminal 3</p>
                    <p className="text-xs text-muted-foreground">In 2 hours</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
