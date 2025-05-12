import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { OCPIApiService } from '../../services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, AlertCircle, MapPin, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OCPITariff {
  id: string;
  name: string;
  currency: string;
  type: string;
  status?: string;
  locations?: string[];
  price_components: {
    type: string;
    price: number;
    step_size?: number;
    unit?: string;
  }[];
}

interface OCPILocation {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: string;
  tariffs?: string[];
  evses?: {
    id: string;
    evse_id: string;
    status: string;
  }[];
}

const TariffAssignmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch tariff details
  const {
    data: tariff,
    isLoading: isLoadingTariff,
    error: tariffError
  } = useQuery({
    queryKey: ['ocpi', 'tariffs', id],
    queryFn: async () => {
      const response = await OCPIApiService.common.resources.tariffs.getById(id as string);
      // Initialize selected locations based on tariff data
      if (response.data.locations) {
        setSelectedLocations(response.data.locations);
      }
      return response.data;
    }
  });
  
  // Fetch locations
  const {
    data: locations = [],
    isLoading: isLoadingLocations,
    error: locationsError
  } = useQuery({
    queryKey: ['ocpi', 'locations'],
    queryFn: async () => {
      const response = await OCPIApiService.common.resources.locations.getAll();
      return response.data.results || [];
    }
  });
  
  // Update tariff mutation
  const updateTariffMutation = useMutation({
    mutationFn: async () => {
      const updatedTariff = {
        ...tariff,
        locations: selectedLocations
      };
      return await OCPIApiService.common.resources.tariffs.update(id as string, updatedTariff);
    },
    onSuccess: () => {
      toast({
        title: "Assignments updated",
        description: "Tariff has been successfully assigned to the selected locations.",
      });
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'tariffs', id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.response?.data?.message || error?.message || "An error occurred while updating assignments.",
      });
    }
  });
  
  // Handle location selection
  const toggleLocationSelection = (locationId: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(locationId)) {
        return prev.filter(id => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };
  
  // Select/deselect all locations
  const toggleAllLocations = () => {
    if (selectedLocations.length === filteredLocations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(filteredLocations.map(loc => loc.id));
    }
  };
  
  // Filter locations based on search term and tab
  const filteredLocations = React.useMemo(() => {
    if (!locations) return [];
    
    let filtered = [...locations];
    
    // Filter by tab
    if (activeTab === 'assigned') {
      filtered = filtered.filter(loc => selectedLocations.includes(loc.id));
    } else if (activeTab === 'unassigned') {
      filtered = filtered.filter(loc => !selectedLocations.includes(loc.id));
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(term) ||
        loc.address.toLowerCase().includes(term) ||
        loc.city?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [locations, searchTerm, selectedLocations, activeTab]);
  
  // Handle save assignments
  const handleSaveAssignments = () => {
    updateTariffMutation.mutate();
  };
  
  // Show loading state
  if (isLoadingTariff) {
    return (
      <PageLayout
        title="Tariff Assignments"
        description="Loading tariff details..."
        backButton
        backTo="/ocpi/tariffs"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }
  
  // Show error state
  if (tariffError) {
    return (
      <PageLayout
        title="Tariff Assignments"
        description="Error loading tariff"
        backButton
        backTo="/ocpi/tariffs"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load tariff details. Please try again.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title={`Assign Tariff: ${tariff?.name}`}
      description="Manage which locations use this tariff"
      backButton
      backTo="/ocpi/tariffs"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tariff Details Column */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Tariff Details</CardTitle>
            <CardDescription>Review tariff information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="font-medium">{tariff?.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge variant={tariff?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {tariff?.status || 'INACTIVE'}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Price Components</h3>
              <div className="space-y-2 mt-1">
                {(tariff?.price_components || []).map((comp, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-2">
                    <span>{comp.type}</span>
                    <Badge variant="outline">
                      {comp.price} {tariff?.currency}/{comp.unit || 'unit'}
                    </Badge>
                  </div>
                ))}
                {(tariff?.price_components || []).length === 0 && (
                  <p className="text-muted-foreground text-sm">No price components defined</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Assignments</h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={() => navigate(`/ocpi/tariffs/${id}`)}
            >
              Edit Tariff Details
            </Button>
          </CardFooter>
        </Card>
        
        {/* Locations Assignment Column */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Location Assignments</CardTitle>
            <CardDescription>Select locations to apply this tariff</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Locations</TabsTrigger>
                  <TabsTrigger value="assigned">Assigned</TabsTrigger>
                  <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                </TabsList>
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search locations..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <TabsContent value={activeTab} className="mt-0">
                {isLoadingLocations ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                    <p>Loading locations...</p>
                  </div>
                ) : locationsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load locations. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : filteredLocations.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No locations found.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                filteredLocations.length > 0 &&
                                filteredLocations.every(loc => selectedLocations.includes(loc.id))
                              }
                              onCheckedChange={toggleAllLocations}
                              aria-label="Select all"
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLocations.map(location => (
                          <TableRow key={location.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedLocations.includes(location.id)}
                                onCheckedChange={() => toggleLocationSelection(location.id)}
                                aria-label={`Select ${location.name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{location.name}</TableCell>
                            <TableCell>
                              {location.address}
                              {location.city && `, ${location.city}`}
                            </TableCell>
                            <TableCell>
                              {selectedLocations.includes(location.id) ? (
                                <Badge variant="default" className="flex items-center w-fit">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Assigned
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="w-fit">
                                  Unassigned
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate('/ocpi/tariffs')}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSaveAssignments}
              disabled={updateTariffMutation.isPending}
            >
              {updateTariffMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Assignments
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Assignment Information */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
          <div>
            <CardTitle>About Tariff Assignments</CardTitle>
            <CardDescription>
              How tariff assignments work in the OCPI protocol
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            When a tariff is assigned to a location, it will be included in the tariff data sent to EMSPs through the OCPI protocol.
            This allows EMSPs to display pricing information to their end users.
          </p>
          <p>
            Multiple tariffs can be assigned to the same location, which allows for time-based or user-based pricing differentiation.
            The exact tariff selected for a charging session will depend on the charging session parameters.
          </p>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default TariffAssignmentPage;
