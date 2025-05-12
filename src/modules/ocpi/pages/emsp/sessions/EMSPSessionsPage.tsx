import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OCPISession } from '../../../types/ocpi.types';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye, StopCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { OCPIApiService } from '../../../services';
import { useNavigate } from 'react-router-dom';

export const EMSPSessionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { role } = useOCPIRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  
  // Check if we're in EMSP mode
  if (role !== 'EMSP') {
    return (
      <PageLayout title="EMSP Sessions" description="Session management is only available in EMSP mode">
        <Alert variant="destructive">
          <AlertDescription>
            EMSP session management is only available in EMSP mode. Please switch to EMSP mode to access this feature.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }
  
  // Define response type to prevent TypeScript errors
  interface SessionsResponse {
    results: OCPISession[];
    count: number;
    next?: string;
    previous?: string;
  }
  
  // Get sessions based on active tab
  const { data, isLoading, error } = useQuery<SessionsResponse>({
    queryKey: ['ocpi', 'emsp', 'sessions', activeTab],
    queryFn: async () => {
      const response = await OCPIApiService.emsp.sessions.getAll({ 
        status: activeTab === 'active' ? 'ACTIVE' : 'COMPLETED' 
      });
      return response.data as SessionsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (oldData) => oldData // This replaces keepPreviousData
  });
  
  // Stop session mutation
  const stopSession = useMutation({
    mutationFn: (sessionId: string) => OCPIApiService.emsp.commands.stopSession({ session_id: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'emsp', 'sessions'] });
    }
  });
  
  // Table columns definition for active sessions
  const activeSessionsColumns = [
    {
      header: 'Session ID',
      accessorKey: 'session_id',
      cell: (row) => {
        return row.session_id || '—';
      }
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: (row) => {
        return typeof row.location === 'object' && row.location?.name 
          ? row.location.name 
          : typeof row.location === 'number' 
            ? `Location ID: ${row.location}` 
            : 'Unknown Location';
      }
    },
    {
      header: 'Start Time',
      accessorKey: 'start_datetime',
      cell: (row) => {
        return row.start_datetime 
          ? format(new Date(row.start_datetime), 'MMM dd, yyyy HH:mm')
          : '—';
      }
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      cell: (row) => {
        if (!row.start_datetime) return '—';
        
        const startTime = new Date(row.start_datetime);
        const now = new Date();
        const durationMs = now.getTime() - startTime.getTime();
        
        // Format duration
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
      }
    },
    {
      header: 'Energy',
      accessorKey: 'kwh',
      cell: (row) => {
        return row.kwh ? `${Number(row.kwh).toFixed(2)} kWh` : '0.00 kWh';
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => {
        return (
          <Badge variant={
            row.status === 'ACTIVE' ? 'success' : 
            row.status === 'PENDING' ? 'default' : 'secondary'
          }>
            {row.status}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (row) => {
        return (
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => navigate(`/ocpi/active-sessions/${row.session_id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {row.status === 'ACTIVE' && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={(event) => {
                  event.stopPropagation(); // Prevent row click
                  if (window.confirm('Are you sure you want to stop this session?')) {
                    stopSession.mutate(row.session_id);
                  }
                }}
              >
                <StopCircle className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];
  
  // Table columns definition for completed sessions
  const completedSessionsColumns = [
    {
      header: 'Session ID',
      accessorKey: 'session_id',
      cell: (row) => {
        return row.session_id || '—';
      }
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: (row) => {
        return typeof row.location === 'object' && row.location?.name 
          ? row.location.name 
          : typeof row.location === 'number' 
            ? `Location ID: ${row.location}` 
            : 'Unknown Location';
      }
    },
    {
      header: 'Start Time',
      accessorKey: 'start_datetime',
      cell: (row) => {
        return row.start_datetime 
          ? format(new Date(row.start_datetime), 'MMM dd, yyyy HH:mm')
          : '—';
      }
    },
    {
      header: 'End Time',
      accessorKey: 'end_datetime',
      cell: (row) => {
        return row.end_datetime 
          ? format(new Date(row.end_datetime), 'MMM dd, yyyy HH:mm')
          : '—';
      }
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      cell: (row) => {
        if (!row.start_datetime || !row.end_datetime) return '—';
        
        const startTime = new Date(row.start_datetime);
        const endTime = new Date(row.end_datetime);
        const durationMs = endTime.getTime() - startTime.getTime();
        
        // Format duration
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
      }
    },
    {
      header: 'Energy',
      accessorKey: 'kwh',
      cell: (row) => {
        return row.kwh ? `${Number(row.kwh).toFixed(2)} kWh` : '0.00 kWh';
      }
    },
    {
      header: 'CDR ID',
      accessorKey: 'cdr_id',
      cell: (row) => {
        return row.cdr_id || '—';
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (row) => {
        return (
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => navigate(`/ocpi/active-sessions/${row.session_id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];
  
  return (
    <PageLayout 
      title="EMSP Sessions" 
      description="Manage your charging sessions on external networks"
    >
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Session Management</CardTitle>
            <CardDescription>
              View and manage your charging sessions on external networks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="active" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active Sessions</TabsTrigger>
                <TabsTrigger value="completed">Completed Sessions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {isLoading ? (
                  <div className="text-center py-4">Loading active sessions...</div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load sessions. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : data?.results?.length === 0 ? (
                  <div className="text-center py-12 border rounded-md">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Sessions</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      You don't have any active charging sessions. Start a session at an external charging station to see it listed here.
                    </p>
                  </div>
                ) : (
                  <DataTable 
                    columns={activeSessionsColumns} 
                    data={data?.results || []} 
                    keyField={(row) => row.session_id || row.id?.toString() || 'unknown'}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {isLoading ? (
                  <div className="text-center py-4">Loading completed sessions...</div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load sessions. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : data?.results?.length === 0 ? (
                  <div className="text-center py-12 border rounded-md">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Completed Sessions</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      You don't have any completed charging sessions yet. Once your charging sessions are completed, they will appear here.
                    </p>
                  </div>
                ) : (
                  <DataTable 
                    columns={completedSessionsColumns} 
                    data={data?.results || []} 
                    keyField={(row) => row.session_id || row.id?.toString() || 'unknown'}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
