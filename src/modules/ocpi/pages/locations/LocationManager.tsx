import React, { useState, useEffect } from 'react';
import { OCPIApiService } from '../../services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Edit, Trash, Eye, MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define the types based on the API response structure
interface Connector {
  id: number;
  evse: number;
  connector_id: string;
  standard: string;
  format: string;
  power_type: string;
  max_voltage: number;
  max_amperage: number;
  max_electric_power: number;
  tariff_ids?: string[];
  terms_and_conditions?: string;
  last_updated: string;
}

interface Direction {
  text: string;
  language: string;
}

interface Evse {
  id: number;
  location: number;
  evse_id: string;
  ocpp_connector_id: number;
  status: string;
  capabilities?: string[];
  floor_level?: string;
  coordinates: string;
  physical_reference?: string;
  directions?: Direction[];
  parking_restrictions?: string[];
  images?: any;
  last_updated: string;
  status_schedule?: any;
  connectors: Connector[];
}

interface OCPILocation {
  id: number;
  party: number;
  location_id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  coordinates: string;
  time_zone: string;
  opening_times: any;
  charging_when_closed: boolean;
  images: any;
  operator: any;
  suboperator: any;
  owner: any;
  facilities: any;
  energy_mix: any;
  last_updated: string;
  publish: boolean;
  status: string;
  evses: Evse[];
  ocpp_charger: number | null;
}

interface LocationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OCPILocation[];
}

// Location form schema
const locationFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  postal_code: z.string().min(2, { message: "Postal code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  coordinates: z.string().regex(/^[\d.-]+,[\d.-]+$/, { message: "Coordinates must be in format 'latitude,longitude'" }),
  time_zone: z.string().min(1, { message: "Time zone is required" }),
  charging_when_closed: z.boolean().default(false),
  publish: z.boolean().default(true),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export const LocationManager: React.FC = () => {
  const { toast } = useToast();
  const { role } = useOCPIRole();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OCPILocation | null>(null);
  
  // Check if we're in CPO mode
  if (role !== 'CPO') {
    return (
      <PageLayout 
        title="Location Management"
        description="Role-based access control"
      >
        <Alert variant="destructive">
          <AlertDescription>
            Location management is only available in CPO mode. Please switch to CPO mode to access this feature.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  // Fetch locations from the API
  const { data, isLoading, error } = useQuery<LocationsResponse>({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await OCPIApiService.common.resources.locations.getAll();
      return response.data;
    }
  });

  // Create new location
  const createMutation = useMutation({
    mutationFn: async (newLocation: LocationFormValues) => {
      return await OCPIApiService.common.resources.locations.create(newLocation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({ title: "Success", description: "Location created successfully" });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      console.error('Error creating location:', error);
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to create location", variant: "destructive" });
    }
  });

  // Update location
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number, location: LocationFormValues }) => {
      return await OCPIApiService.common.resources.locations.update(data.id.toString(), data.location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({ title: "Success", description: "Location updated successfully" });
      setIsFormOpen(false);
      setEditingLocation(null);
    },
    onError: (error: any) => {
      console.error('Error updating location:', error);
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to update location", variant: "destructive" });
    }
  });

  // Delete location
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await OCPIApiService.common.resources.locations.delete(id.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({ title: "Success", description: "Location deleted successfully" });
    }
  });

  // Table columns definition
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row: OCPILocation) => <div className="font-medium">{row.name}</div>
    },
    {
      header: 'Location ID',
      accessorKey: 'location_id',
      cell: (row: OCPILocation) => <div>{row.location_id}</div>
    },
    {
      header: 'Address',
      accessorKey: 'address',
      cell: (row: OCPILocation) => (
        <div className="max-w-[200px] truncate" title={row.address}>
          {row.address}
        </div>
      )
    },
    {
      header: 'City',
      accessorKey: 'city',
      cell: (row: OCPILocation) => <div>{row.city}</div>
    },
    {
      header: 'Country',
      accessorKey: 'country',
      cell: (row: OCPILocation) => <div>{row.country}</div>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: OCPILocation) => {
        return (
          <Badge variant={row.status === 'ACTIVE' ? 'success' : 'secondary'}>
            {row.status || 'INACTIVE'}
          </Badge>
        );
      }
    },
    {
      header: 'EVSEs',
      accessorKey: 'evses',
      cell: (row: OCPILocation) => {
        return <div className="text-center">{row.evses?.length || 0}</div>;
      }
    },
    {
      header: 'Published',
      accessorKey: 'publish',
      cell: (row: OCPILocation) => {
        return (
          <Badge variant={row.publish ? 'success' : 'outline'}>
            {row.publish ? 'Published' : 'Private'}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: OCPILocation) => {
        return (
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => navigate(`/ocpi/cpo/locations/${row.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => {
                setEditingLocation(row);
                setIsFormOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
                  deleteMutation.mutate(row.id);
                }
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    },
  ];
  
  // Form setup
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      postal_code: "",
      country: "",
      coordinates: "",
      time_zone: "",
      charging_when_closed: false,
      publish: true,
    },
    mode: "onChange",
  });

  // Reset form when editing location changes
  useEffect(() => {
    if (editingLocation) {
      form.reset({
        name: editingLocation.name,
        address: editingLocation.address,
        city: editingLocation.city,
        postal_code: editingLocation.postal_code,
        country: editingLocation.country,
        coordinates: editingLocation.coordinates,
        time_zone: editingLocation.time_zone,
        charging_when_closed: editingLocation.charging_when_closed,
        publish: editingLocation.publish,
      });
    }
  }, [editingLocation, form]);

  // Handle form submission
  const handleSubmit = (values: LocationFormValues) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, location: values });
    } else {
      createMutation.mutate(values);
    }
  };
  
  return (
    <PageLayout 
      title="Location Management"
      description="Manage CPO-side locations"
    >
      <div className="container mx-auto py-4">
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>
              Create and manage charging locations that can be published to the OCPI network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/ocpi/cpo/locations/map-chargers')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Map Chargers to Locations
              </Button>
              
              <Button onClick={() => {
                setEditingLocation(null);
                setIsFormOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8 space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading locations...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load locations. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <DataTable 
                columns={columns} 
                data={data?.results || []} 
                keyField="id"
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Location form modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) {
          setIsFormOpen(false);
          setEditingLocation(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Update location details' : 'Create a new charging location'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country*</FormLabel>
                    <FormControl>
                      <Input placeholder="Country code (e.g. US, NL)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coordinates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coordinates*</FormLabel>
                    <FormControl>
                      <Input placeholder="Latitude,Longitude (e.g. 52.3749,4.9085)" {...field} />
                    </FormControl>
                    <FormDescription>Enter as latitude,longitude</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time_zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Zone*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Europe/Amsterdam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="charging_when_closed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Charging When Closed</FormLabel>
                        <FormDescription>
                          Allow charging when the location is closed
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publish"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Publish Location</FormLabel>
                        <FormDescription>
                          Make this location visible in the network
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingLocation(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!form.formState.isValid || form.formState.isSubmitting}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingLocation ? 'Update Location' : 'Create Location'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};
