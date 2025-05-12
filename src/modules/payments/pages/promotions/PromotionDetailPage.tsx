import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Tag, 
  Percent, 
  User,
  Activity,
  Copy
} from 'lucide-react';
import { getPromotion, Promotion } from '@/services/api/promotionsApi';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const PromotionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPromotion(parseInt(id));
    }
  }, [id]);

  const fetchPromotion = async (promotionId: number) => {
    setIsLoading(true);
    try {
      const response = await getPromotion(promotionId);
      setPromotion(response.data);
    } catch (error) {
      console.error('Failed to fetch promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promotion details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/payments/promotions');
  };

  const copyCodeToClipboard = () => {
    if (promotion) {
      navigator.clipboard.writeText(promotion.code)
        .then(() => {
          toast({
            title: 'Success',
            description: 'Promotion code copied to clipboard',
            variant: 'success',
          });
        })
        .catch(err => {
          console.error('Failed to copy code:', err);
          toast({
            title: 'Error',
            description: 'Failed to copy code to clipboard',
            variant: 'destructive',
          });
        });
    }
  };

  const getStatusBadge = () => {
    if (!promotion) return null;
    
    const now = new Date();
    const endDate = promotion.end_date ? new Date(promotion.end_date) : null;
    
    if (endDate && now > endDate) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    
    return promotion.is_active ? 
      <Badge variant="success">Active</Badge> : 
      <Badge variant="destructive">Inactive</Badge>;
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Promotion Details"
        description="Loading promotion information"
        breadcrumbs={[
          { label: 'Payment & Billing', url: '/payments' },
          { label: 'Promotions', url: '/payments/promotions' },
          { label: 'Details', url: `/payments/promotions/${id}` }
        ]}
        actions={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!promotion) {
    return (
      <PageLayout
        title="Promotion Not Found"
        description="The requested promotion does not exist"
        breadcrumbs={[
          { label: 'Payment & Billing', url: '/payments' },
          { label: 'Promotions', url: '/payments/promotions' },
          { label: 'Not Found', url: `/payments/promotions/${id}` }
        ]}
        actions={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        }
      >
        <Card>
          <CardContent className="pt-6">
            <p>The promotion you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="default" 
              className="mt-4" 
              onClick={handleBack}
            >
              Return to Promotions List
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Promotion: ${promotion.name}`}
      description="View promotion details and usage statistics"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payments' },
        { label: 'Promotions', url: '/payments/promotions' },
        { label: promotion.name, url: `/payments/promotions/${id}` }
      ]}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button asChild>
            <Link to={`/payments/promotions/${id}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="usage">Usage Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{promotion.name}</CardTitle>
                    <CardDescription>{promotion.description}</CardDescription>
                  </div>
                  {getStatusBadge()}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Promotion Code</h3>
                      <div className="flex items-center">
                        <code className="relative rounded bg-muted px-[0.5rem] py-[0.4rem] font-mono text-base mr-2">
                          {promotion.code}
                        </code>
                        <Button variant="ghost" size="icon" onClick={copyCodeToClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Discount</h3>
                      <p className="flex items-center">
                        <Percent className="h-4 w-4 mr-1" />
                        <span>
                          {promotion.discount_type === 'percentage'
                            ? `${promotion.discount_value}% off`
                            : `$${promotion.discount_value.toFixed(2)} off`}
                        </span>
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Valid From</h3>
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{format(new Date(promotion.start_date), 'PPP')}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Valid Until</h3>
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {promotion.end_date 
                            ? format(new Date(promotion.end_date), 'PPP')
                            : 'No expiration date'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Usage Limit</h3>
                      <p className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>
                          {promotion.max_uses 
                            ? `${promotion.current_uses} of ${promotion.max_uses} used`
                            : 'Unlimited uses'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {format(new Date(promotion.created_at), 'PPP')}
                          {' '}
                          ({formatDistanceToNow(new Date(promotion.created_at), { addSuffix: true })})
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Analytics for this promotion code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-1">Total Uses</h3>
                      <p className="text-2xl font-bold">{promotion.current_uses}</p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-1">Remaining Uses</h3>
                      <p className="text-2xl font-bold">
                        {promotion.max_uses 
                          ? Math.max(0, promotion.max_uses - promotion.current_uses)
                          : '∞'}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-1">Success Rate</h3>
                      <p className="text-2xl font-bold">100%</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Usage Over Time</h3>
                    <div className="h-40 border rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Usage chart will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={copyCodeToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Promotion Code
              </Button>
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to={`/payments/promotions/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Promotion
                </Link>
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant={promotion.is_active ? 'destructive' : 'default'}
              >
                <Activity className="h-4 w-4 mr-2" />
                {promotion.is_active ? 'Deactivate Promotion' : 'Activate Promotion'}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Promotion Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm text-muted-foreground">ID</h3>
                <p className="font-mono text-sm">{promotion.id}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm text-muted-foreground">Status</h3>
                <div>{getStatusBadge()}</div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm text-muted-foreground">Last Update</h3>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(promotion.updated_at), { addSuffix: true })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default PromotionDetailPage;
