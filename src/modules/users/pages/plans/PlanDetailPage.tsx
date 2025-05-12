import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, Edit, Users, Clock, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { planService, Plan } from '@/services/planService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';

const PlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  
  // Fetch plan data
  const {
    data: plan,
    isLoading,
    error
  } = useQuery({
    queryKey: ['plan', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or plan ID available');
      }
      return planService.getPlan(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });
  
  // Fetch plan users data
  const {
    data: planUsers,
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['plan-users', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or plan ID available');
      }
      // This is a simplified query; in a real app, you'd filter by plan_id
      return planService.getPlanUsers(accessToken);
    },
    enabled: !!accessToken && !!id,
    select: (data) => {
      // Filter users by plan_id
      return {
        ...data,
        results: data.results.filter((user: any) => user.plan.id === id)
      };
    }
  });

  if (isLoading) {
    return (
      <PageLayout title="Plan Details" description="Loading plan information...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !plan) {
    return (
      <PageLayout title="Error" description="Failed to load plan details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load plan details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  // Plan features display
  const PlanFeatures = ({ features }: { features?: string[] }) => {
    if (!features || features.length === 0) {
      return <p className="text-muted-foreground italic">No features listed</p>;
    }

    return (
      <ul className="list-disc pl-5 space-y-1">
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    );
  };

  return (
    <PageLayout
      title={plan.name}
      description="Plan details and subscribers"
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Plans', url: '/users/plans' },
        { label: plan.name }
      ]}
      actions={
        <Button asChild>
          <Link to={`/users/plans/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>{plan.name} | Plans | Admin Dashboard</title>
      </Helmet>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="subscribers">
            Subscribers
            <Badge variant="secondary" className="ml-2">
              {planUsers?.results?.length || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Plan Information</CardTitle>
                <CardDescription>Details about this subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{plan.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Features</h3>
                  <div className="mt-1">
                    <PlanFeatures features={plan.features} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p className="mt-1">{formatDate(plan.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                    <p className="mt-1">{formatDate(plan.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                      <p className="text-xl font-bold">{formatCurrency(plan.price, plan.currency)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Billing Cycle</h3>
                      <p className="capitalize">{plan.billing_cycle.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  {plan.trial_days !== undefined && plan.trial_days > 0 && (
                    <div className="mt-2">
                      <Badge variant="outline">
                        {plan.trial_days} day{plan.trial_days !== 1 ? 's' : ''} free trial
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={plan.is_active ? 'success' : 'destructive'} className="text-sm">
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Subscribers</h3>
                    <div className="flex items-center mt-1">
                      <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className="text-xl font-bold">{planUsers?.results?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Plan Subscribers</CardTitle>
              <CardDescription>Users subscribed to this plan</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : planUsers?.results?.length ? (
                <DataTable
                  columns={[
                    {
                      header: 'User',
                      accessorKey: 'user.username',
                      cell: (row: any) => (
                        <Link to={`/users/users/${row.user.id}`} className="hover:underline text-primary">
                          {row.user.username || row.user.email}
                        </Link>
                      ),
                    },
                    {
                      header: 'Status',
                      accessorKey: 'status',
                      cell: (row: any) => (
                        <Badge 
                          variant={
                            row.status === 'active' ? 'success' : 
                            row.status === 'expired' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {row.status}
                        </Badge>
                      ),
                    },
                    {
                      header: 'Start Date',
                      accessorKey: 'start_date',
                      cell: (row: any) => formatDate(row.start_date),
                    },
                    {
                      header: 'End Date',
                      accessorKey: 'end_date',
                      cell: (row: any) => row.end_date ? formatDate(row.end_date) : 'N/A',
                    },
                    {
                      header: 'Actions',
                      accessorKey: 'id',
                      cell: (row: any) => (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/users/plan-users/${row.id}`}>
                            View Details
                          </Link>
                        </Button>
                      ),
                    }
                  ]}
                  data={planUsers.results}
                  keyField="id"
                  emptyMessage="No subscribers found for this plan."
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No subscribers</h3>
                  <p className="text-muted-foreground mt-1">This plan doesn't have any subscribers yet.</p>
                  <Button className="mt-4" asChild>
                    <Link to="/users/plan-users/create">
                      Add Subscriber
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default PlanDetailPage;
