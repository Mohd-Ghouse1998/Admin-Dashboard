import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, MapPin, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { OCPIApiService } from '../../services';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().length(2, 'Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  coordinates: z.object({
    latitude: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90, {
      message: 'Latitude must be a number between -90 and 90',
    }),
    longitude: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180, {
      message: 'Longitude must be a number between -180 and 180',
    }),
  }),
  publish: z.boolean().default(true),
  parking_type: z.enum(['ON_STREET', 'PARKING_GARAGE', 'UNDERGROUND_GARAGE', 'PARKING_LOT', 'OTHER']).default('ON_STREET'),
  time_zone: z.string().default('UTC'),
  facility_type: z.enum(['HOTEL', 'RESTAURANT', 'CAFE', 'MALL', 'SUPERMARKET', 'SPORT', 'RECREATION_AREA', 'TRANSPORT_HUB', 'WORKPLACE', 'EDUCATION', 'FUEL_STATION', 'PARKING_LOT', 'OTHER', 'UNKNOWN']).default('UNKNOWN'),
  opening_times: z.object({
    twentyfourseven: z.boolean().default(true),
    regular_hours: z.string().optional(),
    exceptional_openings: z.string().optional(),
    exceptional_closings: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const LocationsManualCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useOCPIRole();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'US',
      coordinates: {
        latitude: '',
        longitude: '',
      },
      publish: true,
      parking_type: 'ON_STREET',
      time_zone: 'UTC',
      facility_type: 'UNKNOWN',
      opening_times: {
        twentyfourseven: true,
        regular_hours: '',
        exceptional_openings: '',
        exceptional_closings: '',
      },
    },
  });

  // Check if we're in CPO mode
  if (role !== 'CPO') {
    return (
      <PageLayout 
        title="Create OCPI Location"
        description="Role-based access control"
        backButton
        backTo="/ocpi/cpo/locations"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Creating OCPI locations is only available in CPO mode. Please switch to CPO mode to access this feature.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform the form data to match the API's expected structure
      const locationData = {
        name: values.name,
        address: values.address,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country.toUpperCase(),
        coordinates: {
          latitude: parseFloat(values.coordinates.latitude),
          longitude: parseFloat(values.coordinates.longitude),
        },
      };

      // Send the data to the API using the unified OCPIApiService
      const response = await OCPIApiService.common.resources.locations.create(locationData);
      
      // Handle successful response
      toast({
        title: 'Location created',
        description: `Location "${values.name}" has been created successfully`,
      });
      
      // Redirect to location detail page or list
      navigate(`/ocpi/cpo/locations/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating location:', error);
      
      // Handle error response
      toast({
        variant: 'destructive',
        title: 'Failed to create location',
        description: error.response?.data?.detail || 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Create OCPI Location"
      description="Manually create a new OCPI location"
      backButton
      backTo="/ocpi/cpo/locations/setup"
    >
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Create New Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Main Street Charging Station" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this location
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., 123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., San Francisco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., 94105" {...field} />
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
                          <FormLabel>Country Code*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., US" maxLength={2} {...field} />
                          </FormControl>
                          <FormDescription>
                            2-letter ISO country code (ISO 3166-1 alpha-2)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="coordinates.latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., 37.7749" type="number" step="0.000001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="coordinates.longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., -122.4194" type="number" step="0.000001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parking_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parking Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select parking type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ON_STREET">On Street</SelectItem>
                              <SelectItem value="PARKING_GARAGE">Parking Garage</SelectItem>
                              <SelectItem value="UNDERGROUND_GARAGE">Underground Garage</SelectItem>
                              <SelectItem value="PARKING_LOT">Parking Lot</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of parking at this location
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="facility_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select facility type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HOTEL">Hotel</SelectItem>
                              <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                              <SelectItem value="CAFE">Cafe</SelectItem>
                              <SelectItem value="MALL">Mall</SelectItem>
                              <SelectItem value="SUPERMARKET">Supermarket</SelectItem>
                              <SelectItem value="SPORT">Sport</SelectItem>
                              <SelectItem value="RECREATION_AREA">Recreation Area</SelectItem>
                              <SelectItem value="TRANSPORT_HUB">Transport Hub</SelectItem>
                              <SelectItem value="WORKPLACE">Workplace</SelectItem>
                              <SelectItem value="EDUCATION">Education</SelectItem>
                              <SelectItem value="FUEL_STATION">Fuel Station</SelectItem>
                              <SelectItem value="PARKING_LOT">Parking Lot</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                              <SelectItem value="UNKNOWN">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of facility at this location
                          </FormDescription>
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
                          <Input placeholder="E.g., America/Los_Angeles" {...field} />
                        </FormControl>
                        <FormDescription>
                          Time zone of the location, in IANA time zone format
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Opening Hours</h3>
                  
                  <FormField
                    control={form.control}
                    name="opening_times.twentyfourseven"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Open 24/7
                          </FormLabel>
                          <FormDescription>
                            This location is open 24 hours a day, 7 days a week
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
                  
                  {!form.watch('opening_times.twentyfourseven') && (
                    <FormField
                      control={form.control}
                      name="opening_times.regular_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regular Hours</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Format: weekday from-until, e.g.: MONDAY 09:00-18:00; TUESDAY 09:00-18:00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter regular opening hours. One entry per line, format: WEEKDAY HH:MM-HH:MM
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="publish"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publish to OCPI
                          </FormLabel>
                          <FormDescription>
                            Make this location visible to OCPI partners
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
                
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/ocpi/cpo/locations/setup')}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Location
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default LocationsManualCreatePage;
