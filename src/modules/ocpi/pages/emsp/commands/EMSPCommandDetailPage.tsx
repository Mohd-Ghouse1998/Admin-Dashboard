import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  ArrowLeft, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Terminal,
  Server,
  MapPin,
  Plug,
  KeyRound,
  CalendarClock,
  MessageSquare,
  Send,
  RotateCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import { OCPIApiService } from '../../../services';
import { CommandStatus, CommandType } from '../../../types/command.types';

const EMSPCommandDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { syncRoleWithBackend, role } = useOCPIRole();
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Fetch command details
  const { data: command, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ocpi', 'emsp', 'command', id],
    queryFn: async () => {
      try {
        if (!id) throw new Error('Command ID is required');
        const response = await OCPIApiService.emsp.commands.getById(id);
        return response.data;
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your session may have expired. Please try again.",
            variant: "destructive"
          });
        }
        throw error;
      }
    },
    enabled: role === 'EMSP' && !!id,
    refetchInterval: refreshInterval,
  });

  useEffect(() => {
    // Ensure the user has the EMSP role before fetching data
    syncRoleWithBackend('EMSP');
  }, [syncRoleWithBackend]);

  useEffect(() => {
    // Set up auto-refresh for commands that are in a pending or processing state
    if (command && (
      command.status === CommandStatus.PENDING || 
      command.status === CommandStatus.PROCESSING || 
      command.status === CommandStatus.ACCEPTED
    )) {
      setRefreshInterval(5000); // Refresh every 5 seconds
    } else {
      setRefreshInterval(null); // Stop auto-refresh
    }

    return () => {
      setRefreshInterval(null); // Clean up on unmount
    };
  }, [command]);

  const handleBack = () => {
    navigate('/ocpi/emsp/commands');
  };

  const handleSendNewCommand = () => {
    navigate('/ocpi/emsp/command-center');
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case CommandStatus.SUCCESSFUL:
      case CommandStatus.ACCEPTED:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case CommandStatus.PENDING:
      case CommandStatus.PROCESSING:
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case CommandStatus.FAILED:
      case CommandStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case CommandStatus.CANCELLED:
      case CommandStatus.EXPIRED:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Terminal className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCommandTypeDescription = (type: CommandType) => {
    switch (type) {
      case CommandType.START_SESSION:
        return "Start a charging session at the specified location";
      case CommandType.STOP_SESSION:
        return "Stop an active charging session";
      case CommandType.UNLOCK_CONNECTOR:
        return "Unlock a connector at the specified location";
      case CommandType.RESERVE_NOW:
        return "Reserve a charging point for future use";
      case CommandType.CANCEL_RESERVATION:
        return "Cancel an existing reservation";
      default:
        return "Execute a command on the charging infrastructure";
    }
  };

  return (
    <PageLayout title="Command Details" description="Detailed information about OCPI command execution">
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Command History
        </Button>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              <span>Loading command details...</span>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-2" />
              <h3 className="font-semibold text-lg">Error Loading Command</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                {error instanceof Error ? error.message : 'An unexpected error occurred.'}
              </p>
              <div className="flex space-x-2 mt-4">
                <Button onClick={() => refetch()}>Try Again</Button>
                <Button variant="outline" onClick={handleBack}>Go Back</Button>
              </div>
            </CardContent>
          </Card>
        ) : command ? (
          <>
            {/* Command Summary Card */}
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <span className="mr-4">{command.command_type}</span>
                    <Badge variant={getStatusBadgeVariant(command.status)}>
                      {command.status}
                    </Badge>
                    {(command.status === CommandStatus.PENDING || command.status === CommandStatus.PROCESSING) && (
                      <RotateCw className="ml-2 h-4 w-4 animate-spin text-blue-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {getCommandTypeDescription(command.command_type as CommandType)}
                  </CardDescription>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {format(new Date(command.created_at), 'PPP p')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Update */}
                <div className="flex items-center space-x-4 p-4 bg-muted rounded-md">
                  {getStatusIcon(command.status)}
                  <div>
                    <h4 className="font-semibold">Status: {command.status}</h4>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {format(new Date(command.updated_at), 'PPP p')}
                    </p>
                    {(command.status === CommandStatus.PENDING || command.status === CommandStatus.PROCESSING) && (
                      <p className="text-sm text-blue-500 mt-1">
                        Auto-refreshing status...
                      </p>
                    )}
                  </div>
                </div>

                {/* Command Target Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Command Target</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {command.session_id && (
                      <div className="flex items-start space-x-3">
                        <Server className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Session ID</h4>
                          <p>{command.session_id}</p>
                        </div>
                      </div>
                    )}
                    {command.location_id && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Location ID</h4>
                          <p>{command.location_id}</p>
                        </div>
                      </div>
                    )}
                    {command.evse_uid && (
                      <div className="flex items-start space-x-3">
                        <Terminal className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">EVSE UID</h4>
                          <p>{command.evse_uid}</p>
                        </div>
                      </div>
                    )}
                    {command.connector_id && (
                      <div className="flex items-start space-x-3">
                        <Plug className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Connector ID</h4>
                          <p>{command.connector_id}</p>
                        </div>
                      </div>
                    )}
                    {command.token_uid && (
                      <div className="flex items-start space-x-3">
                        <KeyRound className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Token UID</h4>
                          <p>{command.token_uid}</p>
                        </div>
                      </div>
                    )}
                    {command.reservation_id && (
                      <div className="flex items-start space-x-3">
                        <CalendarClock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Reservation ID</h4>
                          <p>{command.reservation_id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Command ID and Reference */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Command Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Terminal className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Command ID</h4>
                        <p className="font-mono text-sm">{command.command_id}</p>
                      </div>
                    </div>
                    {command.authorization_reference && (
                      <div className="flex items-start space-x-3">
                        <KeyRound className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Authorization Reference</h4>
                          <p>{command.authorization_reference}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Result/Response */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Command Result</h3>
                  {command.result ? (
                    <div className="p-4 rounded-md bg-muted space-y-2">
                      {command.result.message && (
                        <div className="flex items-start space-x-3">
                          <MessageSquare className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">Message</h4>
                            <p>{command.result.message}</p>
                          </div>
                        </div>
                      )}
                      {command.result.error && (
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 mt-0.5 text-destructive" />
                          <div>
                            <h4 className="font-medium">Error</h4>
                            <p className="text-destructive">{command.result.error}</p>
                          </div>
                        </div>
                      )}
                      {Object.entries(command.result).map(([key, value]) => {
                        // Skip already displayed fields
                        if (key === 'message' || key === 'error') return null;
                        return (
                          <div key={key} className="flex items-start space-x-3">
                            <Terminal className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{key}</h4>
                              <p>{JSON.stringify(value)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No result information available yet.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Command History
                </Button>
                <Button onClick={handleSendNewCommand}>
                  <Send className="mr-2 h-4 w-4" />
                  Send New Command
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-2" />
              <h3 className="font-semibold text-lg">Command Not Found</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                The requested command could not be found.
              </p>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Go Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default EMSPCommandDetailPage;
