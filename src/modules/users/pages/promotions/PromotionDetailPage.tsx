import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Edit, Calendar, Tag, Percent, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock service for promotions - replace with actual service when available
const promotionService = {
  getPromotionById: async (accessToken: string, id: string) => {
    // This would be replaced with an actual API call
    return {
      id,
      name: 'Summer Discount',
      code: 'SUMMER25',
      description: 'Get 25% off on all charging sessions during summer. Limited time offer for all customers.',
      discount_type: 'percentage',
      discount_value: 25,
      start_date: '2025-06-01T00:00:00Z',
      end_date: '2025-08-31T23:59:59Z',
      active: true,
      created_at: '2025-05-01T10:00:00Z',
      updated_at: '2025-05-01T10:00:00Z',
      usage_count: 145, // Additional stats that might be available
      total_discount_amount: 3625.75
    };
  }
};

const PromotionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  
  // Fetch promotion data
  const {
    data: promotion,
    isLoading,
    error
  } = useQuery({
    queryKey: ['promotion', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or promotion ID available');
      }
      return promotionService.getPromotionById(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });

  if (isLoading) {
    return (
      <PageLayout title="Promotion Details" description="Loading promotion information...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !promotion) {
    return (
      <PageLayout title="Error" description="Failed to load promotion details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load promotion details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  // Check if promotion is currently active
  const isActive = promotion.active && 
    new Date(promotion.start_date) <= new Date() && 
    new Date(promotion.end_date) >= new Date();

  return (
    <PageLayout
      title={promotion.name}
      description="Promotion details and usage statistics"
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Promotions', url: '/users/promotions' },
        { label: promotion.name }
      ]}
      actions={
        <Button asChild>
          <Link to={`/users/promotions/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Promotion
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>{promotion.name} | Promotions | Admin Dashboard</title>
      </Helmet>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{promotion.name}</CardTitle>
                <CardDescription>Promotional offer details</CardDescription>
              </div>
              <Badge variant={isActive ? 'success' : 'secondary'} className="ml-2">
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-3 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Promotion Code</h3>
                <p className="text-xl font-mono">{promotion.code}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">{promotion.description || 'No description provided'}</p>
            </div>
            
            <div className="flex items-center">
              {promotion.discount_type === 'percentage' ? (
                <Percent className="h-5 w-5 mr-3 text-muted-foreground" />
              ) : (
                <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Discount</h3>
                <p className="text-xl font-bold">
                  {promotion.discount_type === 'percentage' 
                    ? `${promotion.discount_value}%` 
                    : formatCurrency(promotion.discount_value, 'USD')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {promotion.discount_type === 'percentage' 
                    ? 'Percentage off total amount' 
                    : 'Fixed amount discount'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                  <p>{formatDate(promotion.start_date)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                  <p>{formatDate(promotion.end_date)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="mt-1">{formatDate(promotion.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="mt-1">{formatDate(promotion.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Status</h3>
              <Badge variant={isActive ? 'success' : 'secondary'}>
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Times Used</h3>
              <span className="font-bold">{promotion.usage_count || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Total Discount Amount</h3>
              <span className="font-bold">
                {formatCurrency(promotion.total_discount_amount || 0, 'USD')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Avg. Discount Per Use</h3>
              <span className="font-bold">
                {promotion.usage_count 
                  ? formatCurrency(
                      (promotion.total_discount_amount || 0) / promotion.usage_count, 
                      'USD'
                    ) 
                  : formatCurrency(0, 'USD')}
              </span>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Days Remaining</h3>
              {new Date(promotion.end_date) > new Date() ? (
                <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, 
                        ((new Date(promotion.end_date).getTime() - new Date().getTime()) / 
                        (new Date(promotion.end_date).getTime() - new Date(promotion.start_date).getTime())) * 100
                      ))}%`
                    }}
                  />
                </div>
              ) : (
                <Badge variant="destructive">Expired</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PromotionDetailPage;
