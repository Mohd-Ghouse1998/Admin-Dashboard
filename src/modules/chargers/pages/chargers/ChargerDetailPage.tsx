import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  ArrowUpDown,
  ExternalLink,
  PlayCircle,
  StopCircle,
  Loader2
} from 'lucide-react';
import { useChargers } from '@/modules/chargers/hooks/useChargers';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
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
  DialogTitle
} from '@/components/ui/dialog';
import { DetailTemplate } from '@/components/templates/detail/DetailTemplate';
import { DetailSection } from '@/components/templates/detail/DetailSection';

const ChargerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { deleteCharger } = useChargers();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Use React Query to fetch the charger details
  const { 
    data: charger, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['charger', id],
    queryFn: async () => {
      if (!id) throw new Error('Charger ID is missing');
      
      console.log('Fetching charger with ID:', id);
      
      try {
        // Import the charger service directly to avoid using the hook function
        const { chargerApi } = await import('@/modules/chargers/services/chargerService');
        const response = await chargerApi.getCharger(accessToken, id);
        
        // Add detailed console logs for debugging
        console.log('Charger API raw response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'No keys');
        
        // Handle different response formats
        if (response?.type === 'Feature' && response?.properties) {
          console.log('Normalizing GeoJSON Feature');
          return {
            ...response.properties,
            id: response.id || id,
            geometry: response.geometry
          };
        } else if (response?.features && Array.isArray(response.features) && response.features.length > 0) {
          console.log('Normalizing GeoJSON FeatureCollection');
          const feature = response.features[0];
          return {
            ...feature.properties,
            id: feature.id || id,
            geometry: feature.geometry
          };
        }
        
        return response;
      } catch (err) {
        console.error('Error fetching charger details:', err);
        throw err instanceof Error ? err : new Error('Failed to load charger details');
      }
    },
    // Only refetch when id or accessToken changes
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    // Enable the query only when we have an id
    enabled: !!id
  });
  
  // Handle charger deletion
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteCharger(id);
      navigate('/chargers');
    } catch (err) {
      console.error('Error deleting charger:', err);
    }
    setShowDeleteDialog(false);
  };
  
  // Safe property access with defaults
  const chargerName = charger?.name || charger?.charger_id || 'Unnamed Charger';
  const chargerAddress = charger?.address || 'No address available';
  const chargerVendor = charger?.vendor || 'Unknown Vendor';
  const chargerModel = charger?.model || 'Unknown Model';
  const chargerType = charger?.type || 'Unknown Type';
  const chargerPrice = charger?.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Not set';
  
  // Connection status
  const isOnline = charger?.online === true;
  const isEnabled = charger?.enabled === true;
  const isVerified = charger?.verified === true;
  
  // Status indicators
  const connectionStatus = isOnline ? 'Online' : 'Offline';
  const statusVariant = isOnline ? 'success' : 'danger';
  const enabledStatus = isEnabled ? 'Enabled' : 'Disabled';
  const enabledVariant = isEnabled ? 'success' : 'warning';
  const verifiedStatus = isVerified ? 'Verified' : 'Unverified';
  const verifiedVariant = isVerified ? 'success' : 'neutral';
  
  // Format timestamp or use default
  let lastHeartbeat = 'Never';
  try {
    if (charger?.last_heartbeat) {
      lastHeartbeat = format(new Date(charger.last_heartbeat), 'PPpp');
    }
  } catch (err) {
    console.error('Error formatting last_heartbeat:', err);
  }
  
  // Actions array for the detail template
  const detailActions = [
    {
      label: 'Remote Start',
      icon: <PlayCircle className="h-4 w-4" />,
      onClick: () => alert('Remote Start functionality not implemented yet'),
      variant: 'outline' as const,
    },
    {
      label: 'Remote Stop',
      icon: <StopCircle className="h-4 w-4" />,
      onClick: () => alert('Remote Stop functionality not implemented yet'),
      variant: 'outline' as const,
    },
  ];
  
  // Create Overview section content
  const overviewContent = (
    <div className="space-y-6">
      {/* Overview Section */}
      <DetailSection
        title="Overview"
        description="Basic charger information"
        icon={<Zap className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={connectionStatus} variant={statusVariant} />
              <span className="text-sm text-muted-foreground">
                Last heartbeat: {lastHeartbeat}
              </span>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Charger Type</h3>
            <p className="text-lg">{chargerType}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Price: {chargerPrice}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Hardware</h3>
            <p className="text-lg">{chargerModel}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Vendor: {chargerVendor}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Operational Status</h3>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={enabledStatus} variant={enabledVariant} />
              <StatusBadge status={verifiedStatus} variant={verifiedVariant} />
            </div>
          </div>
        </div>
      </DetailSection>
      
      {/* Location Section */}
      <DetailSection
        title="Location"
        description="Geographic information"
        icon={<MapPin className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <p className="text-lg">{chargerAddress}</p>
          </div>
          
          <Separator />
          
          {charger?.geometry && charger.geometry.coordinates && Array.isArray(charger.geometry.coordinates) && charger.geometry.coordinates.length >= 2 ? (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Coordinates</h3>
              <div className="mt-1">
                <p>Latitude: {charger.geometry.coordinates[1]}</p>
                <p>Longitude: {charger.geometry.coordinates[0]}</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://maps.google.com/?q=${charger.geometry.coordinates[1]},${charger.geometry.coordinates[0]}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
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
      </DetailSection>
      
      {/* Connectors Section */}
      <DetailSection
        title="Connectors"
        description="Charging points information"
        icon={<Plug className="h-5 w-5" />}
      >
        {charger?.connectors && charger.connectors.length > 0 ? (
          <div className="space-y-4">
            {charger.connectors.map((connector: any, index: number) => (
              <Card key={connector.id || index} className={index > 0 ? 'mt-4' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <div 
                      className="h-3 w-3 rounded-full mr-2" 
                      style={{ 
                        backgroundColor: connector.status === 'Available' ? 'green' : 
                          connector.status === 'Charging' ? 'blue' : 'gray'
                      }}
                    />
                    Connector #{connector.connector_id || index + 1}
                  </CardTitle>
                  <CardDescription>
                    Type: {connector.type || 'Standard'} | Status: {connector.status || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Max Power</h4>
                      <p>{connector.max_power ? `${connector.max_power} kW` : 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Format</h4>
                      <p>{connector.format || 'Standard'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground">No connectors configured for this charger.</p>
          </div>
        )}
      </DetailSection>
    </div>
  );

  // Tab definitions for the detail template
  const detailTabs = [
    {
      label: 'Overview',
      value: 'overview',
      icon: <Zap className="h-4 w-4" />,
      content: overviewContent
    },
    {
      label: 'Events',
      value: 'events',
      icon: <Calendar className="h-4 w-4" />,
      content: (
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
      )
    },
    {
      label: 'Transactions',
      value: 'transactions',
      icon: <ArrowUpDown className="h-4 w-4" />,
      content: (
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
      )
    },
    {
      label: 'Logs',
      value: 'logs',
      icon: <Server className="h-4 w-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>Debug information and system messages</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No system logs available.</p>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/chargers">
              <ArrowUpDown className="mr-2 h-4 w-4" /> Back to Chargers
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Loading Charger Details</p>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch the information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container py-8">
        <div className="mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/chargers">
              <ArrowUpDown className="mr-2 h-4 w-4" /> Back to Chargers
            </Link>
          </Button>
        </div>
        
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" /> Error Loading Charger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message || 'Failed to load charger details'}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try refreshing the page or contact support if the problem persists.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // No data state
  if (!charger) {
    return (
      <div className="container py-8">
        <div className="mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/chargers">
              <ArrowUpDown className="mr-2 h-4 w-4" /> Back to Chargers
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-16">
              <Battery className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Charger Not Found</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
                We couldn't find the charger you're looking for. It may have been deleted or the ID is incorrect.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/chargers">View All Chargers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Main detail view
  return (
    <>
      <Helmet>
        <title>{chargerName} | Electric Flow Admin Portal</title>
      </Helmet>
      
      <DetailTemplate
        title={chargerName}
        subtitle={chargerAddress}
        description={`ID: ${charger.charger_id || id}`}
        icon={<Zap className="h-5 w-5" />}
        backPath="/chargers"
        editPath={`/chargers/${id}/edit`}
        onDelete={() => setShowDeleteDialog(true)}
        actions={detailActions}
        tabs={detailTabs}
        defaultTab="overview"
      >
        {/* Overview Section */}
        <DetailSection
          title="Overview"
          description="Basic charger information"
          icon={<Zap className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={connectionStatus} variant={statusVariant} />
                <span className="text-sm text-muted-foreground">
                  Last heartbeat: {lastHeartbeat}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Charger Type</h3>
              <p className="text-lg">{chargerType}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Price: {chargerPrice}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Hardware</h3>
              <p className="text-lg">{chargerModel}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vendor: {chargerVendor}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Operational Status</h3>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={enabledStatus} variant={enabledVariant} />
                <StatusBadge status={verifiedStatus} variant={verifiedVariant} />
              </div>
            </div>
          </div>
        </DetailSection>
        
        {/* Location Section */}
        <DetailSection
          title="Location"
          description="Geographic information"
          icon={<MapPin className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
              <p className="text-lg">{chargerAddress}</p>
            </div>
            
            <Separator />
            
            {charger?.geometry && charger.geometry.coordinates && Array.isArray(charger.geometry.coordinates) && charger.geometry.coordinates.length >= 2 ? (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Coordinates</h3>
                <div className="mt-1">
                  <p>Latitude: {charger.geometry.coordinates[1]}</p>
                  <p>Longitude: {charger.geometry.coordinates[0]}</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`https://maps.google.com/?q=${charger.geometry.coordinates[1]},${charger.geometry.coordinates[0]}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
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
        </DetailSection>
        
        {/* Connectors Section */}
        <DetailSection
          title="Connectors"
          description="Charging points information"
          icon={<Plug className="h-5 w-5" />}
        >
          {charger.connectors && charger.connectors.length > 0 ? (
            <div className="space-y-4">
              {charger.connectors.map((connector: any, index: number) => (
                <Card key={connector.id || index} className={index > 0 ? 'mt-4' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2" 
                        style={{ 
                          backgroundColor: connector.status === 'Available' ? 'green' : 
                            connector.status === 'Charging' ? 'blue' : 'gray'
                        }}
                      />
                      Connector #{connector.connector_id || index + 1}
                    </CardTitle>
                    <CardDescription>
                      Type: {connector.type || 'Standard'} | Status: {connector.status || 'Unknown'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Max Power</h4>
                        <p>{connector.max_power ? `${connector.max_power} kW` : 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Format</h4>
                        <p>{connector.format || 'Standard'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-muted-foreground">No connectors configured for this charger.</p>
            </div>
          )}
        </DetailSection>
      </DetailTemplate>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Charger</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete charger "{chargerName}"? This action cannot be undone.
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
    </>
  );
};

export default ChargerDetailPage;
