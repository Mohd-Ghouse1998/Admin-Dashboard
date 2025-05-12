import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Edit, User, Calendar, Clock, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock service for session billings - replace with actual service when available
const sessionBillingService = {
  getSessionBillingById: async (accessToken: string, id: string) => {
    // This would be replaced with an actual API call
    return {
      id,
      user: { id: '1', username: 'user1', email: 'user1@example.com' },
      session_id: 'SESSION123',
      amount: 125.50,
      start_time: '2025-04-25T10:00:00Z',
      end_time: '2025-04-25T11:30:00Z',
      status: 'paid',
      created_at: '2025-04-25T11:35:00Z',
      updated_at: '2025-04-25T11:40:00Z'
    };
  }
};

const SessionBillingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  
  // Fetch session billing data
  const {
    data: billing,
    isLoading,
    error
  } = useQuery({
    queryKey: ['session-billing', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or billing ID available');
      }
      return sessionBillingService.getSessionBillingById(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });

  if (isLoading) {
    return (
      <PageLayout title="Billing Details" description="Loading billing information...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !billing) {
    return (
      <PageLayout title="Error" description="Failed to load billing details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load billing details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  // Calculate session duration in hours and minutes
  const calculateDuration = () => {
    const start = new Date(billing.start_time);
    const end = new Date(billing.end_time);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <PageLayout
      title="Session Billing Details"
      description={`Details for session billing ${billing.id}`}
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Session Billings', url: '/users/session-billings' },
        { label: `Billing ${billing.id}` }
      ]}
      actions={
        <Button asChild>
          <Link to={`/users/session-billings/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Session Billing Details | Admin Dashboard</title>
      </Helmet>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Details about this charging session billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Billing ID</h3>
                <p className="mt-1 font-mono text-sm">{billing.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(billing.status)} className="capitalize">
                    {billing.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">User</h3>
              <div className="mt-1 flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <Link to={`/users/users/${billing.user?.id}`} className="hover:underline text-primary">
                  {billing.user?.username || billing.user?.email || 'N/A'}
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Session ID</h3>
              <div className="mt-1">
                <Link to={`/chargers/charging-sessions/${billing.session_id}`} className="hover:underline text-primary font-medium">
                  {billing.session_id}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                <p className="text-xl font-bold">{formatCurrency(billing.amount, 'USD')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Start Time</h3>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(billing.start_time)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">End Time</h3>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(billing.end_time)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="mt-1">{formatDate(billing.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="mt-1">{formatDate(billing.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                <p className="text-xl font-bold">{calculateDuration()}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Rate</h3>
              <p className="mt-1">
                {/* Placeholder for rate calculation */}
                {formatCurrency(billing.amount / (calculateDuration().split('h')[0] as unknown as number), 'USD')}/hour
              </p>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Payment Details</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(billing.amount * 0.9, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(billing.amount * 0.1, 'USD')}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(billing.amount, 'USD')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SessionBillingDetailPage;
