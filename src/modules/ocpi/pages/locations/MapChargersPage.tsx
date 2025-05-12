import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { OCPIApiService } from '../../services';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';
import axiosInstance from '@/api/axios';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Define interfaces for the data structures
interface Connector {
  id: number;
  connector_id: number;
  status: string;
  type: string;
}

interface ChargerProperties {
  id: number;
  charger_id: string;
  name: string;
  vendor: string;
  model: string;
  address: string;
  enabled: boolean;
  type: string;
  online: boolean;
  connectors: Connector[];
  ocpi_id: string | null;
  publish_to_ocpi: boolean;
}

interface Charger {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: ChargerProperties;
}

interface ChargersResponse {
  type: string;
  features: Charger[];
}

function MapChargersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useOCPIRole();
  
  // States
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [selectedChargers, setSelectedChargers] = useState<number[]>([]);
  const [locationStrategy, setLocationStrategy] = useState<string>('group_by_site');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Check if we're in CPO mode
  if (role !== 'CPO') {
    return (
      <PageLayout 
        title="Map Chargers to Locations"
        description="Role-based access control"
        backButton
        backTo="/ocpi/cpo/locations"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Charger mapping is only available in CPO mode. Please switch to CPO mode to access this feature.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }
  
  // Fetch chargers on component mount
  useEffect(() => {
    const fetchChargers = async () => {
      try {
        // Get chargers from the OCPP API endpoint
        const response = await axiosInstance.get('/api/ocpp/chargers/');
        if (!response.data) {
          throw new Error(`Failed to fetch chargers: ${response.status}`);
        }
        
        const data: ChargersResponse = response.data;
        setChargers(data.features || []);
        
        // Pre-select chargers that are not test chargers and not already published
        const nonTestChargers = data.features
          .filter(charger => 
            !charger.properties.name.toLowerCase().includes('test') && 
            !charger.properties.publish_to_ocpi
          )
          .map(charger => charger.properties.id);
        
        setSelectedChargers(nonTestChargers);
      } catch (err: any) {
        console.error('Error fetching chargers:', err);
        setError(err.message || 'Failed to fetch chargers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChargers();
  }, []);

  // Handle charger selection
  const handleChargerSelection = (chargerId: number, checked: boolean) => {
    setSelectedChargers(prev => {
      if (checked) {
        return [...prev, chargerId];
      } else {
        return prev.filter(id => id !== chargerId);
      }
    });
  };

  // Handle select all chargers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = chargers.map(charger => charger.properties.id);
      setSelectedChargers(allIds);
    } else {
      setSelectedChargers([]);
    }
  };
  
  // Submit charger mapping
  const handleSubmit = async () => {
    if (selectedChargers.length === 0) {
      toast({
        variant: "destructive",
        title: "No chargers selected",
        description: "Please select at least one charger to map to OCPI.",
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setProgress(10);

    try {
      // Call the API to map chargers using the unified OCPIApiService
      const payload = {
        charger_ids: selectedChargers,
        location_strategy: locationStrategy
      };
      const response = await OCPIApiService.common.resources.locations.mapChargers(payload);
      
      setProgress(100);
      
      toast({
        title: "Chargers mapped successfully",
        description: `${response.data.locations_created} locations and ${response.data.evses_created} EVSEs created.`,
      });
      
      // Navigate to the locations list to see the results
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/ocpi/cpo/locations');
      }, 500);
    } catch (err: any) {
      console.error('Error mapping chargers:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to map chargers');
      setProgress(0);
      
      toast({
        variant: "destructive",
        title: "Failed to map chargers",
        description: err?.response?.data?.detail || err?.message || 'An error occurred while mapping chargers',
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageLayout
      title="Map Chargers to OCPI"
      description="Convert existing OCPP chargers to OCPI locations"
      backButton
      backTo="/ocpi/cpo/locations/setup"
    >
      <div className="max-w-4xl mx-auto">
        <Card className="border p-6">
          <div className="text-center mb-6 border-b pb-4">
            <h1 className="text-xl font-bold">MAP CHARGERS TO OCPI</h1>
          </div>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading chargers...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Select chargers to publish to OCPI:</h3>
                    <div className="flex items-center">
                      <Checkbox 
                        id="select-all"
                        checked={selectedChargers.length === chargers.length}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="select-all" className="ml-2">Select All</Label>
                    </div>
                  </div>
                  <ScrollArea className="h-[400px] border rounded-md p-4">
                    <div className="space-y-2">
                      {chargers.map(charger => (
                        <div 
                          key={charger.properties.id}
                          className="flex items-start space-x-3 p-3 border-b last:border-b-0"
                        >
                          <Checkbox 
                            id={`charger-${charger.properties.id}`}
                            checked={selectedChargers.includes(charger.properties.id)}
                            onCheckedChange={(checked) => 
                              handleChargerSelection(charger.properties.id, checked === true)
                            }
                            disabled={charger.properties.publish_to_ocpi}
                          />
                          <div className="w-full">
                            <div className="flex justify-between items-start">
                              <label
                                htmlFor={`charger-${charger.properties.id}`}
                                className="text-base font-medium cursor-pointer"
                              >
                                {charger.properties.name || `Charger #${charger.properties.charger_id}`}
                                {charger.properties.connectors && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({charger.properties.connectors.length} connectors)
                                  </span>
                                )}
                              </label>
                              {charger.properties.publish_to_ocpi && (
                                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                  Already Published
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {charger.properties.address || "No address provided"}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{charger.properties.model}</Badge>
                              <Badge variant={charger.properties.online ? "success" : "destructive"}>
                                {charger.properties.online ? "Online" : "Offline"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="pt-2 mt-2">
                    <p className="text-sm">
                      Selected: <strong>{selectedChargers.length}</strong> of {chargers.length} chargers
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 border p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-4">Location Naming Strategy:</h3>
                  <RadioGroup
                    value={locationStrategy}
                    onValueChange={setLocationStrategy}
                    className="space-y-4"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem id="per-charger" value="per_charger" className="mt-1" />
                      <div>
                        <Label htmlFor="per-charger" className="font-medium">Create one location per charger</Label>
                        <p className="text-sm text-gray-500">Each charger will become a separate OCPI location with a single EVSE</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem id="group-site" value="group_by_site" className="mt-1" />
                      <div>
                        <Label htmlFor="group-site" className="font-medium">Group by site</Label>
                        <p className="text-sm text-gray-500">Chargers at the same address will be grouped into a single OCPI location with multiple EVSEs</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              
                {isSubmitting && (
                  <div className="mt-6 mb-4">
                    <p className="text-sm mb-2">Mapping in progress...</p>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/ocpi/cpo/locations/setup')}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedChargers.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mapping...
                      </>
                    ) : (
                      'Map Selected Chargers'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export { MapChargersPage };
