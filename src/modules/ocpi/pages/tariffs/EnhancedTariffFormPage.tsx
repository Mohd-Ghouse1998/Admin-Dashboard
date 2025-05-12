import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { OCPIApiService } from '../../services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Import our custom components
import TariffWizard from '../../components/tariffs/TariffWizard';
import { TariffElementComposer } from '../../components/tariffs/TariffElementComposer';
import { MultilingualEditor } from '../../components/tariffs/MultilingualEditor';
import { EnergyMixEditor } from '../../components/tariffs/EnergyMixEditor';

// Import OCPI types and transformations
import { 
  OCPITariff, 
  TariffElement, 
  DisplayText, 
  EnergyMix 
} from '../../types/tariff.types';
import { 
  transformTariffFromBackend, 
  transformTariffToBackend,
  createEmptyTariff
} from '../../utils/tariff.transformers';

// Currencies commonly used in OCPI
const CURRENCIES = [
  'EUR', 'USD', 'GBP', 'CHF', 'NOK', 'SEK', 'DKK', 'JPY', 'CAD', 'AUD', 'INR'
];

// Define the tariff form schema with Zod - using proper OCPI structure
const tariffFormSchema = z.object({
  tariff_id: z.string().min(1, "Tariff ID is required"),
  currency: z.string().min(1, "Currency is required"),
  elements: z.array(z.object({
    price_components: z.array(z.object({
      type: z.enum(['TIME', 'ENERGY', 'FLAT', 'PARKING_TIME']),
      price: z.number().min(0, "Price must be a positive number"),
      step_size: z.number().min(1, "Step size must be at least 1")
    })).min(1, "At least one price component is required"),
    restrictions: z.object({
      time_restrictions: z.array(z.object({
        start_time: z.string(),
        end_time: z.string(),
        day_of_week: z.array(z.string()).optional()
      }))
    }).optional()
  })).min(1, "At least one tariff element is required"),
  display_text: z.array(z.object({
    language: z.string().min(1, "Language code is required"),
    text: z.string().min(1, "Display text is required")
  })).min(1, "At least one display text is required"),
  energy_mix: z.object({
    is_green_energy: z.boolean(),
    energy_sources: z.array(z.object({
      source: z.string(),
      percentage: z.number().min(0).max(100)
    }))
  }).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  start_date_time: z.string().optional(),
  end_date_time: z.string().optional(),
  tariff_alt_url: z.string().optional(),
  locations: z.array(z.string()).optional(),
  evses: z.array(z.string()).optional()
});

// Use the OCPITariff type directly from our types file
type TariffFormValues = OCPITariff;

const EnhancedTariffFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  
  // Form setup with proper OCPI structure
  const form = useForm<TariffFormValues>({
    resolver: zodResolver(tariffFormSchema),
    defaultValues: createEmptyTariff()
  });
  
  // Get form controls
  const { control, setValue, watch } = form;
  
  // Fetch locations for assignment
  const { 
    data: locations = [], 
    isLoading: isLoadingLocations 
  } = useQuery({
    queryKey: ['ocpi', 'locations'],
    queryFn: async () => {
      try {
        const response = await OCPIApiService.common.resources.locations.getAll();
        return response.data.results || [];
      } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
      }
    },
    enabled: true
  });
  
  // Fetch tariff data when editing
  const {
    data: tariff,
    isLoading: isLoadingTariff,
    error: tariffError
  } = useQuery({
    queryKey: ['ocpi', 'tariff', id],
    queryFn: async () => {
      try {
        if (!id) throw new Error('No tariff ID provided');
        const response = await OCPIApiService.common.resources.tariffs.getById(id as string);
        // Transform the backend data to our frontend format
        return transformTariffFromBackend(response.data || {});
      } catch (error) {
        console.error('Error fetching tariff:', error);
        throw error;
      }
    },
    enabled: isEditing, // Only run this query when editing
    retry: 1
  });
  
  // Set form values when tariff data is loaded
  useEffect(() => {
    if (tariff && isEditing) {
      // Use form.reset to set all values at once
      form.reset(tariff);
    }
  }, [tariff, isEditing, form]);
  
  // Handle errors for tariff fetch
  const handleTariffError = () => {
    toast({
      title: 'Error loading tariff',
      description: 'Failed to load tariff details. Please try again.',
      variant: 'destructive'
    });
    
    // Navigate back to list after error
    navigate('/ocpi/tariffs');
  };
  
  // Create or update tariff mutation
  const tariffMutation = useMutation({
    mutationFn: async (values: TariffFormValues) => {
      // Transform frontend data to backend format
      const tariffData = transformTariffToBackend(values);
      
      if (isEditing && id) {
        return OCPIApiService.common.resources.tariffs.update(id as string, tariffData);
      } else {
        return OCPIApiService.common.resources.tariffs.create(tariffData);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'Tariff updated' : 'Tariff created',
        description: `Tariff has been successfully ${isEditing ? 'updated' : 'created'}.`,
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'tariffs'] });
      navigate('/ocpi/tariffs');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} tariff: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (values: TariffFormValues) => {
    tariffMutation.mutate(values);
  };
  
  // Define wizard steps with OCPI-compliant structure
  const basicInfoStep = (
    <div className="space-y-6">
      <FormField
        control={control}
        name="tariff_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tariff ID</FormLabel>
            <FormControl>
              <Input placeholder="Enter tariff ID" {...field} />
            </FormControl>
            <FormDescription>
              A unique identifier for this tariff, following OCPI specification.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              ISO 4217 currency code for the pricing.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Whether this tariff is currently active and can be assigned to locations.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="min_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormDescription>
                Minimum price for this tariff (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="max_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormDescription>
                Maximum price for this tariff (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="start_date_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={"w-full pl-3 text-left font-normal"}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span className="text-muted-foreground">No start date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Set to start of day in ISO format
                        const dateStr = new Date(date.setHours(0, 0, 0, 0)).toISOString();
                        field.onChange(dateStr);
                      } else {
                        field.onChange("");
                      }
                    }}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When this tariff becomes active.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="end_date_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={"w-full pl-3 text-left font-normal"}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span className="text-muted-foreground">No end date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Set to end of day in ISO format
                        const dateObj = new Date(date.setHours(23, 59, 59, 999));
                        field.onChange(dateObj.toISOString());
                      } else {
                        field.onChange("");
                      }
                    }}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When this tariff expires.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="tariff_alt_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alternative URL</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com/tariff-details" {...field} />
            </FormControl>
            <FormDescription>
              Optional URL where more information about this tariff can be found.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
  
  const elementsStep = (
    <div className="space-y-6">
      <FormField
        control={control}
        name="elements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tariff Elements</FormLabel>
            <FormDescription>
              Define price components and time restrictions for this tariff.
            </FormDescription>
            <TariffElementComposer
              elements={field.value || []}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
  
  const displayTextStep = (
    <div className="space-y-6">
      <FormField
        control={control}
        name="display_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display Text</FormLabel>
            <FormDescription>
              Define how this tariff should be presented to users in different languages.
            </FormDescription>
            <MultilingualEditor
              texts={field.value || []}
              onChange={field.onChange}
              title="Display Name"
              description="The name of this tariff in different languages"
            />
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="tariff_alt_text"
        render={({ field }) => (
          <FormItem>
            <MultilingualEditor
              texts={field.value || []}
              onChange={field.onChange}
              title="Alternative Text"
              description="Additional information about this tariff in different languages"
              multiline={true}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
  
  const energyMixStep = (
    <div className="space-y-6">
      <FormField
        control={control}
        name="energy_mix"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Energy Mix</FormLabel>
            <FormDescription>
              Define the energy sources used for this tariff.
            </FormDescription>
            <EnergyMixEditor
              energyMix={field.value || { energy_sources: [], is_green_energy: false }}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
  
  const assignmentStep = (
    <div className="space-y-6">
      {isLoadingLocations ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <FormField
          control={control}
          name="locations"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Assign to Locations</FormLabel>
                <FormDescription>
                  Choose which locations will use this tariff
                </FormDescription>
              </div>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {locations.map((location: any) => (
                  <FormItem
                    key={location.id}
                    className="flex flex-row items-start space-x-3 space-y-0 py-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={Array.isArray(field.value) && field.value.includes(location.id)}
                        onCheckedChange={(checked) => {
                          const currentLocations = Array.isArray(field.value) ? field.value : [];
                          return checked
                            ? field.onChange([...currentLocations, location.id])
                            : field.onChange(
                                currentLocations.filter(value => value !== location.id)
                              );
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">
                        {location.name}
                      </FormLabel>
                      <FormDescription>
                        {location.address}
                        {location.city && `, ${location.city}`}
                      </FormDescription>
                    </div>
                  </FormItem>
                ))}
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
  
  // Define all wizard steps
  const wizardSteps = [
    basicInfoStep,
    elementsStep,
    displayTextStep,
    energyMixStep,
    assignmentStep
  ];
  
  const stepTitles = [
    "Basic Information", 
    "Tariff Elements", 
    "Display Text",
    "Energy Mix",
    "Location Assignment"
  ];
  
  // Loading state
  if (isEditing && isLoadingTariff) {
    return (
      <PageLayout 
        title="Edit Tariff" 
        description="Loading tariff details"
        backButton
        backTo="/ocpi/tariffs"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }
  
  // Get a display name for the tariff (use first display_text or tariff_id)
  const getTariffDisplayName = () => {
    if (!tariff) return '';
    
    if (tariff.display_text && tariff.display_text.length > 0) {
      const englishText = tariff.display_text.find(dt => dt.language === 'en');
      return englishText ? englishText.text : tariff.display_text[0].text;
    }
    
    return tariff.tariff_id;
  };

  return (
    <PageLayout
      title={isEditing ? `Edit Tariff: ${getTariffDisplayName()}` : "Create Tariff"}
      description={isEditing ? "Modify tariff settings" : "Create a new pricing tariff"}
      backButton
      backTo="/ocpi/tariffs"
    >
      <Form {...form}>
        <form id="tariff-form" onSubmit={form.handleSubmit(onSubmit)}>
          <TariffWizard
            steps={wizardSteps}
            stepTitles={stepTitles}
            onComplete={form.handleSubmit(onSubmit)}
            onCancel={() => navigate('/ocpi/tariffs')}
            isSubmitting={tariffMutation.isPending}
            isEditMode={isEditing}
          />
        </form>
      </Form>
    </PageLayout>
  );
};

export default EnhancedTariffFormPage;
