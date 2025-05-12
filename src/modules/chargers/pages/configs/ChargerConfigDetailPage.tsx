
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Loader2, AlertCircle, ArrowLeft, Terminal } from 'lucide-react';

const ChargerConfigDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch the config details
  const { data: config, isLoading, error } = useQuery({
    queryKey: ['chargerConfig', id],
    queryFn: async () => {
      if (!id) throw new Error('Configuration ID is required');
      return chargerApi.getChargerConfig(accessToken, id);
    },
    enabled: !!accessToken && !!id
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('Configuration ID is required');
      return chargerApi.deleteChargerConfig(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: 'Configuration Deleted',
        description: 'The configuration has been successfully deleted.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['chargerConfigs'] });
      navigate('/chargers/configs');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete configuration',
        variant: 'destructive',
      });
    },
  });
  
  // Set Configuration mutation for sending to charger
  const setConfigMutation = useMutation({
    mutationFn: () => {
      if (!config) throw new Error('Configuration data is required');
      return chargerApi.setConfiguration(accessToken, {
        charger_id: config.charger.toString(),
        key: config.key,
        value: config.value
      });
    },
    onSuccess: (data) => {
      toast({
        title: data.status === 'Accepted' ? 'Configuration Applied' : 'Configuration Rejected',
        description: data.message || (data.status === 'Accepted' 
          ? 'The configuration has been successfully applied to the charger.' 
          : 'The charger rejected the configuration.'),
        variant: data.status === 'Accepted' ? 'default' : 'destructive',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to apply configuration to charger',
        variant: 'destructive',
      });
    },
  });
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    deleteMutation.mutate();
  };
  
  // Apply config to charger
  const handleApplyConfig = () => {
    setConfigMutation.mutate();
  };
  
  // Loading state
  if (isLoading) {
    return (
      <PageLayout
        title="Loading Configuration"
        description="Retrieving configuration details..."
        backButton
        backTo="/chargers/configs"
      >
        <Helmet>
          <title>Charger Configuration Details | Electric Flow Admin</title>
        </Helmet>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading configuration details...</span>
        </div>
      </PageLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <PageLayout
        title="Error Loading Configuration"
        description="There was a problem loading the configuration details"
        backButton
        backTo="/chargers/configs"
      >
        <Helmet>
          <title>Error | Electric Flow Admin</title>
        </Helmet>
        
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load configuration details'}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-4">
          <Button onClick={() => navigate('/chargers/configs')}>
            Return to Configurations
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title={`Configuration: ${config?.key || ''}`}
      description="View and manage charger configuration details"
      backButton
      backTo="/chargers/configs"
    >
      <Helmet>
        <title>Configuration Details | Electric Flow Admin</title>
      </Helmet>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{config?.key}</CardTitle>
              <CardDescription>Configuration parameter details</CardDescription>
            </div>
            <Badge variant={config?.readonly ? "secondary" : "outline"}>
              {config?.readonly ? "Read Only" : "Writable"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Configuration ID</h3>
              <p className="text-sm text-muted-foreground">{config?.id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Charger ID</h3>
              <p className="text-sm text-muted-foreground">{config?.charger}</p>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="text-sm font-medium">Key</h3>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block mt-1">{config?.key}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Value</h3>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block mt-1">{config?.value}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">
                {getConfigDescription(config?.key)}
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleApplyConfig}
              disabled={setConfigMutation.isPending}
            >
              {setConfigMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Terminal className="mr-2 h-4 w-4" />
                  Apply to Charger
                </>
              )}
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/chargers/configs/edit/${id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the configuration parameter "{config?.key}" 
                    with value "{config?.value}" from charger {config?.charger}.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </PageLayout>
  );
};

// Helper function to provide descriptions for common configuration keys
const getConfigDescription = (key?: string): string => {
  if (!key) return 'No description available';
  
  const descriptions: Record<string, string> = {
    'HeartbeatInterval': 'How often the charger should send a heartbeat to the central system (in seconds).',
    'ConnectionTimeOut': 'Time in seconds before the charger times out a connection attempt.',
    'ResetRetries': 'Number of reset attempts before giving up.',
    'AuthorizationCacheEnabled': 'Whether the authorization cache is enabled on the charger.',
    'AllowOfflineTxForUnknownId': 'Whether the charger should allow transactions from unknown IDs when offline.',
    'LocalAuthListEnabled': 'Whether the local authorization list is enabled on the charger.',
    'LocalAuthListMaxLength': 'Maximum number of identifiers the local authorization list can store.',
    'UnlockConnectorOnEVSideDisconnect': 'Whether to unlock the connector when the EV side is disconnected.',
    'StopTransactionOnEVSideDisconnect': 'Whether to stop a transaction when the EV side is disconnected.',
    'StopTxnAlignedData': 'When set to true, the Charger will align the period of the MeterValues with the period of the transaction.',
    'MeterValueSampleInterval': 'The interval in seconds at which the Charger is sending MeterValues for a transaction.',
    'ClockAlignedDataInterval': 'The interval in seconds for sending clock-aligned meter values.',
    'WebSocketPingInterval': 'How frequent the charge point should send a ping to the central system (in seconds).',
  };
  
  return descriptions[key] || 'No detailed description available for this configuration key.';
};

export default ChargerConfigDetailPage;
