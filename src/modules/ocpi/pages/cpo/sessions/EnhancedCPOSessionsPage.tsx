import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import { Column } from '@/components/ui/data-table/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';

// Icons
import { 
  Eye, Download, RefreshCw, MoreHorizontal, Filter,
  Zap, StopCircle, Clock, Calendar, FileText
} from 'lucide-react';

// Services and Types
import { OCPIApiService } from '../../../services';
import { OCPISession } from '../../../types/ocpi.types';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import { 
  OCPISessionStatistics
} from '../../../types/session.types';

// Extended SessionFilters interface to match API requirements
interface SessionFilters {
  status?: string;
  location_id?: string;
  auth_id?: string;
  from_date?: string;
  to_date?: string;
}

// Component for exporting session data
const SessionExport: React.FC<{ data: OCPISession[] }> = ({ data }) => {
  const handleExportCSV = () => {
    // Convert data to CSV
    const headers = ['Session ID', 'Start Time', 'End Time', 'Location', 'Energy', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(session => [
        session.session_id || '',
        session.start_datetime || '',
        session.end_datetime || '',
        session.location ? `Location ${session.location}` : '',
        session.kwh ? `${session.kwh.toFixed(2)}` : '0.00',
        session.status || ''
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleExportJSON = () => {
    // Create download link for JSON
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleExportCSV}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface DateRange {
  from?: Date;
  to?: Date;
}

interface SessionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OCPISession[];
}

export const EnhancedCPOSessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const roleContext = useOCPIRole();
  
  // State
  const [activeTab, setActiveTab] = useState<string>('active');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [tokenFilter, setTokenFilter] = useState('');
  // Build the filters from the individual state values
  const filters = useMemo<SessionFilters>(() => ({
    status: activeTab === 'all' ? undefined : activeTab.toUpperCase(),
    location_id: locationFilter || undefined,
    auth_id: tokenFilter || undefined,
    from_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    to_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
  }), [activeTab, locationFilter, tokenFilter, dateRange]);
  
  // Query locations for the dropdown
  const { data: locations } = useQuery({
    queryKey: ['ocpi', 'locations'],
    queryFn: async () => {
      const response = await OCPIApiService.cpo.sessions.getAll({ status: 'all' });
      // Extract unique locations
      const uniqueLocations = new Set(response.data.results.map((s: OCPISession) => 
        s.location ? `Location ${s.location}` : null
      ));
      return Array.from(uniqueLocations).filter(Boolean);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  


  // React Query for sessions
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    refetch
  } = useQuery<SessionsResponse>({
    queryKey: ['sessions', filters],
    queryFn: async () => {
      const response = await OCPIApiService.cpo.sessions.getAll(filters);
      return response.data;
    },
    enabled: !!roleContext.role
  });

  // React Query for session statistics
  const { data: statsData } = useQuery<OCPISessionStatistics>({
    queryKey: ['session-stats', dateRange],
    queryFn: async () => {
      const params = {
        from_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        to_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      };
      const response = await OCPIApiService.cpo.sessions.getStatistics(params);
      return response.data;
    },
    enabled: !!roleContext.role
  });

  // Transform and filter sessions data
  const filteredSessions = useMemo(() => {
    if (!sessionsData || !sessionsData.results) return [];
    
    return sessionsData.results;
  }, [sessionsData, activeTab]);

  // Reset all filters
  const resetFilters = () => {
    setDateRange(undefined);
    setLocationFilter('');
    setTokenFilter('');
    setShowFilterDialog(false);
  };

  // Calculate session statistics based on the statsData from API
  const sessionStatistics: OCPISessionStatistics = useMemo(() => {
    // Use the stats from API if available
    if (statsData) {
      return statsData as OCPISessionStatistics;
    }
    
    // Otherwise calculate from sessions data
    if (!sessionsData || !sessionsData.results || !sessionsData.results.length) {
      return {
        total_sessions: 0,
        active_sessions: 0,
        completed_sessions: 0,
        total_energy: 0,
        total_duration: 0,
        avg_duration: 0,
        avg_energy: 0
      };
    }
    
    const sessionsList = sessionsData.results;
    const count = sessionsList.length;
    const activeCount = sessionsList.filter(s => s.status === 'ACTIVE').length;
    const completedCount = sessionsList.filter(s => s.status === 'COMPLETED').length;
    
    // Calculate total energy used across all sessions
    const totalEnergy = sessionsList.reduce((sum, s) => sum + (s.kwh || 0), 0);
    
    // Calculate total duration in seconds across all sessions
    const totalDuration = sessionsList.reduce((sum, s) => {
      const start = s.start_datetime ? new Date(s.start_datetime).getTime() : 0;
      const end = s.end_datetime 
        ? new Date(s.end_datetime).getTime() 
        : new Date().getTime();
      return sum + (end - start) / 1000; // Convert ms to seconds
    }, 0);
    
    return {
      total_sessions: count,
      active_sessions: activeCount,
      completed_sessions: completedCount,
      total_energy: totalEnergy,
      total_duration: totalDuration,
      avg_duration: count > 0 ? totalDuration / count : 0,
      avg_energy: count > 0 ? totalEnergy / count : 0
    };
  }, [sessionsData, statsData]);

  // Handle filter changes
  const handleFilterChange = (newFilters: SessionFilters) => {
    // Update filters directly
    if (newFilters.location_id !== undefined) {
      setLocationFilter(newFilters.location_id || '');
    }
    if (newFilters.auth_id !== undefined) {
      setTokenFilter(newFilters.auth_id || '');
    }
    if (newFilters.from_date) {
      setDateRange(prev => ({ ...prev, from: new Date(newFilters.from_date) }));
    }
    if (newFilters.to_date) {
      setDateRange(prev => ({ ...prev, to: new Date(newFilters.to_date) }));
    }
  };

  // Apply filters from dialog
  const applyFilters = () => {
    refetch();
    setShowFilterDialog(false);
  };

  // Stop session mutation
  const stopSessionMutation = useMutation({
    mutationFn: (sessionId: string) => 
      OCPIApiService.cpo.commands.stopSession({ session_id: sessionId }),
    onSuccess: () => {
      toast({
        title: 'Session stopped',
        description: 'The charging session has been stopped successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error stopping session',
        description: `Failed to stop session: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  // Unlock connector mutation
  const unlockConnectorMutation = useMutation({
    mutationFn: ({ locationId, evseUid, connectorId }: { 
      locationId: string; 
      evseUid: string; 
      connectorId: string; 
    }) => OCPIApiService.cpo.commands.unlockConnector({ location_id: locationId, evse_uid: evseUid, connector_id: connectorId }),
    onSuccess: () => {
      toast({
        title: 'Connector unlocked',
        description: 'The connector has been unlocked successfully',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error unlocking connector',
        description: `Failed to unlock connector: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle stop session
  const handleStopSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to stop this session?')) {
      stopSessionMutation.mutate(sessionId);
    }
  };
  
  // Handle unlock connector
  const handleUnlockConnector = (session: OCPISession) => {
    // Ensure we have the necessary data
    // Cast the session to OCPISessionDetail which has the required properties
    const sessionDetail = session as unknown as import('../../../types/session.types').OCPISessionDetail;
    
    if (!sessionDetail.location || !sessionDetail.evse_uid || !sessionDetail.connector_id) {
      toast({
        title: "Unable to unlock connector",
        description: 'Missing location, EVSE, or connector information',
        variant: 'destructive',
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to unlock this connector?')) {
      unlockConnectorMutation.mutate({
        locationId: typeof sessionDetail.location === 'object' ? sessionDetail.location.location_id : sessionDetail.location.toString(),
        evseUid: sessionDetail.evse_uid,
        connectorId: sessionDetail.connector_id
      });
    }
  };
  
  // Navigate to session detail
  const navigateToSessionDetail = (sessionId: string) => {
    navigate(`/ocpi/sessions/${sessionId}`);
  };
  
  // Navigate to command center
  const navigateToCommandCenter = () => {
    navigate('/ocpi/commands');
  };
  
  // Export sessions to CSV
  const exportSessions = () => {
    toast({
      title: 'Export started',
      description: 'Your sessions data is being prepared for download',
      variant: 'default'
    });
    // The actual export is handled by the SessionExport component
  };
  
  // Table columns definition for active sessions
  const activeSessionsColumns: Column<OCPISession>[] = [
    {
      header: 'Session ID',
      accessorKey: 'session_id',
      cell: (row) => {
        return row.session_id || '—';
      }
    },
    {
      header: 'Start Time',
      accessorKey: 'start_datetime',
      cell: (row) => {
        const value = row.start_datetime;
        return value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : '—';
      }
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: (row) => {
        const value = row.location;
        return value ? `Location ${value}` : '—';
      }
    },
    {
      header: 'Energy',
      accessorKey: 'kwh',
      cell: (row) => {
        const value = row.kwh;
        return value !== undefined ? `${Number(value).toFixed(2)} kWh` : '—';
      }
    },
    {
      header: 'Auth Method',
      accessorKey: 'auth_method',
      cell: (row) => {
        const value = row.auth_method;
        return value || '—';
      }
    },
    {
      header: 'Actions',
      accessorKey: 'session_id',
      cell: (row) => {
        const session = row;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigateToSessionDetail(session.session_id || '')}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStopSession(session.session_id || '')}>
                Stop session
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUnlockConnector(session)}>
                Unlock connector
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];
  
  // Table columns definition for past sessions
  const pastSessionsColumns: Column<OCPISession>[] = [
    {
      header: 'Session ID',
      accessorKey: 'session_id',
      cell: (row) => {
        return row.session_id || '—';
      }
    },
    {
      header: 'Start Time',
      accessorKey: 'start_datetime',
      cell: (row) => {
        const value = row.start_datetime;
        return value ? format(new Date(value), 'MMM dd, yyyy HH:mm') : '—';
      }
    },
    {
      header: 'End Time',
      accessorKey: 'end_datetime',
      cell: (row) => {
        const value = row.end_datetime;
        return value ? format(new Date(value), 'MMM dd, yyyy HH:mm') : '—';
      }
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      cell: (session) => {
        const start = session.start_datetime ? new Date(session.start_datetime).getTime() : 0;
        const end = session.end_datetime ? new Date(session.end_datetime).getTime() : new Date().getTime();
        const durationMs = end - start;
        const hours = Math.floor(durationMs / (60 * 60 * 1000));
        const mins = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));
        return `${hours}h ${mins}m`;
      }
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: (row) => {
        const value = row.location;
        return value ? `Location ${value}` : '—';
      }
    },
    {
      header: 'Energy',
      accessorKey: 'kwh',
      cell: (row) => {
        const value = row.kwh;
        return value !== undefined ? `${Number(value).toFixed(2)} kWh` : '—';
      }
    },
    {
      header: 'Actions',
      accessorKey: 'session_id',
      cell: (row) => {
        const session = row;
        return (
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigateToSessionDetail(session.session_id || '')}
          >
            <FileText className="h-4 w-4 mr-2" /> View
          </Button>
        );
      }
    }
  ];
  
  return (
    <PageLayout 
      title="Session Management" 
      description="Monitor and manage all charging sessions"
      actions={(
        <div className="flex flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={navigateToCommandCenter}
          >
            <Zap className="h-4 w-4 mr-2" />
            Command Center
          </Button>
        </div>
      )}
    >
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {sessionStatistics?.total_energy?.toFixed(2) || '0.00'} kWh
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {sessionStatistics?.active_sessions || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {sessionStatistics?.avg_duration 
                  ? `${Math.floor(sessionStatistics.avg_duration / 3600)}h ${Math.floor((sessionStatistics.avg_duration % 3600) / 60)}m` 
                  : '0h 0m'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Charging Sessions</CardTitle>
              <CardDescription>Manage and monitor all charging sessions across your locations</CardDescription>
            </div>
            <SessionExport data={filteredSessions} />
          </CardHeader>
          
          <CardContent>
            {/* Filter and action buttons */}
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
              <div className="flex gap-2">
                <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Filter Sessions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="flex space-x-2">
                          <div className="w-1/2">
                            <Label htmlFor="from-date" className="text-xs">From</Label>
                            <Input 
                              id="from-date"
                              type="date" 
                              value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                              onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : undefined;
                                setDateRange(prev => ({ ...prev, from: date }));
                              }}
                            />
                          </div>
                          <div className="w-1/2">
                            <Label htmlFor="to-date" className="text-xs">To</Label>
                            <Input 
                              id="to-date"
                              type="date" 
                              value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                              onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : undefined;
                                setDateRange(prev => ({ ...prev, to: date }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input 
                          placeholder="Filter by location" 
                          value={locationFilter} 
                          onChange={(e) => setLocationFilter(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Token ID</Label>
                        <Input 
                          placeholder="Filter by token/auth ID" 
                          value={tokenFilter} 
                          onChange={(e) => setTokenFilter(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between pt-4">
                        <Button 
                          variant="outline" 
                          onClick={resetFilters}
                        >
                          Reset
                        </Button>
                        <Button onClick={applyFilters}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <Button 
                variant="outline"
                onClick={exportSessions}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="active">
                  Active Sessions
                  <Badge variant="outline" className="ml-2">
                    {sessionStatistics?.active_sessions || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed Sessions
                  <Badge variant="outline" className="ml-2">
                    {sessionStatistics?.completed_sessions || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="all">
                  All Sessions
                  <Badge variant="outline" className="ml-2">
                    {sessionStatistics?.total_sessions || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <DataTable 
                  columns={activeSessionsColumns}
                  data={filteredSessions}
                  isLoading={isLoadingSessions}
                  pagination={{
                    currentPage: 1,
                    totalPages: sessionsData ? Math.ceil(sessionsData.count / 10) : 1,
                    totalItems: sessionsData?.count || 0,
                    onPageChange: () => {} // We'll implement pagination later
                  }}
                  keyField="session_id"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default EnhancedCPOSessionsPage;
