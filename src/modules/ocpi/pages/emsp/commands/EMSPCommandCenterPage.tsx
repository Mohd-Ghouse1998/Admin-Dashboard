import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
import { OCPIApiService } from '../../../services';
import {
  CommandType,
  CommandStatus,
  OCPICommand,
  StartSessionRequest,
  StopSessionRequest,
  ReserveNowRequest,
  UnlockConnectorRequest,
  CancelReservationRequest
} from '../../../types/command.types';
import {
  AlertCircle,
  Terminal,
  Clock,
  Send,
  RotateCw,
  Loader2,
  CheckCircle2,
  Play,
  Square,
  Unlock,
  Calendar,
  XCircle
} from 'lucide-react';

const EMSPCommandCenterPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { syncRoleWithBackend, role } = useOCPIRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('send');
  
  // Form state for different command types
  const [commandType, setCommandType] = useState<CommandType>(CommandType.START_SESSION);
  
  // START_SESSION fields
  const [startSessionData, setStartSessionData] = useState<StartSessionRequest>({
    location_id: '',
    evse_uid: '',
    connector_id: '',
    token_uid: '',
    authorization_reference: ''
  });
  
  // STOP_SESSION fields
  const [stopSessionData, setStopSessionData] = useState<StopSessionRequest>({
    session_id: ''
  });
  
  // UNLOCK_CONNECTOR fields
  const [unlockConnectorData, setUnlockConnectorData] = useState<UnlockConnectorRequest>({
    location_id: '',
    evse_uid: '',
    connector_id: ''
  });
  
  // RESERVE_NOW fields
  const [reserveNowData, setReserveNowData] = useState<ReserveNowRequest>({
    location_id: '',
    evse_uid: '',
    connector_id: '',
    token_uid: '',
    expiry_date: '',
    authorization_reference: ''
  });
  
  // CANCEL_RESERVATION fields
  const [cancelReservationData, setCancelReservationData] = useState<CancelReservationRequest>({
    reservation_id: ''
  });
  
  // Get command history
  const { data: commandHistory, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['ocpi', 'emsp', 'commands', 'recent'],
    queryFn: async () => {
      const response = await OCPIApiService.emsp.commands.getAll({ limit: 5 });
      return response.data.results;
    },
    enabled: role === 'EMSP' && activeTab === 'history'
  });
  
  // Fetch locations for command targeting
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['ocpi', 'emsp', 'locations'],
    queryFn: async () => {
      const response = await OCPIApiService.emsp.commands.getAll();
      return response.data.results || [];
    },
    enabled: role === 'EMSP'
  });
  
  // Fetch active sessions for command targeting
  const { data: activeSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['ocpi', 'emsp', 'sessions', 'active'],
    queryFn: async () => {
      const response = await OCPIApiService.emsp.commands.getAll({ status: CommandStatus.PROCESSING });  // Using PROCESSING as a proxy for active sessions
      return response.data.results || [];
    },
    enabled: role === 'EMSP'
  });
  
  // Execute command mutation
  const commandMutation = useMutation({
    mutationFn: async () => {
      // Select the appropriate API method based on command type
      switch (commandType) {
        case CommandType.START_SESSION:
          return await OCPIApiService.emsp.commands.startSession(startSessionData);
        case CommandType.STOP_SESSION:
          return await OCPIApiService.emsp.commands.stopSession(stopSessionData);
        case CommandType.UNLOCK_CONNECTOR:
          return await OCPIApiService.emsp.commands.unlockConnector(unlockConnectorData);
        case CommandType.RESERVE_NOW:
          return await OCPIApiService.emsp.commands.reserveNow(reserveNowData);
        case CommandType.CANCEL_RESERVATION:
          return await OCPIApiService.emsp.commands.cancelReservation(cancelReservationData);
        default:
          throw new Error(`Unsupported command type: ${commandType}`);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Command Sent Successfully",
        description: `${commandType} command has been sent. Command ID: ${data.data.command_id}`,
        variant: "default"
      });
      
      // Reset form data based on command type
      switch (commandType) {
        case CommandType.START_SESSION:
          setStartSessionData({
            location_id: '',
            evse_uid: '',
            connector_id: '',
            token_uid: '',
            authorization_reference: ''
          });
          break;
        case CommandType.STOP_SESSION:
          setStopSessionData({ session_id: '' });
          break;
        case CommandType.UNLOCK_CONNECTOR:
          setUnlockConnectorData({
            location_id: '',
            evse_uid: '',
            connector_id: ''
          });
          break;
        case CommandType.RESERVE_NOW:
          setReserveNowData({
            location_id: '',
            evse_uid: '',
            connector_id: '',
            token_uid: '',
            expiry_date: '',
            authorization_reference: ''
          });
          break;
        case CommandType.CANCEL_RESERVATION:
          setCancelReservationData({ reservation_id: '' });
          break;
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'emsp', 'commands'] });
      if (activeTab === 'history') {
        refetchHistory();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Command Failed",
        description: error.response?.data?.detail || error.message || "Failed to send command",
        variant: "destructive"
      });
    }
  });
  
  useEffect(() => {
    // Ensure the user has the EMSP role before fetching data
    syncRoleWithBackend('EMSP');
  }, [syncRoleWithBackend]);
  
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation based on command type
    if (commandType === CommandType.START_SESSION) {
      if (!startSessionData.location_id || !startSessionData.evse_uid || !startSessionData.token_uid) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    } else if (commandType === CommandType.STOP_SESSION) {
      if (!stopSessionData.session_id) {
        toast({
          title: "Validation Error",
          description: "Session ID is required",
          variant: "destructive"
        });
        return;
      }
    } else if (commandType === CommandType.UNLOCK_CONNECTOR) {
      if (!unlockConnectorData.location_id || !unlockConnectorData.evse_uid || !unlockConnectorData.connector_id) {
        toast({
          title: "Validation Error",
          description: "Location, EVSE and Connector IDs are required",
          variant: "destructive"
        });
        return;
      }
    } else if (commandType === CommandType.RESERVE_NOW) {
      if (!reserveNowData.location_id || !reserveNowData.token_uid) {
        toast({
          title: "Validation Error",
          description: "Location ID and Token UID are required",
          variant: "destructive"
        });
        return;
      }
    } else if (commandType === CommandType.CANCEL_RESERVATION) {
      if (!cancelReservationData.reservation_id) {
        toast({
          title: "Validation Error",
          description: "Reservation ID is required",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Execute the command
    commandMutation.mutate();
  };
  
  // Command form based on command type
  const renderCommandForm = () => {
    switch (commandType) {
      case CommandType.START_SESSION:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_id">Location ID *</Label>
                <Input
                  id="location_id"
                  value={startSessionData.location_id}
                  onChange={(e) => setStartSessionData({ ...startSessionData, location_id: e.target.value })}
                  placeholder="Location ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evse_uid">EVSE UID *</Label>
                <Input
                  id="evse_uid"
                  value={startSessionData.evse_uid}
                  onChange={(e) => setStartSessionData({ ...startSessionData, evse_uid: e.target.value })}
                  placeholder="EVSE UID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connector_id">Connector ID</Label>
                <Input
                  id="connector_id"
                  value={startSessionData.connector_id}
                  onChange={(e) => setStartSessionData({ ...startSessionData, connector_id: e.target.value })}
                  placeholder="Connector ID (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token_uid">Token UID *</Label>
                <Input
                  id="token_uid"
                  value={startSessionData.token_uid}
                  onChange={(e) => setStartSessionData({ ...startSessionData, token_uid: e.target.value })}
                  placeholder="Token UID"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="authorization_reference">Authorization Reference</Label>
                <Input
                  id="authorization_reference"
                  value={startSessionData.authorization_reference}
                  onChange={(e) => setStartSessionData({ ...startSessionData, authorization_reference: e.target.value })}
                  placeholder="Authorization Reference (optional)"
                />
              </div>
            </div>
          </div>
        );
      
      case CommandType.STOP_SESSION:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session_id">Session ID *</Label>
              <Input
                id="session_id"
                value={stopSessionData.session_id}
                onChange={(e) => setStopSessionData({ ...stopSessionData, session_id: e.target.value })}
                placeholder="Session ID"
                required
              />
            </div>
          </div>
        );
      
      case CommandType.UNLOCK_CONNECTOR:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_id">Location ID *</Label>
                <Input
                  id="location_id"
                  value={unlockConnectorData.location_id}
                  onChange={(e) => setUnlockConnectorData({ ...unlockConnectorData, location_id: e.target.value })}
                  placeholder="Location ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evse_uid">EVSE UID *</Label>
                <Input
                  id="evse_uid"
                  value={unlockConnectorData.evse_uid}
                  onChange={(e) => setUnlockConnectorData({ ...unlockConnectorData, evse_uid: e.target.value })}
                  placeholder="EVSE UID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connector_id">Connector ID *</Label>
                <Input
                  id="connector_id"
                  value={unlockConnectorData.connector_id}
                  onChange={(e) => setUnlockConnectorData({ ...unlockConnectorData, connector_id: e.target.value })}
                  placeholder="Connector ID"
                  required
                />
              </div>
            </div>
          </div>
        );
      
      case CommandType.RESERVE_NOW:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_id">Location ID *</Label>
                <Input
                  id="location_id"
                  value={reserveNowData.location_id}
                  onChange={(e) => setReserveNowData({ ...reserveNowData, location_id: e.target.value })}
                  placeholder="Location ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evse_uid">EVSE UID</Label>
                <Input
                  id="evse_uid"
                  value={reserveNowData.evse_uid}
                  onChange={(e) => setReserveNowData({ ...reserveNowData, evse_uid: e.target.value })}
                  placeholder="EVSE UID (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connector_id">Connector ID</Label>
                <Input
                  id="connector_id"
                  value={reserveNowData.connector_id}
                  onChange={(e) => setReserveNowData({ ...reserveNowData, connector_id: e.target.value })}
                  placeholder="Connector ID (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token_uid">Token UID *</Label>
                <Input
                  id="token_uid"
                  value={reserveNowData.token_uid}
                  onChange={(e) => setReserveNowData({ ...reserveNowData, token_uid: e.target.value })}
                  placeholder="Token UID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="datetime-local"
                  value={reserveNowData.expiry_date}
                  onChange={(e) => setReserveNowData({ ...reserveNowData, expiry_date: e.target.value })}
                  placeholder="Expiry Date (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorization_reference">Authorization Reference</Label>
                <Input
                  id="authorization_reference"
                  value={reserveNowData.authorization_reference}
                  onChange={(e) => setReserveNowData({ ...reserveNowData, authorization_reference: e.target.value })}
                  placeholder="Authorization Reference (optional)"
                />
              </div>
            </div>
          </div>
        );
      
      case CommandType.CANCEL_RESERVATION:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservation_id">Reservation ID *</Label>
              <Input
                id="reservation_id"
                value={cancelReservationData.reservation_id}
                onChange={(e) => setCancelReservationData({ ...cancelReservationData, reservation_id: e.target.value })}
                placeholder="Reservation ID"
                required
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-4">
            <p>Please select a command type</p>
          </div>
        );
    }
  };
  
  // Get icon for command type
  const getCommandTypeIcon = (type: CommandType) => {
    switch (type) {
      case CommandType.START_SESSION:
        return <Play className="h-4 w-4" />;
      case CommandType.STOP_SESSION:
        return <Square className="h-4 w-4" />;
      case CommandType.UNLOCK_CONNECTOR:
        return <Unlock className="h-4 w-4" />;
      case CommandType.RESERVE_NOW:
        return <Calendar className="h-4 w-4" />;
      case CommandType.CANCEL_RESERVATION:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Terminal className="h-4 w-4" />;
    }
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case CommandStatus.SUCCESSFUL:
      case CommandStatus.ACCEPTED:
        return 'default';
      case CommandStatus.PENDING:
      case CommandStatus.PROCESSING:
        return 'outline';
      case CommandStatus.FAILED:
      case CommandStatus.REJECTED:
        return 'destructive';
      case CommandStatus.CANCELLED:
      case CommandStatus.EXPIRED:
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  return (
    <PageLayout title="Command Center" description="Send and monitor OCPI commands to charging stations">
      <Tabs defaultValue="send" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Send Commands</TabsTrigger>
          <TabsTrigger value="history">Recent Commands</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send OCPI Command</CardTitle>
              <CardDescription>
                Send commands to charging stations via the OCPI network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCommandSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="command-type">Command Type</Label>
                  <Select 
                    value={commandType} 
                    onValueChange={(value) => setCommandType(value as CommandType)}
                  >
                    <SelectTrigger id="command-type">
                      <SelectValue placeholder="Select command type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CommandType.START_SESSION}>
                        <div className="flex items-center">
                          <Play className="mr-2 h-4 w-4" />
                          <span>Start Session</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={CommandType.STOP_SESSION}>
                        <div className="flex items-center">
                          <Square className="mr-2 h-4 w-4" />
                          <span>Stop Session</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={CommandType.UNLOCK_CONNECTOR}>
                        <div className="flex items-center">
                          <Unlock className="mr-2 h-4 w-4" />
                          <span>Unlock Connector</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={CommandType.RESERVE_NOW}>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Reserve Now</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={CommandType.CANCEL_RESERVATION}>
                        <div className="flex items-center">
                          <XCircle className="mr-2 h-4 w-4" />
                          <span>Cancel Reservation</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Command Form */}
                <div className="pt-4 border-t">
                  {renderCommandForm()}
                </div>
                
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
              <CardTitle>Recent Commands</CardTitle>
              <CardDescription>
                View your recently sent commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading commands...</span>
                </div>
              ) : commandHistory?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="mx-auto h-12 w-12 opacity-50 mb-2" />
                  <p>No commands have been sent yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {commandHistory?.map((command: OCPICommand) => (
                    <div 
                      key={command.id} 
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium flex items-center">
                          {getCommandTypeIcon(command.command_type as CommandType)}
                          <span className="ml-2">{command.command_type}</span>
                        </div>
                        <Badge 
                          variant={getStatusBadgeVariant(command.status)}
                        >
                          {command.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <Clock className="inline-block h-3 w-3 mr-1" />
                        {format(new Date(command.created_at), 'MMM dd, HH:mm:ss')}
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
                      
                      {command.status !== CommandStatus.PENDING && (
                        <div className="text-sm mt-2 p-2 bg-muted rounded">
                          {command.status === CommandStatus.SUCCESSFUL ? (
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
                      
                      <div className="pt-2 flex justify-end">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/ocpi/emsp/commands/${command.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2 flex justify-center">
                    <Button 
                      variant="secondary"
                      onClick={() => navigate('/ocpi/emsp/commands')}
                    >
                      View All Commands
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default EMSPCommandCenterPage;
