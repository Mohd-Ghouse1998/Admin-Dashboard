import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useToast } from '@/components/ui/use-toast';

// Define schema for form validation
const idTagSchema = z.object({
  idtag: z.string().min(1, 'ID Tag is required'),
  user: z.coerce.number().optional().nullable(),
  parent_idtag: z.string().optional().nullable(),
  is_blocked: z.boolean().default(false),
  expiry_date: z.string().optional().nullable(),
});

type IdTagFormValues = z.infer<typeof idTagSchema>;

const IdTagCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IdTagFormValues>({
    resolver: zodResolver(idTagSchema),
    defaultValues: {
      idtag: '',
      user: null,
      parent_idtag: '',
      is_blocked: false,
      expiry_date: null,
    }
  });
  
  // State to track loading status
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Form submission handler
  const onSubmit = async (data: IdTagFormValues) => {
    // Process the data before submission
    const formData = {
      idtag: data.idtag,
      // If user is empty string or 0, set to null
      user: data.user ? Number(data.user) : null,
      // If parent_idtag is empty string, set to null
      parent_idtag: data.parent_idtag && data.parent_idtag.trim() !== '' ? data.parent_idtag : null,
      // Default is_blocked value to false if not set
      is_blocked: data.is_blocked || false,
      // If expiry_date is empty string, set to null
      expiry_date: data.expiry_date && data.expiry_date.trim() !== '' ? data.expiry_date : null,
    };
    
    try {
      setIsCreating(true);
      setError(null);
      
      // Pass the accessToken as the first parameter to chargerApi.createIdTag
      const response = await chargerApi.createIdTag(accessToken, formData);
      
      toast({
        title: 'ID Tag Created',
        description: 'The ID tag was successfully created.',
      });
      
      // Navigate to the detail page of the newly created ID tag
      if (response && response.id) {
        navigate(`/chargers/id-tags/${response.id}`);
      } else {
        navigate('/chargers/id-tags');
      }
    } catch (err) {
      console.error('Error creating ID tag:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: 'Error',
        description: 'There was a problem creating the ID tag.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <PageLayout
      title="Create ID Tag"
      description="Add a new ID tag for charger authentication"
      backButton
      backTo="/chargers/id-tags"
    >
      <Helmet>
        <title>Create ID Tag | Electric Flow Admin Portal</title>
      </Helmet>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the ID tag details</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idtag">ID Tag <span className="text-destructive">*</span></Label>
              <Input
                id="idtag"
                placeholder="e.g. USER123"
                {...register('idtag')}
              />
              {errors.idtag && (
                <p className="text-sm text-destructive">{errors.idtag.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user">User ID</Label>
              <Input
                id="user"
                type="number"
                placeholder="e.g. 123"
                {...register('user')}
              />
              <p className="text-xs text-muted-foreground">
                The user associated with this ID tag
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parent_idtag">Parent ID Tag</Label>
              <Input
                id="parent_idtag"
                placeholder="e.g. PARENT001"
                {...register('parent_idtag')}
              />
              <p className="text-xs text-muted-foreground">
                Optional parent ID tag for hierarchical relationships
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="datetime-local"
                {...register('expiry_date')}
              />
              <p className="text-xs text-muted-foreground">
                When the ID tag will expire (leave empty for no expiry)
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_blocked">Blocked</Label>
                <p className="text-xs text-muted-foreground">
                  Whether the ID tag is blocked from use
                </p>
              </div>
              <Controller
                control={control}
                name="is_blocked"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="is_blocked"
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to create ID tag. Please check your inputs and try again.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/chargers/id-tags')}
          >
            Cancel
          </Button>
          
          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create ID Tag'
            )}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};

export default IdTagCreatePage;
