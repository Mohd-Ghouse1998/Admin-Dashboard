import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  AlertCircle, 
  Edit, 
  MapPin, 
  Calendar, 
  Zap, 
  Plug, 
  Tag, 
  Settings, 
  Server, 
  Battery, 
  Trash2, 
  ArrowUpDown,
  ExternalLink,
  PlayCircle,
  StopCircle,
  Loader2
} from 'lucide-react';
import { useChargers } from '@/modules/chargers/hooks/useChargers';
import { format } from 'date-fns';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ChargerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCharger, deleteCharger } = useChargers();
  
  const [charger, setCharger] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    const fetchChargerDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getCharger(id);
        
        // Add detailed console logs to debug the response structure
        console.log('Charger API response:', response);
        
        // Handle different possible response formats
        let processedData = null;
        
        // Case 1: GeoJSON Feature format (as shown in the sample response)
        if (response && response.type === 'Feature' && response.properties) {
          console.log('Processing GeoJSON Feature');
          // For GeoJSON Feature, we need to extract from properties and maintain top-level IDs
          processedData = {
            // Copy all properties from the properties object
            ...response.properties,
            // Keep the top-level fields for reference
            feature_id: response.id,
            feature_type: response.type,
            geometry: response.geometry,
            // Make sure type is available at top-level
            type: response.properties.type || 'Unknown'
          };
          console.log('Processed charger data:', processedData);
        } 
        // Case 2: Direct object with properties already flattened
        else if (response && typeof response === 'object' && response.id) {
          console.log('Processing direct object');
          processedData = response;
        }
        // Case 3: GeoJSON FeatureCollection with features array
        else if (response && response.features && Array.isArray(response.features) && response.features.length > 0) {
          console.log('Processing FeatureCollection');
          const feature = response.features[0];
          processedData = {
            ...feature.properties,
            feature_id: feature.id || id,
            feature_type: feature.type,
            geometry: feature.geometry,
            type: feature.properties.type || 'Unknown'
          };
        }
        // Case 4: Raw data without proper structure
        else {
          console.log('Processing raw data');
          processedData = response;
        }
        
        if (processedData) {
          console.log('Final processed charger data:', processedData);
          setCharger(processedData);
        } else {
          console.error('Could not process charger data from response:', response);
          setError(new Error('Could not process charger data from response'));
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching charger details:', err);
        setError(err instanceof Error ? err : new Error('Failed to load charger details'));
        setIsLoading(false);
      }
    };
    
    fetchChargerDetails();
  }, [id, getCharger]);
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteCharger(id);
      navigate('/chargers');
    } catch (err) {
      console.error('Error deleting charger:', err);
      // You could show an error toast here
    }
  };
  
  if (isLoading) {
    return (
      <PageLayout
        title="Loading Charger Details"
        description="Please wait..."
        backButton
        backTo="/chargers"
      >
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading charger information...</span>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout
        title="Error Loading Charger"
        description="There was a problem retrieving charger details"
        backButton
        backTo="/chargers"
      >
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
        
        <div className="mt-8 flex justify-center">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PageLayout>
    );
  }
  
  if (!charger) {
    return (
      <PageLayout
        title="Charger Not Found"
        description="The requested charger could not be found"
        backButton
        backTo="/chargers"
      >
        <div className="py-12 text-center">
          <p className="text-muted-foreground">This charger may have been deleted or does not exist.</p>
          <Button asChild className="mt-4">
            <Link to="/chargers">Return to Charger List</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  // Determine status badges and styling with null checks for all properties
  const statusVariant = (charger.online === true) 
    ? 'success' 
    : 'danger';
  
  const connectionStatus = (charger.online === true) 
    ? 'Online' 
    : 'Offline';
  
  const enabledStatus = (charger.enabled === true) 
    ? 'Enabled' 
    : 'Disabled';
  
  const enabledVariant = (charger.enabled === true) 
    ? 'success' 
    : 'warning';
  
  const verifiedStatus = (charger.verified === true) 
    ? 'Verified' 
    : 'Unverified';
  
  const verifiedVariant = (charger.verified === true) 
    ? 'success' 
    : 'neutral';
  
  const lastHeartbeat = charger.last_heartbeat 
    ? format(new Date(charger.last_heartbeat), 'PPpp')
    : 'Never';
    
  return (
    <PageLayout
      title={charger.name || `Charger ${charger.charger_id || 'Unknown'}`}
      description={charger.address || 'EV Charging Station'}
      backButton
      backTo="/chargers"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/chargers/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          {charger.enabled ? (
            <Button variant="outline">
              <StopCircle className="mr-2 h-4 w-4" />
              Disable
            </Button>
          ) : (
            <Button variant="outline">
              <PlayCircle className="mr-2 h-4 w-4" />
              Enable
            </Button>
          )}
          
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <Helmet>
        <title>{charger.name || `Charger ${charger.charger_id || 'Unknown'}`} | Electric Flow Admin Portal</title>
      </Helmet>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Charger ID</h3>
                <p className="text-lg font-semibold">{charger.charger_id || 'Unknown'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                <div className="flex items-center">
                  <Badge variant="outline">{charger.type || 'Unknown'}</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Vendor</h3>
                <p className="text-lg">
                  {charger.vendor ? charger.vendor : 'Not specified'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Model</h3>
                <p className="text-lg">
                  {charger.model ? charger.model : 'Not specified'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Price per kWh</h3>
                <p className="text-lg font-semibold">
                  {charger.price_per_kwh !== undefined && charger.price_per_kwh !== null 
                    ? `₹${Number(charger.price_per_kwh).toFixed(2)}` 
                    : 'Not specified'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Heartbeat</h3>
                <p className="text-lg">{lastHeartbeat}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              Status
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Connection</h3>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={connectionStatus} variant={statusVariant} />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Seen</h3>
                <p className="text-lg">{lastHeartbeat}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Operational Status</h3>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={enabledStatus} variant={enabledVariant} />
                  <StatusBadge status={verifiedStatus} variant={verifiedVariant} />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="text-lg">{charger.address || 'Not specified'}</p>
              </div>
              
              <Separator />
              
              {charger.geometry && charger.geometry.coordinates && Array.isArray(charger.geometry.coordinates) && charger.geometry.coordinates.length >= 2 ? (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Coordinates</h3>
                  <div className="mt-1">
                    <p>Latitude: {charger.geometry.coordinates[1]}</p>
                    <p>Longitude: {charger.geometry.coordinates[0]}</p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://maps.google.com/?q=${charger.geometry.coordinates[1]},${charger.geometry.coordinates[0]}`} target="_blank" rel="noopener noreferrer">
                          <MapPin className="mr-2 h-4 w-4" /> View on Map
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Coordinates</h3>
                  <p className="text-muted-foreground">No location data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Connectors Card */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Plug className="mr-2 h-5 w-5" />
                Charging Connectors
              </CardTitle>
              <CardDescription>Available connector types and status</CardDescription>
            </div>
            
            <Button variant="outline" size="sm" asChild>
              <Link to={`/chargers/${id}/connectors/add`}>
                Add Connector
              </Link>
            </Button>
          </CardHeader>
          
          <CardContent>
            {!charger.connectors || !Array.isArray(charger.connectors) || charger.connectors.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No connectors are configured for this charger.</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to={`/chargers/${id}/connectors/add`}>
                    Add Your First Connector
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {charger.connectors.map((connector: any) => (
                  <Card key={connector.id || connector.connector_id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{connector.type || 'Unknown Type'}</h3>
                          <p className="text-sm text-muted-foreground">Connector {connector.connector_id}</p>
                        </div>
                        
                        <StatusBadge 
                          status={connector.status} 
                          variant={connector.status === 'Available' ? 'success' : 
                            connector.status === 'Charging' ? 'info' : 'neutral'} 
                        />
                        
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/chargers/${id}/connectors/${connector.id}`}>
                            <Settings className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Events and Logs Section - Could be expanded in the future */}
      <div className="mt-8">
        <Tabs defaultValue="events">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest activities from this charger</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No events recorded yet.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Charging Transactions</CardTitle>
                <CardDescription>Charging sessions and billing information</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No transactions recorded yet.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Debug information and system messages</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No logs available.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Charger</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete charger "{charger.name || charger.charger_id || 'Unknown'}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting this charger will remove all associated data, including transaction history and configurations.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Charger</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ChargerDetailPage;
