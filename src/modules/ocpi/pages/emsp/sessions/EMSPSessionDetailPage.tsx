import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OCPIApiService } from '../../../services';
import { OCPISessionDetail, OCPIMeterValue } from '../../../types/session.types';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  StopCircle,
  Unlock,
  Clock,
  Zap,
  Calendar,
  MapPin,
  CreditCard,
  User,
  BarChart4,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';

// Import Recharts components for the energy consumption chart
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const EMSPSessionDetailPage = () => {
  // First, check if we're in the correct role
  const { role } = useOCPIRole();
  const navigate = useNavigate();
  
  if (role !== 'EMSP') {
    return (
      <PageLayout title="EMSP Session Details" description="Session details is only available in EMSP mode">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            EMSP session details are only available in EMSP mode. Please switch to EMSP mode to access this feature.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate('/ocpi/sessions')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  // For session details, we need the session_id
  const { id: sessionIdParam } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Extract numeric id from session object once loaded
  const [numericId, setNumericId] = useState<number | null>(null);
  
  // Get the session data using the session_id
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ocpi', 'emsp', 'session', sessionIdParam],
    queryFn: async () => {
      if (!sessionIdParam) throw new Error('Session ID is required');
      
      try {
        // Try first with the original param (which might be numeric id or session_id)
        const response = await OCPIApiService.emsp.sessions.getById(sessionIdParam);
        // If successful with first attempt, store the numeric id for future calls
        if (response?.data?.id) {
          setNumericId(response.data.id);
        }
        return response.data as OCPISessionDetail;
      } catch (error) {
        // If direct fetch failed, we need to search for the session with this session_id
        const sessionsResponse = await OCPIApiService.emsp.sessions.getAll();
        
        if (sessionsResponse?.data?.results?.length > 0) {
          // Look for a matching session by session_id
          const matchingSession = sessionsResponse.data.results.find(s => 
            s.session_id === sessionIdParam || s.id === Number(sessionIdParam));
          
          if (matchingSession) {
            setNumericId(matchingSession.id);
            // Now fetch the full details using the numeric id
            const detailResponse = await OCPIApiService.emsp.sessions.getById(matchingSession.id);
            return detailResponse.data as OCPISessionDetail;
          }
        }
        throw new Error('Session not found');
      }
    },
    enabled: !!sessionIdParam && role === 'EMSP',
  });
  
  // Generate simulated meter values based on session data if not available
  const [meterValues, setMeterValues] = useState<OCPIMeterValue[]>([]);
  
  useEffect(() => {
    if (session && !session.meter_values && numericId) {
      // Try to fetch meter values from the API - if there's a dedicated endpoint
      // Since there's no getMeterValues in the emsp sessions API, generate simulated values
      generateSimulatedMeterValues();
    } else if (session?.meter_values) {
      setMeterValues(session.meter_values);
    }
  }, [session, numericId]);
  
  // Generate simulated meter values for visualization
  const generateSimulatedMeterValues = () => {
    if (!session) return;
    
    const values: OCPIMeterValue[] = [];
    const startDate = new Date(session.start_datetime || '');
    const endDate = session.end_datetime ? new Date(session.end_datetime) : new Date();
    const totalKwh = session.kwh || 0;
    
    // Create data points spread across the session duration
    const duration = endDate.getTime() - startDate.getTime();
    const interval = duration / 10;
    
    for (let i = 0; i <= 10; i++) {
      const timestamp = new Date(startDate.getTime() + i * interval);
      const value = (totalKwh / 10) * i;
      
      values.push({
        timestamp: timestamp.toISOString(),
        value: parseFloat(value.toFixed(2)),
        unit: 'kWh',
      });
    }
    
    setMeterValues(values);
  };
  
  // Stop session mutation
  const stopSessionMutation = useMutation({
    mutationFn: (sessionId: string) => 
      OCPIApiService.emsp.commands.stopSession({ session_id: sessionId }),
    onSuccess: () => {
      toast({
        title: 'Session stopped',
        description: 'The charging session has been stopped successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'emsp', 'session', sessionIdParam] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error stopping session',
        description: `Failed to stop session: ${error.message || 'Unknown error'}`,
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
    }) => OCPIApiService.emsp.commands.unlockConnector({ location_id: locationId, evse_uid: evseUid, connector_id: connectorId }),
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
        description: `Failed to unlock connector: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle stop session
  const handleStopSession = () => {
    if (session && session.session_id) {
      if (window.confirm('Are you sure you want to stop this session?')) {
        // Make sure we're passing a string here
        stopSessionMutation.mutate(session.session_id.toString());
      }
    }
  };
  
  // Handle unlock connector
  const handleUnlockConnector = () => {
    if (!session) return;
    
    if (window.confirm('Are you sure you want to unlock this connector?')) {
      unlockConnectorMutation.mutate({
        locationId: session.location?.location_id || '',
        evseUid: session.evse_uid || '',
        connectorId: session.connector_id || '',
      });
    }
  };
  
  // Calculate session duration
  const calculateDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  // Format timestamp for chart
  const formatChartTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };
  
  // Prepare chart data
  const chartData = meterValues.map((value) => ({
    time: value.timestamp ? formatChartTime(value.timestamp) : '',
    energy: value.value,
    timestamp: value.timestamp,
  }));
  
  if (isLoading) {
    return (
      <PageLayout title="EMSP Session Details" description="Loading session information...">
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }
  
  if (error || !session) {
    return (
      <PageLayout title="EMSP Session Details" description="Error loading session">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load session details. Please try again.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate('/ocpi/emsp/sessions')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout 
      title={`EMSP Session Details: ${session.session_id || 'Unknown'}`} 
      description="Detailed information about this charging session"
    >
      {/* Back button and actions */}
      <div className="flex justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/ocpi/emsp/sessions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Button>
        
        <div className="flex gap-2">
          {session.status === 'ACTIVE' && (
            <>
              <Button
                variant="outline"
                onClick={handleUnlockConnector}
                disabled={unlockConnectorMutation.isPending}
              >
                {unlockConnectorMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Unlock className="mr-2 h-4 w-4" />
                )}
                Unlock Connector
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleStopSession}
                disabled={stopSessionMutation.isPending}
              >
                {stopSessionMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <StopCircle className="mr-2 h-4 w-4" />
                )}
                Stop Session
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Session status card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
              <Badge variant={
                session.status === 'ACTIVE' ? 'success' :
                session.status === 'COMPLETED' ? 'secondary' :
                'default'
              }>
                {session.status}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Session ID</h3>
              <p className="text-sm font-medium">{session.session_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Start Time</h3>
              <p className="text-sm font-medium">
                {session.start_datetime ?
                  format(new Date(session.start_datetime), 'MMM dd, yyyy HH:mm') :
                  'Not available'
                }
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {session.status === 'ACTIVE' ? 'Duration' : 'End Time'}
              </h3>
              <p className="text-sm font-medium">
                {session.status === 'ACTIVE' && session.start_datetime ?
                  calculateDuration(session.start_datetime) :
                  session.end_datetime ?
                    format(new Date(session.end_datetime), 'MMM dd, yyyy HH:mm') :
                    'Not available'
                }
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Energy</h3>
              <p className="text-sm font-medium">{session.kwh ? `${session.kwh} kWh` : '0 kWh'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for additional information */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="energy">Energy Consumption</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Information
                </CardTitle>
                <CardDescription>
                  Details about the charging location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Location Name</h4>
                    <p>
                      {typeof session.location === 'object' && session.location?.name 
                        ? session.location.name 
                        : typeof session.location === 'number' 
                          ? `Location ID: ${session.location}` 
                          : 'Unknown Location'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">EVSE ID</h4>
                    <p>{session.evse_uid || 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Connector ID</h4>
                    <p>{session.connector_id || 'Not available'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Authentication Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Authentication Information
                </CardTitle>
                <CardDescription>
                  Details about the session authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Auth ID</h4>
                    <p>{session.auth_id || 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Auth Method</h4>
                    <p>{session.auth_method || 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Meter ID</h4>
                    <p>{session.meter_id || 'Not available'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Billing Information
                </CardTitle>
                <CardDescription>
                  Financial details of the charging session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Total Energy</h4>
                    <p>{session.kwh ? `${session.kwh} kWh` : '0 kWh'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Currency</h4>
                    <p>{session.currency || 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Total Cost</h4>
                    <p>
                      {session.total_cost !== null && session.total_cost !== undefined && session.currency
                        ? `${session.total_cost} ${session.currency}`
                        : 'Not available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Session Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2" />
                  Session Timeline
                </CardTitle>
                <CardDescription>
                  Key timestamps of the charging session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Start Time</h4>
                    <p>
                      {session.start_datetime
                        ? format(new Date(session.start_datetime), 'MMM dd, yyyy HH:mm:ss')
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">End Time</h4>
                    <p>
                      {session.end_datetime
                        ? format(new Date(session.end_datetime), 'MMM dd, yyyy HH:mm:ss')
                        : session.status === 'ACTIVE'
                          ? 'Session in progress'
                          : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Last Updated</h4>
                    <p>
                      {session.last_updated
                        ? format(new Date(session.last_updated), 'MMM dd, yyyy HH:mm:ss')
                        : 'Not available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Energy Consumption Tab */}
        <TabsContent value="energy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart4 className="h-5 w-5 mr-2" />
                Energy Consumption
              </CardTitle>
              <CardDescription>
                Energy consumption metrics for this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meterValues.length === 0 ? (
                <div className="text-center py-8">No energy metrics available for this session.</div>
              ) : (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value: any) => [`${value} kWh`, 'Energy']}
                      />
                      <Line
                        type="monotone"
                        dataKey="energy"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {meterValues.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Energy Readings</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Time</th>
                          <th className="px-4 py-2 text-left">Energy (kWh)</th>
                          <th className="px-4 py-2 text-left">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meterValues.map((value, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {format(new Date(value.timestamp), 'MMM dd, HH:mm:ss')}
                            </td>
                            <td className="px-4 py-2">{value.value}</td>
                            <td className="px-4 py-2">{value.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Commands Tab */}
        <TabsContent value="commands">
          <Card>
            <CardHeader>
              <CardTitle>Command History</CardTitle>
              <CardDescription>
                View all commands related to this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Command history feature will be implemented soon.
                <div className="mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/ocpi/commands')}
                  >
                    Go to Command Center
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default EMSPSessionDetailPage;
