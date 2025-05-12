import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, Zap, Thermometer, Battery, Plug } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { meterValueApi } from '@/modules/chargers/services/meterValueService';
import { useAuth } from '@/hooks/useAuth';

const MeterValueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
  // Fetch meter value data
  const { 
    data: meterValue, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['meterValue', id],
    queryFn: () => meterValueApi.getMeterValue(accessToken, id || ''),
    enabled: !!id && !!accessToken,
  });
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'PPpp');
    } catch (error) {
      return timestamp;
    }
  };
  
  // Get icon based on measurand
  const getMeasurandIcon = (measurand: string) => {
    if (!measurand) return null;
    
    if (measurand.includes('Energy')) return <Zap className="h-5 w-5 text-blue-500" />;
    if (measurand.includes('Temperature')) return <Thermometer className="h-5 w-5 text-red-500" />;
    if (measurand.includes('SoC')) return <Battery className="h-5 w-5 text-green-500" />;
    if (measurand.includes('Current') || measurand.includes('Voltage')) return <Plug className="h-5 w-5 text-yellow-500" />;
    
    return <Clock className="h-5 w-5 text-gray-500" />;
  };
  
  return (
    <PageLayout
      title="Meter Value Details"
      description={`Details for meter value ID: ${id}`}
    >
      <Helmet>
        <title>Meter Value Details | Electric Flow Admin</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load meter value details'}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading meter value data...</p>
          </div>
        </div>
      ) : meterValue ? (
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link to="/chargers/meter-values">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Meter Values
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                {getMeasurandIcon(meterValue.measurand)}
                <div className="ml-2">
                  <CardTitle>{meterValue.measurand || 'Meter Value'}</CardTitle>
                  <CardDescription>
                    Value recorded at {formatTimestamp(meterValue.timestamp)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Value Information</h3>
                    <Separator className="mb-3" />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Value:</div>
                      <div className="text-sm">{meterValue.value}</div>
                      
                      <div className="text-sm font-medium">Unit:</div>
                      <div className="text-sm">{meterValue.unit || 'N/A'}</div>
                      
                      <div className="text-sm font-medium">Measurand:</div>
                      <div className="text-sm">
                        <Badge variant="outline">{meterValue.measurand || 'N/A'}</Badge>
                      </div>
                      
                      <div className="text-sm font-medium">Format:</div>
                      <div className="text-sm">{meterValue.format || 'N/A'}</div>
                      
                      <div className="text-sm font-medium">Context:</div>
                      <div className="text-sm">{meterValue.context || 'N/A'}</div>
                      
                      <div className="text-sm font-medium">Location:</div>
                      <div className="text-sm">{meterValue.location || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Related Information</h3>
                    <Separator className="mb-3" />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Meter ID:</div>
                      <div className="text-sm">{meterValue.id}</div>
                      
                      <div className="text-sm font-medium">Timestamp:</div>
                      <div className="text-sm">{formatTimestamp(meterValue.timestamp)}</div>
                      
                      <div className="text-sm font-medium">Charging Session:</div>
                      <div className="text-sm">
                        {meterValue.charging_session ? (
                          <Link 
                            to={`/chargers/charging-sessions/${meterValue.charging_session}`}
                            className="text-primary hover:underline"
                          >
                            Session #{meterValue.charging_session}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </div>
                      
                      <div className="text-sm font-medium">Connector:</div>
                      <div className="text-sm">
                        {meterValue.connector ? (
                          <Link 
                            to={`/chargers/connectors/${meterValue.connector}`}
                            className="text-primary hover:underline"
                          >
                            Connector #{meterValue.connector}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </div>
                      
                      <div className="text-sm font-medium">Charger:</div>
                      <div className="text-sm">
                        {meterValue.charger ? (
                          <Link 
                            to={`/chargers/chargers/${meterValue.charger}`}
                            className="text-primary hover:underline"
                          >
                            Charger #{meterValue.charger}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            Meter value with ID {id} could not be found.
          </AlertDescription>
        </Alert>
      )}
    </PageLayout>
  );
};

export default MeterValueDetailPage;
