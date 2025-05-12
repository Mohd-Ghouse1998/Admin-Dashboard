import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plug, Power, Settings, Play, Square, RotateCcw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { connectorApi } from '@/modules/chargers/services/connectorService';
import { useAuth } from '@/hooks/useAuth';

// Status colors based on connector status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'bg-green-500';
    case 'Preparing':
    case 'SuspendedEV':
    case 'SuspendedEVSE':
      return 'bg-yellow-500';
    case 'Charging':
      return 'bg-blue-500';
    case 'Finishing':
      return 'bg-purple-500';
    case 'Reserved':
      return 'bg-orange-500';
    case 'Unavailable':
    case 'Faulted':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const ConnectorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch connector data
  const { 
    data: connector, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['connector', id],
    queryFn: () => connectorApi.getConnector(accessToken, id || ''),
    enabled: !!id && !!accessToken,
  });
  
  // Map UI status to API availability type
  const mapStatusToAvailability = (status: string): 'Operative' | 'Inoperative' => {
    return status === 'Available' ? 'Operative' : 'Inoperative';
  };
  
  // Change availability mutation
  const changeAvailabilityMutation = useMutation({
    mutationFn: (status: string) => {
      if (!connector) return Promise.reject(new Error('Connector data not available'));
      
      return connectorApi.changeAvailability(
        accessToken, 
        id || '', 
        {
          type: mapStatusToAvailability(status),
          connector_id: connector.connector_id,
          charger_id: String(connector.charger)
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Connector availability changed successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ['connector', id],
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to change connector availability.",
      });
    },
  });
  
  return (
    <PageLayout
      title="Connector Details"
      description={`Details for connector ID: ${id}`}
    >
      <Helmet>
        <title>Connector Details | Electric Flow Admin</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load connector details'}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading connector data...</p>
          </div>
        </div>
      ) : connector ? (
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link to="/chargers/connectors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Connectors
              </Link>
            </Button>
            <div className="flex space-x-2">
              <Button 
                size="sm"
                onClick={() => changeAvailabilityMutation.mutate(
                  connector.status === 'Available' ? 'Unavailable' : 'Available'
                )}
              >
                <Power className="mr-2 h-4 w-4" />
                {connector.status === 'Available' ? 'Make Unavailable' : 'Make Available'}
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/chargers/connectors/${id}/edit`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Connector
                </Link>
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Plug className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <CardTitle>Connector #{connector.connector_id}</CardTitle>
                  <CardDescription>
                    Connected to Charger #{connector.charger}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Connector Information</h3>
                    <Separator className="mb-3" />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">ID:</div>
                      <div className="text-sm">{connector.id}</div>
                      
                      <div className="text-sm font-medium">Charger:</div>
                      <div className="text-sm">
                        <Link 
                          to={`/chargers/chargers/${connector.charger}`}
                          className="text-primary hover:underline"
                        >
                          {connector.charger}
                        </Link>
                      </div>
                      
                      <div className="text-sm font-medium">Connector ID:</div>
                      <div className="text-sm">{connector.connector_id}</div>
                      
                      <div className="text-sm font-medium">Type:</div>
                      <div className="text-sm">
                        <Badge variant="outline">{connector.type}</Badge>
                      </div>
                      
                      <div className="text-sm font-medium">Status:</div>
                      <div className="text-sm flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(connector.status)}`}></div>
                        {connector.status}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Actions</h3>
                    <Separator className="mb-3" />
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button size="sm" className="justify-start" onClick={() => toast({
                        title: "Starting Transaction",
                        description: "To start a transaction, you need to navigate to the Remote Control section."
                      })}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Transaction
                      </Button>
                      
                      <Button size="sm" className="justify-start" variant="outline" onClick={() => toast({
                        title: "Stop Transaction",
                        description: "To stop a transaction, you need to navigate to the Remote Control section."
                      })}>
                        <Square className="mr-2 h-4 w-4" />
                        Stop Transaction
                      </Button>
                      
                      <Button size="sm" className="justify-start" variant="outline" onClick={() => toast({
                        title: "Reset Connector",
                        description: "This action is not available directly. Please use the Reset Charger functionality."
                      })}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Connector
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {connector.status === 'Faulted' && (
                <Alert className="mt-6" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Connector Faulted</AlertTitle>
                  <AlertDescription>
                    This connector is currently in a faulted state. It may need maintenance or reset to function properly.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            Connector with ID {id} could not be found.
          </AlertDescription>
        </Alert>
      )}
    </PageLayout>
  );
};

export default ConnectorDetailPage;
