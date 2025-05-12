import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';
import { UnfoldCard } from '@/components/ui/unfold-card';

// Mock data for pricing plans
const mockPlans = [
  {
    id: '1',
    name: 'Basic',
    description: 'For small networks with minimal charging stations',
    price: 49,
    billingCycle: 'monthly',
    popular: false,
    features: [
      'Up to 5 charging stations',
      'Basic analytics',
      'Standard support',
      'Manual billing',
      'Single admin user'
    ]
  },
  {
    id: '2',
    name: 'Professional',
    description: 'For growing networks with multiple charging stations',
    price: 99,
    billingCycle: 'monthly',
    popular: true,
    features: [
      'Up to 20 charging stations',
      'Advanced analytics',
      'Priority support',
      'Automated billing',
      'Multiple admin users',
      'Custom branding',
      'API access'
    ]
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large networks with advanced requirements',
    price: 249,
    billingCycle: 'monthly',
    popular: false,
    features: [
      'Unlimited charging stations',
      'Real-time analytics & reporting',
      '24/7 premium support',
      'Advanced billing options',
      'Unlimited users',
      'White-label solution',
      'Full API access',
      'Dedicated account manager',
      'Custom integration options'
    ]
  },
  {
    id: '4',
    name: 'Custom',
    description: 'Tailored solution for specific business needs',
    price: null,
    billingCycle: 'custom',
    popular: false,
    features: [
      'Custom number of charging stations',
      'Customized feature set',
      'Dedicated support team',
      'Custom billing integration',
      'Custom user management',
      'Dedicated infrastructure',
      'Custom development options'
    ]
  }
];

const PricingPlansPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const handleCreatePlan = () => {
    navigate('/payment/plans/create');
  };

  const handleViewPlan = (id: string) => {
    navigate(`/payment/plans/${id}`);
  };

  return (
    <PageLayout
      title="Pricing Plans"
      description="Manage your EV charging pricing plans"
      actions={
        <Button onClick={handleCreatePlan}>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      }
    >
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Plans
            </Button>
            <Button 
              variant={filter === 'active' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button 
              variant={filter === 'archived' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('archived')}
            >
              Archived
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden ${plan.popular ? 'border-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-bl-lg rounded-tr-lg rounded-br-none rounded-tl-none">
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {plan.price ? (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="ml-1 text-gray-500">/{plan.billingCycle}</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">Contact Sales</div>
                  )}
                </div>
                <UnfoldCard 
                  title="Features" 
                  defaultOpen={false}
                  className="mb-4"
                >
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex">
                        <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </UnfoldCard>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleViewPlan(plan.id)}
                >
                  View Details
                </Button>
                <Button>Select Plan</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default PricingPlansPage;
