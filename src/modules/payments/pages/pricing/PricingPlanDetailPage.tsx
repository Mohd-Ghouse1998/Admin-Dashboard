import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { UnfoldCard } from '@/components/ui/unfold-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, ArrowLeft, Trash2, BarChart3, Users } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';

// Mock data for a single pricing plan
const getMockPlan = (id: string) => ({
  id,
  name: id === '1' ? 'Basic' : id === '2' ? 'Professional' : id === '3' ? 'Enterprise' : 'Custom',
  description: 'Comprehensive plan for EV charging infrastructure management',
  price: id === '1' ? 49 : id === '2' ? 99 : id === '3' ? 249 : null,
  billingCycle: 'monthly',
  status: 'active',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-04-20T14:30:00Z',
  features: [
    id === '1' ? 'Up to 5 charging stations' : id === '2' ? 'Up to 20 charging stations' : 'Unlimited charging stations',
    id === '1' ? 'Basic analytics' : id === '2' ? 'Advanced analytics' : 'Real-time analytics & reporting',
    id === '1' ? 'Standard support' : id === '2' ? 'Priority support' : '24/7 premium support',
    'Automated billing',
    'Multiple admin users',
    'API access',
    id === '3' || id === '4' ? 'Custom integration options' : null,
    id === '3' || id === '4' ? 'Dedicated account manager' : null,
  ].filter(Boolean),
  subscribers: [
    { id: '101', name: 'Acme Electric', email: 'admin@acmeelectric.com', subscriptionDate: '2025-02-01' },
    { id: '102', name: 'EcoCharge Inc.', email: 'contact@ecocharge.com', subscriptionDate: '2025-02-15' },
    { id: '103', name: 'Future Energy', email: 'info@futureenergy.org', subscriptionDate: '2025-03-01' },
  ],
  usage: {
    totalRevenue: id === '1' ? 980 : id === '2' ? 2970 : id === '3' ? 1245 : 5000,
    activeSubscribers: id === '1' ? 10 : id === '2' ? 15 : id === '3' ? 5 : 2,
    averageUsageDuration: id === '1' ? 3 : id === '2' ? 5 : id === '3' ? 8 : 12,
    churnRate: id === '1' ? 2.5 : id === '2' ? 1.8 : id === '3' ? 0.5 : 0,
  },
  revenueHistory: [
    { month: 'Jan', revenue: id === '1' ? 150 : id === '2' ? 300 : id === '3' ? 249 : 500 },
    { month: 'Feb', revenue: id === '1' ? 200 : id === '2' ? 400 : id === '3' ? 498 : 500 },
    { month: 'Mar', revenue: id === '1' ? 250 : id === '2' ? 490 : id === '3' ? 498 : 1000 },
    { month: 'Apr', revenue: id === '1' ? 380 : id === '2' ? 780 : id === '3' ? 0 : 1000 },
    { month: 'May', revenue: id === '1' ? 0 : id === '2' ? 1000 : id === '3' ? 0 : 2000 },
  ]
});

const PricingPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plan = getMockPlan(id || '1');

  const subscriberColumns = [
    { header: 'Client', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { 
      header: 'Subscription Date', 
      accessorKey: 'subscriptionDate',
      cell: (row: any) => {
        const date = new Date(row.subscriptionDate);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    },
    { 
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            View
          </Button>
        </div>
      )
    }
  ];

  const handleEdit = () => {
    navigate(`/payments/plans/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/payments/plans');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageLayout
      title={`${plan.name} Plan`}
      description="Plan details and subscriber information"
      breadcrumb={[
        { label: 'Payment & Billing', href: '/payments' },
        { label: 'Pricing Plans', href: '/payments/plans' },
        { label: plan.name, href: `/payments/plans/${id}` }
      ]}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Plan
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard 
            title="Total Revenue" 
            value={`$${plan.usage.totalRevenue.toLocaleString()}`}
            icon={<BarChart3 className="h-4 w-4" />}
            description="Lifetime value"
            trend={{ value: 12.5, label: 'vs last month', direction: 'up' }}
          />
          <StatCard 
            title="Active Subscribers" 
            value={plan.usage.activeSubscribers.toString()}
            icon={<Users className="h-4 w-4" />}
            description="Current customers"
            trend={{ value: 2.1, label: 'vs last month', direction: 'up' }}
          />
          <StatCard 
            title="Avg. Subscription Length" 
            value={`${plan.usage.averageUsageDuration} months`}
            description="Customer retention"
            trend={{ value: 0.3, label: 'vs last month', direction: 'up' }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Plan Information</CardTitle>
              <CardDescription>Detailed information about this pricing plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">
                    <Badge variant={plan.status === 'active' ? 'success' : 'default'}>
                      {plan.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="mt-1 text-lg font-medium">
                    {plan.price ? `$${plan.price}/${plan.billingCycle}` : 'Contact Sales'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="mt-1">{formatDate(plan.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="mt-1">{formatDate(plan.updatedAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1">{plan.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Features</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Subscription metrics and usage information</CardDescription>
            </CardHeader>
            <CardContent>
              <UnfoldCard title="Revenue History" defaultOpen={true}>
                <div className="h-60 mt-2">
                  {/* 
                  This would ideally be a chart showing revenue over time.
                  For the sake of the demo, just display the revenue data in text format.
                  */}
                  <div className="grid grid-cols-2 gap-2">
                    {plan.revenueHistory.map((item, index) => (
                      <div key={index} className="flex justify-between border-b pb-2">
                        <span>{item.month} 2025:</span>
                        <span className="font-medium">${item.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </UnfoldCard>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscribers">
          <TabsList>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="subscribers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan Subscribers</CardTitle>
                <CardDescription>Clients currently subscribed to this plan</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={subscriberColumns}
                  data={plan.subscribers}
                  pagination
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan Settings</CardTitle>
                <CardDescription>Configure additional settings for this plan</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Advanced settings configuration would be available here, such as 
                  customizing trial periods, setting up promotional rates, 
                  or configuring feature toggles specific to this plan.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default PricingPlanDetailPage;
