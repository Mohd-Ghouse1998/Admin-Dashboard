import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Tag, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Calendar, 
  UserCheck,
  ShieldAlert,
  Clock,
  Key,
  Link as LinkIcon
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const IdTagDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  
  // Fetch the ID tag details
  const { data: idTag, isLoading, error } = useQuery({
    queryKey: ['idTag', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      console.log(`Fetching ID tag with id: ${id} and accessToken: ${accessToken ? 'Yes (token present)' : 'No token'}`);
      return chargerApi.getIdTag(accessToken, id);
    },
    enabled: !!id && !!accessToken
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('ID is required');
      return chargerApi.deleteIdTag(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: 'ID Tag Deleted',
        description: 'The ID tag was successfully deleted.',
      });
      
      // Navigate back to the list page
      navigate('/chargers/id-tags');
    },
    onError: (error) => {
      console.error('Error deleting ID tag:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the ID tag.',
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
    }
  });
  
  // Block/Unblock mutation
  const blockMutation = useMutation({
    mutationFn: () => {
      if (!idTag) return Promise.reject('No ID tag data');
      if (!id) throw new Error('ID is required');
      
      return chargerApi.updateIdTag(accessToken, id, {
        ...idTag,
        is_blocked: !idTag.is_blocked
      });
    },
    onSuccess: () => {
      toast({
        title: idTag?.is_blocked ? 'ID Tag Unblocked' : 'ID Tag Blocked',
        description: `The ID tag was successfully ${idTag?.is_blocked ? 'unblocked' : 'blocked'}.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['idTag', id] });
      setIsBlockDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating ID tag:', error);
      toast({
        title: 'Error',
        description: 'There was a problem updating the ID tag.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle delete
  const handleDelete = () => {
    deleteMutation.mutate();
  };
  
  // Handle block/unblock
  const handleBlockUnblock = () => {
    blockMutation.mutate();
  };
  
  if (isLoading || !accessToken) {
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
          <ArrowLeft className="mr-2 h-4 w-4" />
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
            The ID tag you are looking for could not be found. It may have been deleted.
          </AlertDescription>
        </Alert>
        
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/chargers/id-tags')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back to ID Tags
        </Button>
      </PageLayout>
    );
  }
  
  // Format expiry date if present
  const formattedExpiryDate = idTag.expiry_date
    ? format(new Date(idTag.expiry_date), 'PPpp')
    : 'No expiry date';
  
  return (
    <PageLayout
      title={`ID Tag: ${idTag.idtag}`}
      description="View and manage ID tag details"
      backButton
      backTo="/chargers/id-tags"
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            asChild
          >
            <Link to={`/chargers/id-tags/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <Button
            variant={idTag.is_blocked ? "default" : "destructive"}
            onClick={() => setIsBlockDialogOpen(true)}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            {idTag.is_blocked ? 'Unblock' : 'Block'}
          </Button>
          
          <Button 
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <Helmet>
        <title>ID Tag Details | Electric Flow Admin Portal</title>
      </Helmet>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>ID tag details and configurations</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID Tag</h3>
              <p className="text-xl font-semibold flex items-center">
                <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                {idTag.idtag}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={idTag.is_blocked ? "destructive" : "success"}>
                  {idTag.is_blocked ? 'Blocked' : 'Active'}
                </Badge>
                
                {idTag.is_expired && (
                  <Badge variant="destructive">Expired</Badge>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={idTag.is_expired ? "text-destructive" : ""}>
                  {formattedExpiryDate}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">User Assignment</h3>
              <div className="flex items-center gap-2 mt-1">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                {idTag.user ? (
                  <Link 
                    to={`/users/${idTag.user}`}
                    className="text-primary hover:underline"
                  >
                    User {idTag.user}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Not assigned to any user</span>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Parent ID Tag</h3>
              <div className="flex items-center gap-2 mt-1">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                {idTag.parent_idtag ? (
                  <span>{idTag.parent_idtag}</span>
                ) : (
                  <span className="text-muted-foreground">No parent ID tag</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Activity and History
            </CardTitle>
            <CardDescription>Usage and modification history</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No activity data available yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete ID Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the ID tag "{idTag.idtag}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting this ID tag will remove it from the system and any associated permissions.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete ID Tag'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Block/Unblock Confirmation Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {idTag.is_blocked ? 'Unblock' : 'Block'} ID Tag
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {idTag.is_blocked ? 'unblock' : 'block'} the ID tag "{idTag.idtag}"?
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Alert variant={idTag.is_blocked ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                {idTag.is_blocked
                  ? "Unblocking this ID tag will allow it to be used for authentication at charging stations."
                  : "Blocking this ID tag will prevent it from being used for authentication at charging stations."}
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={idTag.is_blocked ? "default" : "destructive"}
              onClick={handleBlockUnblock}
              disabled={blockMutation.isPending}
            >
              {blockMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {idTag.is_blocked ? 'Unblocking...' : 'Blocking...'}
                </>
              ) : (
                idTag.is_blocked ? 'Unblock ID Tag' : 'Block ID Tag'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default IdTagDetailPage;
