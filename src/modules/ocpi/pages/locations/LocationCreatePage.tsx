
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { OCPIApiService } from '../../services';
import { Loader2 } from 'lucide-react';

const locationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country code must be 2 characters").max(2),
  coordinates: z.object({
    latitude: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Latitude must be a valid number",
    }),
    longitude: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Longitude must be a valid number",
    }),
  }),
  description: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

const LocationCreatePage = () => {
  const navigate = useNavigate();

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      postal_code: '',
      country: '',
      coordinates: {
        latitude: '',
        longitude: '',
      },
      description: '',
    },
  });

    const { toast } = useToast();

  // Create mutation for creating a new location
  const createLocationMutation = useMutation({
    mutationFn: async (locationData: LocationFormValues) => {
      // Format coordinates string from latitude and longitude
      const formattedData = {
        ...locationData,
        coordinates: `${locationData.coordinates.latitude},${locationData.coordinates.longitude}`,
        // Add other required fields
        time_zone: 'UTC', // Default timezone
        publish: true, // Default publish state
      };
      return await OCPIApiService.common.resources.locations.create(formattedData);
    },
    onSuccess: () => {
      toast({
        title: 'Location created successfully',
        description: 'The new location has been created',
      });
      navigate('/ocpi/locations');
    },
    onError: (error: any) => {
      console.error('Error creating location:', error);
      toast({
        title: 'Failed to create location',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: LocationFormValues) => {
    createLocationMutation.mutate(data);
  };

  return (
    <PageLayout
      title="Create OCPI Location"
      description="Register a new OCPI location"
      backButton
      backTo="/ocpi/locations"
    >
      <Card>
        <CardHeader>
          <CardTitle>New OCPI Location</CardTitle>
          <CardDescription>
            Fill in the details to create a new OCPI location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name</FormLabel>
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
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
                        <Input placeholder="Enter postal code" {...field} />
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
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input placeholder="US" {...field} maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="coordinates.latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 37.7749" {...field} />
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
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., -122.4194" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter additional details about this location" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/ocpi/locations')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLocationMutation.isPending}>
                  {createLocationMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Location
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default LocationCreatePage;
