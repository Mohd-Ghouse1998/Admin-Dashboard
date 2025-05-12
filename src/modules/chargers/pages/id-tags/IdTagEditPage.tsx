import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
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
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

// Define schema for form validation
const idTagSchema = z.object({
  idtag: z.string().min(1, 'ID Tag is required'),
  user: z.coerce.number().optional().nullable(),
  parent_idtag: z.string().optional().nullable(),
  is_blocked: z.boolean().default(false),
  expiry_date: z.string().optional().nullable(),
});

type IdTagFormValues = z.infer<typeof idTagSchema>;

interface IdTag {
  id: number;
  idtag: string;
  user?: number | null;
  parent_idtag?: string | null;
  is_blocked: boolean;
  expiry_date?: string | null;
  last_modified?: string;
}

const IdTagEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
  // State for loading and error handling
  const [idTag, setIdTag] = useState<IdTag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);
  
  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    control,
    reset,
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
  
  // Fetch the ID tag details
  useEffect(() => {
    const fetchIdTag = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await chargerApi.getIdTag(accessToken, id);
        setIdTag(data);
        
        console.log('Received ID tag data:', data);
        
        // Format the expiry_date properly for input[type=datetime-local]
        let formattedExpiryDate = null;
        if (data.expiry_date) {
          try {
            const expiryDate = new Date(data.expiry_date);
            formattedExpiryDate = format(expiryDate, "yyyy-MM-dd'T'HH:mm");
            console.log('Formatted expiry date:', formattedExpiryDate);
          } catch (err) {
            console.error('Error formatting expiry date:', err);
          }
        }
        
        reset({
          idtag: data.idtag || '',
          user: data.user || null,
          parent_idtag: data.parent_idtag || '',
          is_blocked: data.is_blocked || false,
          expiry_date: formattedExpiryDate,
        });
      } catch (err) {
        console.error('Error fetching ID tag:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch ID tag'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIdTag();
  }, [id, reset, accessToken]);

  // Form submission handler
  const onSubmit = async (data: IdTagFormValues) => {
    if (!id) return;
    
    // Process the data before submission
    const formData = {
      idtag: data.idtag,
      // If user is empty string or 0, set to null
      user: data.user ? Number(data.user) : null,
      // If parent_idtag is empty string, set to null
      parent_idtag: data.parent_idtag && data.parent_idtag.trim() !== '' ? data.parent_idtag : null,
      // Ensure is_blocked is always included
      is_blocked: data.is_blocked || false,
      // If expiry_date is empty string, set to null
      expiry_date: data.expiry_date && data.expiry_date.trim() !== '' ? data.expiry_date : null,
    };
    
    try {
      setIsUpdating(true);
      setUpdateError(null);
      
      await chargerApi.updateIdTag(accessToken, id, formData);
      
      toast({
        title: 'ID Tag Updated',
        description: 'The ID tag was successfully updated.',
      });
      
      // Navigate back to detail page
      navigate(`/chargers/id-tags/${id}`);
    } catch (err) {
      console.error('Error updating ID tag:', err);
      setUpdateError(err instanceof Error ? err : new Error('Failed to update ID tag'));
      toast({
        title: 'Error',
        description: 'There was a problem updating the ID tag.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoading) {
    return (
      <PageLayout
        title="Loading ID Tag"
        description="Please wait while we load the ID tag details"
        backButton
        backTo="/chargers/id-tags"
      >
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading ID tag details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout
        title="Error Loading ID Tag"
        description="There was an error loading the ID tag details"
        backButton
        backTo="/chargers/id-tags"
      >
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem loading the ID tag details. Please try again.
          </AlertDescription>
        </Alert>
        
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/chargers/id-tags')}
        >
          Go Back to ID Tags
        </Button>
      </PageLayout>
    );
  }
  
  if (!idTag) {
    return (
      <PageLayout
        title="ID Tag Not Found"
        description="The requested ID tag could not be found"
        backButton
        backTo="/chargers/id-tags"
      >
        <Alert variant="default" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The ID tag you are trying to edit could not be found. It may have been deleted.
          </AlertDescription>
        </Alert>
        
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/chargers/id-tags')}
        >
          Go Back to ID Tags
        </Button>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title={`Edit ID Tag: ${idTag?.idtag || 'Loading...'}`}
      description="Update ID tag details"
      backButton
      backTo={`/chargers/id-tags/${id}`}
    >
      <Helmet>
        <title>Edit ID Tag | Electric Flow Admin Portal</title>
      </Helmet>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the ID tag details</CardDescription>
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
        
        {updateError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to update ID tag. Please check your inputs and try again.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/chargers/id-tags/${id}`)}
          >
            Cancel
          </Button>
          
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update ID Tag'
            )}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};

export default IdTagEditPage;
