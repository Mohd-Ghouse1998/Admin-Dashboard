
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/modules/users/hooks/useUser';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUser, deleteUser } = useUser();

  const userId = id as string;
  const { data: user, isLoading, error } = getUser(userId);

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(Number(userId));
      // The toast is handled in the mutation's onSuccess callback
      navigate('/users');
    } catch (error) {
      // Error is handled in the mutation's onError callback
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <PageLayout
        title="User Detail"
        description="View user information"
        backButton
        backTo="/users"
      >
        <Helmet>
          <title>User Detail | Admin Dashboard</title>
        </Helmet>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-64" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Show error message if loading fails
  if (error) {
    return (
      <PageLayout
        title="User Detail"
        description="View user information"
        backButton
        backTo="/users"
      >
        <Helmet>
          <title>User Detail | Admin Dashboard</title>
        </Helmet>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load user details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  // Show not found message if no user data
  if (!user) {
    return (
      <PageLayout
        title="User Detail"
        description="View user information"
        backButton
        backTo="/users"
      >
        <Helmet>
          <title>User Detail | Admin Dashboard</title>
        </Helmet>
        
        <Alert>
          <AlertTitle>User not found</AlertTitle>
          <AlertDescription>
            The requested user does not exist or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`User: ${user.username}`}
      description="View and manage user details"
      backButton
      backTo="/users"
      actions={
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <a href={`/users/${user.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user
                  account and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      <Helmet>
        <title>{`${user?.username || 'User'} | User Detail | Admin Dashboard`}</title>
      </Helmet>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">User Details</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">ID</div>
                    <div>{user.id}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Username</div>
                    <div>{user.username}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div>{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                    <div>{user.first_name} {user.last_name}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">OCPI Party ID</div>
                    <div>{user.profile?.ocpi_party_id || 'Not available'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">OCPI Role</div>
                    <div>
                      {user.profile?.ocpi_role ? (
                        <StatusBadge 
                          status={user.profile.ocpi_role} 
                          variant={user.profile.ocpi_role === 'CPO' ? 'info' : 'warning'} 
                        />
                      ) : 'Not assigned'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">OCPI Token</div>
                    <div className="truncate max-w-xs">{user.profile?.ocpi_token || 'Not available'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user && user.profile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Phone Number</div>
                      <div>{user.profile.phone_number || 'Not provided'}</div>
                      <div className="mt-1">
                        {user.profile.is_phone_verified ? 
                          <StatusBadge status="Verified" variant="success" /> : 
                          <StatusBadge status="Unverified" variant="neutral" />}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Email Verification</div>
                      <div>
                        {user.profile.is_email_verified ? 
                          <StatusBadge status="Verified" variant="success" /> : 
                          <StatusBadge status="Unverified" variant="neutral" />}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Address</div>
                      <div>{user.profile.address || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">City</div>
                      <div>{user.profile.city || 'Not provided'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">State</div>
                      <div>{user.profile.state || 'Not provided'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">PIN</div>
                      <div>{user.profile.pin || 'Not provided'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">OCPI Role</div>
                      <div>
                        {user.profile.ocpi_role ? (
                          <StatusBadge 
                            status={user.profile.ocpi_role} 
                            variant={user.profile.ocpi_role === 'CPO' ? 'info' : 'warning'} 
                          />
                        ) : (
                          'Not assigned'
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">OCPI Party ID</div>
                      <div>{user.profile.ocpi_party_id || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>No profile information available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Activity tracking not implemented yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default UserDetailPage;
