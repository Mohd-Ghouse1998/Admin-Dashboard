import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axiosInstance from '@/api/axios';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useOCPIRole } from '../../contexts/OCPIRoleContext';
import { OCPIApiService } from '../../services';
import { Loader2, MapPin, Edit, Trash, AlertCircle, Power, Plug, RefreshCw, Zap, FileText, Calendar, Clock, Info } from "lucide-react";
import { PageLayout } from '@/components/layout/PageLayout';

// Define interfaces based on the API response structure
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

// Define the form schema for location editing
// EVSE form schema
const evseFormSchema = z.object({
  evse_id: z.string().min(1, { message: "EVSE ID is required" }),
  status: z.enum(["AVAILABLE", "CHARGING", "RESERVED", "UNAVAILABLE", "UNKNOWN"]), 
  floor_level: z.string().optional(),
  coordinates: z.string().regex(/^[\d.-]+,[\d.-]+$/, { message: "Coordinates must be in format 'latitude,longitude'" }),
  physical_reference: z.string().optional(),
  ocpp_connector_id: z.number().int().nonnegative().optional(),
});

type EvseFormValues = z.infer<typeof evseFormSchema>;

// Connector form schema
const connectorFormSchema = z.object({
  connector_id: z.string().min(1, { message: "Connector ID is required" }),
  standard: z.string().min(1, { message: "Standard is required" }),
  format: z.string().min(1, { message: "Format is required" }),
  power_type: z.string().min(1, { message: "Power type is required" }),
  max_voltage: z.number().positive({ message: "Voltage must be positive" }),
  max_amperage: z.number().positive({ message: "Amperage must be positive" }),
  max_electric_power: z.number().positive({ message: "Power must be positive" }),
});

type ConnectorFormValues = z.infer<typeof connectorFormSchema>;

// Location form schema
const locationFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  postal_code: z.string().min(1, { message: "Postal code is required" }),
  country: z.string().length(2, { message: "Country code must be 2 characters (ISO 3166-1 alpha-2)" }),
  coordinates: z.string().regex(/^[\d.-]+,[\d.-]+$/, { message: "Coordinates must be in format 'latitude,longitude'" }),
  time_zone: z.string().min(1, { message: "Time zone is required" }),
  charging_when_closed: z.boolean().default(false),
  publish: z.boolean().default(true),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

const LocationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role } = useOCPIRole();
  const navigate = useNavigate();
  const ocpiApiService = OCPIApiService;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteLocationName, setDeleteLocationName] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addEvseDialogOpen, setAddEvseDialogOpen] = useState(false);
  const [activeConnectorIndex, setActiveConnectorIndex] = useState(0);
  const [connectors, setConnectors] = useState<ConnectorFormValues[]>([]);
  
  // Fetch location details
  const { data: location, isLoading, error } = useQuery<OCPILocation>({
    queryKey: ['ocpi', 'locations', id],
    queryFn: async () => {
      const response = await ocpiApiService.common.resources.locations.getById(id as string);
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });

  // Initialize form with react-hook-form
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

  // Update form values when location data is loaded
  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name,
        address: location.address,
        city: location.city,
        postal_code: location.postal_code,
        country: location.country,
        coordinates: location.coordinates,
        time_zone: location.time_zone,
        charging_when_closed: location.charging_when_closed,
        publish: location.publish,
      });
      setDeleteLocationName(location.name);
    }
  }, [location, form]);

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedLocation: LocationFormValues) => {
      return await ocpiApiService.common.resources.locations.update(id as string, updatedLocation);
    },
    onSuccess: () => {
      toast({ 
        title: "Location updated successfully",
        description: "Location information has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'locations', id] });
      setEditDialogOpen(false);
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update location',
        description: err?.response?.data?.detail || err?.message || 'An error occurred',
      });
    }
  });

  // Handle location form submission
  const onSubmit = (values: LocationFormValues) => {
    updateMutation.mutate(values);
  };
  
  // EVSE form initialization
  const evseForm = useForm<EvseFormValues>({
    resolver: zodResolver(evseFormSchema),
    defaultValues: {
      evse_id: "",
      status: "AVAILABLE",
      floor_level: "",
      coordinates: location?.coordinates || "",
      physical_reference: "",
      ocpp_connector_id: undefined,
    },
    mode: "onChange",
  });
  
  // Connector form initialization
  const connectorForm = useForm<ConnectorFormValues>({
    resolver: zodResolver(connectorFormSchema),
    defaultValues: {
      connector_id: "",
      standard: "IEC_62196_T2",
      format: "SOCKET",
      power_type: "AC_3_PHASE",
      max_voltage: 400,
      max_amperage: 32,
      max_electric_power: 22000,
    },
    mode: "onChange",
  });
  
  // Add connector to the list
  const addConnector = (data: ConnectorFormValues) => {
    setConnectors([...connectors, data]);
    connectorForm.reset();
    toast({
      title: "Connector added",
      description: `Connector ${data.connector_id} added to the form`,
    });
  };
  
  // Remove connector from the list
  const removeConnector = (index: number) => {
    setConnectors(connectors.filter((_, i) => i !== index));
  };
  
  // Create EVSE with connectors
  const createEvseMutation = useMutation({
    mutationFn: async (data: { evse: EvseFormValues, connectors: ConnectorFormValues[] }) => {
      // First create the EVSE
      const evseResponse = await ocpiApiService.common.resources.evses.create({
        ...data.evse,
        location: parseInt(id as string)
      });
      // Then create the connectors for the EVSE
      await Promise.all(data.connectors.map(connector => 
        ocpiApiService.common.resources.connectors.create({
          ...connector,
          evse: evseResponse.data.id
        })));
    },
    onSuccess: () => {
      toast({ 
        title: "EVSE added successfully",
        description: "The EVSE has been added to this location.",
      });
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'locations', id] });
      setAddEvseDialogOpen(false);
      setConnectors([]);
      evseForm.reset();
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to add EVSE',
        description: err?.response?.data?.detail || err?.message || 'An error occurred',
      });
    }
  });
  
  // Handle EVSE form submission
  const onSubmitEvseForm = (data: EvseFormValues) => {
    if (connectors.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No connectors added',
        description: 'At least one connector is required for an EVSE',
      });
      return;
    }
    
    createEvseMutation.mutate({ evse: data, connectors });
  };
  
  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await ocpiApiService.common.resources.locations.delete(id as string);
    },
    onSuccess: () => {
      toast({ 
        title: "Location deleted successfully",
        description: `Location ${location?.name} has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'locations'] });
      // Use React Router navigation instead of direct window.location manipulation
      navigate('/ocpi/locations');
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete location',
        description: err?.response?.data?.detail || err?.message || 'An error occurred',
      });
    }
  });

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    if (location) {
      setDeleteLocationName(location.name);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmationInput === deleteLocationName) {
      deleteMutation.mutate();
      setDeleteDialogOpen(false);
      setConfirmationInput('');
      setShowDeleteConfirmation(false);
    }
  };

  // Role check
  if (role !== 'CPO') {
    return (
      <PageLayout 
        title="Location Details"
        description="Role-based access control"
        backButton
        backTo="/ocpi/locations"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Viewing OCPI location details is only available in CPO mode. Please switch to CPO mode to access this feature.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={location ? location.name : 'Location Details'}
      description={location ? `Details for ${location.name}` : 'Loading location details...'}
      backButton
      backTo="/ocpi/locations"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading location details...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load location details. Please try again later.
          </AlertDescription>
        </Alert>
      ) : location ? (
        <>
          <div className="flex justify-between mb-6">
            <Badge 
              variant={location.status === 'ACTIVE' ? 'success' : 'secondary'}
              className="px-3 py-1 text-sm"
            >
              {location.status}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDeleteClick}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{location.name}</CardTitle>
          </CardHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="evses">EVSEs ({location.evses?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {location.name}
                  </CardTitle>
                  <CardDescription>
                    OCPI location details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">General Information</h3>
                        <div className="mt-2 space-y-4">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">OCPI ID:</div>
                            <div className="text-sm">{location.location_id}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Name:</div>
                            <div className="text-sm">{location.name}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Status:</div>
                            <div className="text-sm">
                              <Badge variant={location.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                {location.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Published:</div>
                            <div className="text-sm">
                              <Badge variant={location.publish ? 'success' : 'outline'}>
                                {location.publish ? 'Published' : 'Private'}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Party ID:</div>
                            <div className="text-sm">{location.party}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                        <div className="mt-2 space-y-4">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Address:</div>
                            <div className="text-sm">{location.address}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">City:</div>
                            <div className="text-sm">{location.city}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Postal Code:</div>
                            <div className="text-sm">{location.postal_code}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Country:</div>
                            <div className="text-sm">{location.country}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Time Zone:</div>
                            <div className="text-sm">{location.time_zone}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Coordinates</h3>
                        <div className="mt-2 space-y-4">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Coordinates:</div>
                            <div className="text-sm">{location.coordinates}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Charging</h3>
                        <div className="mt-2 space-y-4">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Charging when closed:</div>
                            <div className="text-sm">{location.charging_when_closed ? 'Yes' : 'No'}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">OCPP Charger:</div>
                            <div className="text-sm">{location.ocpp_charger || 'Not mapped'}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                        <div className="mt-2 space-y-4">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="text-sm font-medium">Date & Time:</div>
                            <div className="text-sm">{new Date(location.last_updated).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Plug className="h-5 w-5 mr-2" />
                      {location.evses?.length || 0} EVSEs at {location.name}
                    </CardTitle>
                    <CardDescription>
                      Electric Vehicle Supply Equipment units associated with this location
                    </CardDescription>
                  </div>
                  <Button onClick={() => {
                    setConnectors([]);
                    evseForm.reset();
                    setAddEvseDialogOpen(true);
                  }}>
                    <Plug className="h-4 w-4 mr-2" />
                    Add EVSE
                  </Button>
                </CardHeader>
                <CardContent>
                  {location.evses && location.evses.length > 0 ? (
                    <div className="space-y-6">
                      {location.evses.map((evse) => (
                        <Card key={evse.id} className="overflow-hidden">
                          <CardHeader className="bg-muted py-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                <Power className="h-4 w-4 mr-2" />
                                EVSE ID: {evse.evse_id}
                              </CardTitle>
                              <Badge variant={evse.status === 'AVAILABLE' ? 'success' : evse.status === 'CHARGING' ? 'default' : 'secondary'}>
                                {evse.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">OCPP Connector ID:</span>
                                  <span className="text-sm">{evse.ocpp_connector_id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Physical Ref:</span>
                                  <span className="text-sm">{evse.physical_reference || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Floor Level:</span>
                                  <span className="text-sm">{evse.floor_level || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Last Updated:</span>
                                  <span className="text-sm">{new Date(evse.last_updated).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Capabilities:</span>
                                  <span className="text-sm">
                                    {evse.capabilities && evse.capabilities.length > 0 
                                      ? evse.capabilities.join(', ')
                                      : 'None'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Connectors ({evse.connectors.length})</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Standard</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Power Type</TableHead>
                                    <TableHead>Max Power</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {evse.connectors.map((connector) => (
                                    <TableRow key={connector.id}>
                                      <TableCell className="font-medium">{connector.connector_id}</TableCell>
                                      <TableCell>{connector.standard}</TableCell>
                                      <TableCell>{connector.format}</TableCell>
                                      <TableCell>{connector.power_type}</TableCell>
                                      <TableCell>{connector.max_electric_power} W</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No EVSEs associated with this location</p>
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={() => {
                          setConnectors([]);
                          evseForm.reset();
                          setAddEvseDialogOpen(true);
                        }}
                      >
                        <Plug className="h-4 w-4 mr-2" />
                        Add EVSE
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Delete confirmation dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Location</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the location <strong>{deleteLocationName}</strong>? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              {showDeleteConfirmation ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="confirm-delete">Type the location name to confirm</Label>
                    <Input 
                      id="confirm-delete"
                      value={confirmationInput}
                      onChange={(e) => setConfirmationInput(e.target.value)}
                      placeholder={deleteLocationName}
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleConfirmDelete}
                      disabled={confirmationInput !== deleteLocationName}
                    >
                      I understand, delete this location
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit location dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Location</DialogTitle>
                <DialogDescription>
                  Update location details. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Coordinates</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="latitude,longitude" />
                            </FormControl>
                            <FormDescription>Format: latitude,longitude</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country Code</FormLabel>
                            <FormControl>
                              <Input {...field} maxLength={2} />
                            </FormControl>
                            <FormDescription>ISO 3166-1 alpha-2</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="time_zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Zone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Europe/Berlin" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="charging_when_closed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Charging When Closed</FormLabel>
                              <FormDescription>
                                Allow charging when the location is officially closed
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
                              <FormLabel>Publish</FormLabel>
                              <FormDescription>
                                Make this location visible to eMSPs
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
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Add EVSE dialog */}
          <Dialog open={addEvseDialogOpen} onOpenChange={setAddEvseDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New EVSE</DialogTitle>
                <DialogDescription>
                  Add a new EVSE unit to this location along with at least one connector.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="evse_details" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="evse_details">EVSE Details</TabsTrigger>
                  <TabsTrigger value="connectors">
                    Connectors ({connectors.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="evse_details">
                  <Form {...evseForm}>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={evseForm.control}
                          name="evse_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>EVSE ID *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>Unique identifier within CPO systems</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={evseForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                                  <SelectItem value="CHARGING">CHARGING</SelectItem>
                                  <SelectItem value="RESERVED">RESERVED</SelectItem>
                                  <SelectItem value="UNAVAILABLE">UNAVAILABLE</SelectItem>
                                  <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={evseForm.control}
                          name="floor_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Floor Level</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>E.g. -1, 0, 1, 2, P1, P2</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={evseForm.control}
                          name="physical_reference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Physical Reference</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>E.g. A4, Pillar 3</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={evseForm.control}
                          name="coordinates"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coordinates *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="latitude,longitude" />
                              </FormControl>
                              <FormDescription>Format: latitude,longitude</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={evseForm.control}
                          name="ocpp_connector_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>OCPP Connector ID</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>Optional: ID from OCPP system</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="connectors">
                  <div className="space-y-6">
                    {/* Connector list */}
                    {connectors.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Added Connectors:</h4>
                        {connectors.map((connector, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                            <div>
                              <p className="font-medium">ID: {connector.connector_id}</p>
                              <p className="text-sm text-muted-foreground">
                                {connector.standard}, {connector.format}, {connector.power_type}, 
                                {connector.max_electric_power}W
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeConnector(index)}
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add connector form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Add Connector</CardTitle>
                        <CardDescription>
                          Each EVSE must have at least one connector
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...connectorForm}>
                          <form onSubmit={connectorForm.handleSubmit(addConnector)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={connectorForm.control}
                                name="connector_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Connector ID *</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={connectorForm.control}
                                name="standard"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Standard *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select standard" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="IEC_62196_T1">IEC 62196 Type 1</SelectItem>
                                        <SelectItem value="IEC_62196_T2">IEC 62196 Type 2</SelectItem>
                                        <SelectItem value="IEC_62196_T3">IEC 62196 Type 3</SelectItem>
                                        <SelectItem value="IEC_62196_T2_COMBO">CCS Combo 2</SelectItem>
                                        <SelectItem value="CHADEMO">CHAdeMO</SelectItem>
                                        <SelectItem value="TESLA">Tesla</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={connectorForm.control}
                                name="format"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Format *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="SOCKET">Socket</SelectItem>
                                        <SelectItem value="CABLE">Cable</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={connectorForm.control}
                                name="power_type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Power Type *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select power type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="AC_1_PHASE">AC 1 Phase</SelectItem>
                                        <SelectItem value="AC_3_PHASE">AC 3 Phase</SelectItem>
                                        <SelectItem value="DC">DC</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={connectorForm.control}
                                name="max_voltage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Voltage (V) *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={connectorForm.control}
                                name="max_amperage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Amperage (A) *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={connectorForm.control}
                                name="max_electric_power"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Power (W) *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Button type="submit" className="w-full">
                              Add Connector to EVSE
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => setAddEvseDialogOpen(false)}>Cancel</Button>
                <Button 
                  type="button" 
                  disabled={connectors.length === 0 || !evseForm.formState.isValid || createEvseMutation.isPending}
                  onClick={() => evseForm.handleSubmit(onSubmitEvseForm)()}
                >
                  {createEvseMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add EVSE
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Alert variant="default" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The location you're looking for could not be found.
          </AlertDescription>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/ocpi/locations">Back to Locations</Link>
          </Button>
        </Alert>
      )}
    </PageLayout>
  );
};

export default LocationDetailPage;
