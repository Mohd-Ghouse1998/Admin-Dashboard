import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// UI Components
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DetailTemplate, DetailSection } from '@/components/templates/detail/DetailTemplate';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Icons
import { 
  Tag, 
  Calendar, 
  UserCheck,
  ShieldAlert,
  Clock,
  Key,
  Link as LinkIcon,
  AlertCircle,
  Trash2,
  Edit,
  Info,
  User as UserIcon,
  GitBranch,
  Copy,
  Ban,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

// ID Tag interface
interface IDTag {
  id: number;
  idtag: string;
  user?: number;
  parent_idtag?: string | null;
  is_blocked: boolean;
  expiry_date?: string | null;
  is_expired: boolean;
  created_at?: string;
}

const IdTagDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  // State variables for dialogs
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
  
  // Format dates in a readable way
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'PPpp');
  };
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: message,
    });
  };
  
  // Handle delete
  const handleDelete = () => {
    deleteMutation.mutate();
  };
  
  // Handle block/unblock
  const handleBlockUnblock = () => {
    blockMutation.mutate();
  };
  
  // Error state if no data
  if (error && !isLoading) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return (
      <DetailTemplate
        title="ID Tag"
        subtitle="Error loading ID tag details"
        icon={<Tag className="h-5 w-5" />}
        backPath="/chargers/id-tags"
        backLabel="Back to ID Tags"
        error={errorMessage}
      />
    );
  }
  
  // Define actions for the DetailTemplate
  const actions = [
    {
      label: idTag?.is_blocked ? 'Unblock' : 'Block',
      icon: <ShieldAlert className="h-4 w-4" />,
      onClick: () => setIsBlockDialogOpen(true),
      variant: idTag?.is_blocked ? 'default' : 'destructive' as 'default' | 'destructive'
    }
  ];
  
  return (
    <>
      <DetailTemplate
        title={idTag ? `ID Tag: ${idTag.idtag}` : 'ID Tag Details'}
        subtitle={idTag ? `Manage and view details for ID tag ${idTag.idtag}` : 'Loading...'}
        description={idTag?.is_blocked ? 'This ID tag is currently blocked' : undefined}
        icon={<Tag className="h-5 w-5" />}
        backPath="/chargers/id-tags"
        backLabel="Back to ID Tags"
        isLoading={isLoading}
        error={error ? String(error) : null}
        editPath={idTag ? `/chargers/id-tags/${id}/edit` : undefined}
        onDelete={() => setIsDeleteDialogOpen(true)}
        actions={actions}
      >
        {idTag && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DetailSection
              title="Basic Information"
              description="ID tag details and configuration"
              icon={<Key className="h-5 w-5" />}
              className="h-fit"
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">ID Tag</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{idTag.idtag}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => copyToClipboard(idTag.idtag, "ID Tag copied to clipboard")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    {idTag.is_blocked ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Ban className="h-3.5 w-3.5" />
                        Blocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </Badge>
                    )}
                    
                    {idTag.is_expired && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Expiry Date</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={idTag.is_expired ? "text-destructive font-medium" : ""}>
                      {idTag.expiry_date 
                        ? formatDate(idTag.expiry_date)
                        : <span className="text-muted-foreground">No expiry date</span>
                      }
                    </span>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">User Assignment</span>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    {idTag.user ? (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate(`/users/${idTag.user}`)}
                      >
                        User {idTag.user}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">Not assigned to any user</span>
                    )}
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Parent ID Tag</span>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    {idTag.parent_idtag ? (
                      <span>{idTag.parent_idtag}</span>
                    ) : (
                      <span className="text-muted-foreground">No parent ID tag</span>
                    )}
                  </div>
                </div>
              </div>
            </DetailSection>
            
            <DetailSection
              title="Usage Analytics"
              description="Usage statistics and performance metrics"
              icon={<Clock className="h-5 w-5" />}
              className="h-fit"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-50/50">
                  <CardContent className="p-4">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No usage data available yet</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50/50">
                  <CardContent className="p-4">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No session data available yet</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Usage analytics will be shown here once the ID tag has been used at charging stations.
                </AlertDescription>
              </Alert>
            </DetailSection>
            
            <DetailSection
              title="Authorization Settings"
              description="Control authorization and security settings"
              icon={<ShieldAlert className="h-5 w-5" />}
              className="h-fit lg:col-span-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Access Control</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Authorization Status</span>
                      {idTag.is_blocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Authorized
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Validity Status</span>
                      {idTag.is_expired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Valid
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant={idTag.is_blocked ? "default" : "destructive"}
                      className="w-full"
                      onClick={() => setIsBlockDialogOpen(true)}
                    >
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      {idTag.is_blocked ? 'Unblock ID Tag' : 'Block ID Tag'}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Expiration Management</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expiry Date</span>
                      <span className={idTag.is_expired ? "text-destructive font-medium" : ""}>
                        {idTag.expiry_date 
                          ? formatDate(idTag.expiry_date)
                          : <span className="text-muted-foreground">No expiry date</span>
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      {idTag.is_expired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <a href={`/chargers/id-tags/${id}/edit`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Update Expiry Date
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </DetailSection>
          </div>
        )}
      </DetailTemplate>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ID Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the ID tag "{idTag?.idtag}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting this ID tag will remove it from the system and any associated permissions.
              </AlertDescription>
            </Alert>
          </div>
          
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
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
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Block/Unblock Confirmation Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {idTag?.is_blocked ? 'Unblock' : 'Block'} ID Tag
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {idTag?.is_blocked ? 'unblock' : 'block'} the ID tag "{idTag?.idtag}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="mt-4">
            <Alert variant={idTag?.is_blocked ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                {idTag?.is_blocked
                  ? "Unblocking this ID tag will allow it to be used for authentication at charging stations."
                  : "Blocking this ID tag will prevent it from being used for authentication at charging stations."}
              </AlertDescription>
            </Alert>
          </div>
          
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockUnblock}
              className={idTag?.is_blocked ? "" : "bg-destructive hover:bg-destructive/90"}
              disabled={blockMutation.isPending}
            >
              {blockMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {idTag?.is_blocked ? 'Unblocking...' : 'Blocking...'}
                </>
              ) : (
                idTag?.is_blocked ? 'Unblock ID Tag' : 'Block ID Tag'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IdTagDetailPage;
