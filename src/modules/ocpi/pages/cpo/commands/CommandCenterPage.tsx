import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OCPIApiService } from '../../../services';
import { OCPICommand } from '../../../types/session.types';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import {
  AlertCircle,
  Terminal,
  Clock,
  Send,
  RotateCw,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

interface CommandHistoryItem extends OCPICommand {
  executed_at: string;
}

const CommandCenterPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role } = useOCPIRole();
  const [activeTab, setActiveTab] = useState('send');
  
  // Form state
  const [commandType, setCommandType] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [evseUid, setEvseUid] = useState<string>('');
  const [connectorId, setConnectorId] = useState<string>('');
  
  // Mock command history for UI demonstration
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([
    {
      id: '1',
      command_id: 'cmd-001',
      command_type: 'STOP_SESSION',
      status: 'SUCCESS',
      result: { message: 'Session stopped successfully' },
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3550000).toISOString(),
      session_id: 'session-123',
      executed_at: new Date(Date.now() - 3550000).toISOString()
    },
    {
      id: '2',
      command_id: 'cmd-002',
      command_type: 'UNLOCK_CONNECTOR',
      status: 'FAILED',
      result: { error: 'Connector already unlocked' },
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7150000).toISOString(),
      location_id: 'loc-456',
      evse_uid: 'evse-789',
      connector_id: '1',
      executed_at: new Date(Date.now() - 7150000).toISOString()
    }
  ]);
  
  // Fetch active sessions for command targeting
  const { data: activeSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['ocpi', 'cpo', 'sessions', 'active'],
    queryFn: async () => {
      const response = await OCPIApiService.cpo.sessions.getAll({ status: 'ACTIVE' });
      return response.data?.results || [];
    },
    enabled: role === 'CPO'
  });
  
  // Fetch locations for command targeting
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['ocpi', 'locations'],
    queryFn: async () => {
      const response = await OCPIApiService.common.resources.locations.getAll();
      return response.data?.results || [];
    },
    enabled: role === 'CPO'
  });
  
  // Execute command mutation
  const commandMutation = useMutation({
    mutationFn: (commandData: any) => {
      // Select the appropriate API method based on command type
      switch (commandType) {
        case 'STOP_SESSION':
          return OCPIApiService.cpo.commands.stopSession({ session_id: sessionId });
        case 'UNLOCK_CONNECTOR':
          return OCPIApiService.cpo.commands.unlockConnector({
            location_id: locationId,
            evse_uid: evseUid,
            connector_id: connectorId
          });
        case 'RESERVE_NOW':
          // Simplified for demo purposes
          return OCPIApiService.cpo.commands.reserveNow({
            location_id: locationId,
            evse_uid: evseUid,
            connector_id: connectorId,
            token_id: 'token-123', // This would come from a form field in a real implementation
            expiry_date: new Date(Date.now() + 3600000).toISOString() 
          });
        default:
          throw new Error('Unsupported command type');
      }
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Command sent',
        description: `The ${commandType} command was sent successfully`,
        variant: 'default'
      });
      
      // Add to command history
      const newCommand: CommandHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        command_id: data.data?.command_id || Math.random().toString(36).substring(2, 9),
        command_type: commandType as any,
        status: 'PENDING',
        result: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        executed_at: new Date().toISOString(),
        session_id: commandType === 'STOP_SESSION' ? sessionId : undefined,
        location_id: commandType !== 'STOP_SESSION' ? locationId : undefined,
        evse_uid: commandType !== 'STOP_SESSION' ? evseUid : undefined,
        connector_id: commandType !== 'STOP_SESSION' ? connectorId : undefined
      };
      
      setCommandHistory([newCommand, ...commandHistory]);
      
      // Reset form
      setSessionId('');
      setLocationId('');
      setEvseUid('');
      setConnectorId('');
      setCommandType('');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'cpo', 'sessions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Command failed',
        description: `Failed to send command: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  });
  
  // Handle command form submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commandType) {
      toast({
        title: 'Missing information',
        description: 'Please select a command type',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate required fields based on command type
    if (commandType === 'STOP_SESSION' && !sessionId) {
      toast({
        title: 'Missing information',
        description: 'Please select a session to stop',
        variant: 'destructive'
      });
      return;
    }
    
    if (commandType !== 'STOP_SESSION' && (!locationId || !evseUid || !connectorId)) {
      toast({
        title: 'Missing information',
        description: 'Please provide all location, EVSE, and connector details',
        variant: 'destructive'
      });
      return;
    }
    
    commandMutation.mutate({});
  };
  
  // Get location by ID helper
  const getLocationById = (id: string) => {
    return locations?.find(location => location.location_id === id);
  };
  
  // Update EVSEs when location changes
  const handleLocationChange = (value: string) => {
    setLocationId(value);
    setEvseUid('');
    setConnectorId('');
  };
  
  // Get EVSEs for selected location
  const getEvses = () => {
    const location = getLocationById(locationId);
    return location?.evses || [];
  };
  
  // Get connectors for selected EVSE
  const getConnectors = () => {
    const location = getLocationById(locationId);
    const evse = location?.evses?.find(evse => evse.uid === evseUid);
    return evse?.connectors || [];
  };
  
  return (
    <PageLayout
      title="Command Center"
      description="Manage and monitor commands for charging sessions and connectors"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="send">Send Commands</TabsTrigger>
          <TabsTrigger value="history">Command History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send Command</CardTitle>
              <CardDescription>
                Send commands to active sessions or charging stations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCommandSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="command-type">Command Type</Label>
                  <Select
                    value={commandType}
                    onValueChange={(value) => setCommandType(value)}
                  >
                    <SelectTrigger id="command-type">
                      <SelectValue placeholder="Select command type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STOP_SESSION">Stop Session</SelectItem>
                      <SelectItem value="UNLOCK_CONNECTOR">Unlock Connector</SelectItem>
                      <SelectItem value="RESERVE_NOW">Reserve Now</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {commandType === 'STOP_SESSION' ? (
                  <div className="space-y-2">
                    <Label htmlFor="session-id">Session</Label>
                    <Select
                      value={sessionId}
                      onValueChange={(value) => setSessionId(value)}
                      disabled={isLoadingSessions || !activeSessions || activeSessions.length === 0}
                    >
                      <SelectTrigger id="session-id">
                        <SelectValue placeholder={isLoadingSessions ? "Loading sessions..." : "Select session"} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeSessions && activeSessions.map((session) => (
                          <SelectItem key={session.session_id} value={session.session_id}>
                            {session.session_id} - {session.location?.name || 'Unknown location'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {activeSessions && activeSessions.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        No active sessions available.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="location-id">Location</Label>
                      <Select
                        value={locationId}
                        onValueChange={handleLocationChange}
                        disabled={isLoadingLocations || !locations || locations.length === 0}
                      >
                        <SelectTrigger id="location-id">
                          <SelectValue placeholder={isLoadingLocations ? "Loading locations..." : "Select location"} />
                        </SelectTrigger>
                        <SelectContent>
                          {locations && locations.map((location) => (
                            <SelectItem key={location.location_id} value={location.location_id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="evse-uid">EVSE</Label>
                      <Select
                        value={evseUid}
                        onValueChange={(value) => setEvseUid(value)}
                        disabled={!locationId || getEvses().length === 0}
                      >
                        <SelectTrigger id="evse-uid">
                          <SelectValue placeholder="Select EVSE" />
                        </SelectTrigger>
                        <SelectContent>
                          {getEvses().map((evse) => (
                            <SelectItem key={evse.uid} value={evse.uid}>
                              {evse.uid} - {evse.evse_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="connector-id">Connector</Label>
                      <Select
                        value={connectorId}
                        onValueChange={(value) => setConnectorId(value)}
                        disabled={!evseUid || getConnectors().length === 0}
                      >
                        <SelectTrigger id="connector-id">
                          <SelectValue placeholder="Select connector" />
                        </SelectTrigger>
                        <SelectContent>
                          {getConnectors().map((connector) => (
                            <SelectItem key={connector.id} value={connector.id}>
                              Connector {connector.id} - {connector.standard}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={commandMutation.isPending}
                >
                  {commandMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Command
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Command History</CardTitle>
              <CardDescription>
                View the history and status of commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commandHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="mx-auto h-12 w-12 opacity-50 mb-2" />
                  <p>No commands have been sent yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {commandHistory.map((command) => (
                    <div 
                      key={command.id} 
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{command.command_type}</div>
                        <Badge 
                          variant={
                            command.status === 'SUCCESS' ? 'default' :
                            command.status === 'PENDING' ? 'outline' :
                            'destructive'
                          }
                        >
                          {command.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <Clock className="inline-block h-3 w-3 mr-1" />
                        {format(new Date(command.executed_at), 'MMM dd, HH:mm:ss')}
                      </div>
                      
                      <div className="text-sm">
                        {command.session_id && (
                          <div><span className="font-medium">Session:</span> {command.session_id}</div>
                        )}
                        {command.location_id && (
                          <div><span className="font-medium">Location:</span> {command.location_id}</div>
                        )}
                        {command.evse_uid && (
                          <div><span className="font-medium">EVSE:</span> {command.evse_uid}</div>
                        )}
                        {command.connector_id && (
                          <div><span className="font-medium">Connector:</span> {command.connector_id}</div>
                        )}
                      </div>
                      
                      {command.status !== 'PENDING' && (
                        <div className="text-sm mt-2 p-2 bg-muted rounded">
                          {command.status === 'SUCCESS' ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              {command.result?.message || 'Command executed successfully'}
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {command.result?.error || 'Command failed'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default CommandCenterPage;
