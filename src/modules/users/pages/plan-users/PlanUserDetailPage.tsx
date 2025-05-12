import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Edit, User, Calendar, CreditCard } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { planService } from '@/services/planService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

const PlanUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  
  // Fetch plan user data
  const {
    data: planUser,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['plan-user', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or subscription ID available');
      }
      return planService.getPlanUser(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });
  
  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No subscription ID available');
      return planService.cancelSubscription(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription canceled successfully",
        variant: "success",
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <PageLayout title="Subscription Details" description="Loading subscription information...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !planUser) {
    return (
      <PageLayout title="Error" description="Failed to load subscription details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load subscription details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'canceled': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <PageLayout
      title="Subscription Details"
      description={`Subscription details for ${planUser.user?.username || 'User'}`}
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Plan Subscriptions', url: '/users/plan-users' },
        { label: `Subscription ${id}` }
      ]}
      actions={
        <div className="flex space-x-2">
          <Button asChild>
            <Link to={`/users/plan-users/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          
          {planUser.status === 'active' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel Subscription</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this subscription? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelSubscriptionMutation.mutate()}
                    disabled={cancelSubscriptionMutation.isPending}
                  >
                    {cancelSubscriptionMutation.isPending ? 'Canceling...' : 'Yes, Cancel Subscription'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      }
    >
      <Helmet>
        <title>Subscription Details | Admin Dashboard</title>
      </Helmet>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Information</CardTitle>
            <CardDescription>Details about this plan subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subscription ID</h3>
                <p className="mt-1 font-mono text-sm">{planUser.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(planUser.status)} className="capitalize">
                    {planUser.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">User</h3>
              <div className="mt-1 flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <Link to={`/users/users/${planUser.user?.id}`} className="hover:underline text-primary">
                  {planUser.user?.username || planUser.user?.email || 'N/A'}
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Plan</h3>
              <div className="mt-1">
                <Link to={`/users/plans/${planUser.plan?.id}`} className="hover:underline text-primary font-medium">
                  {planUser.plan?.name || 'N/A'}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {planUser.plan?.description || 'No description available'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(planUser.start_date)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {planUser.end_date ? formatDate(planUser.end_date) : 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="mt-1">{formatDate(planUser.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="mt-1">{formatDate(planUser.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planUser.plan && (
              <>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                    <p className="text-xl font-bold">
                      {formatCurrency(planUser.plan.price, planUser.plan.currency)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Billing Cycle</h3>
                  <p className="capitalize">
                    {planUser.plan.billing_cycle.replace('_', ' ')}
                  </p>
                </div>
                
                {planUser.plan.features && planUser.plan.features.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Features</h3>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      {planUser.plan.features.map((feature, index) => (
                        <li key={index} className="text-sm">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PlanUserDetailPage;
