import React, { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { ArrowLeft, Edit, Check, X } from 'lucide-react';
import { getTariff, Tariff, activateTariff, deactivateTariff } from '@/services/api/tariffsApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const TariffDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchTariff = async () => {
      setIsLoading(true);
      try {
        const response = await getTariff(parseInt(id));
        setTariff(response.data);
      } catch (error) {
        console.error('Error fetching tariff:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tariff details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTariff();
  }, [id, toast]);

  const handleActivate = async () => {
    if (!id || !tariff) return;
    
    setIsUpdatingStatus(true);
    try {
      await activateTariff(parseInt(id));
      setTariff({
        ...tariff,
        status: 'active'
      });
      toast({
        title: 'Success',
        description: 'Tariff activated successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error activating tariff:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate tariff. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeactivate = async () => {
    if (!id || !tariff) return;
    
    setIsUpdatingStatus(true);
    try {
      await deactivateTariff(parseInt(id));
      setTariff({
        ...tariff,
        status: 'inactive'
      });
      toast({
        title: 'Success',
        description: 'Tariff deactivated successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error deactivating tariff:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate tariff. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    
    switch (status) {
      case 'active':
        variant = 'success';
        break;
      case 'inactive':
        variant = 'secondary';
        break;
      case 'draft':
        variant = 'outline';
        break;
      default:
        variant = 'default';
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Tariff Details"
        description="Loading tariff information"
        backButton
        backTo="/payment/tariffs"
      >
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </PageLayout>
    );
  }

  if (!tariff) {
    return (
      <PageLayout
        title="Tariff Not Found"
        description="The requested tariff does not exist"
        backButton
        backTo="/payment/tariffs"
      >
        <Card>
          <CardContent className="pt-6">
            <p>The tariff you're looking for could not be found.</p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={tariff.name}
      description={tariff.description}
      backButton
      backTo="/payment/tariffs"
      actions={
        <div className="flex space-x-2">
          {tariff.status !== 'active' && (
            <Button 
              variant="outline" 
              onClick={handleActivate}
              disabled={isUpdatingStatus}
            >
              <Check className="mr-2 h-4 w-4" />
              Activate Tariff
            </Button>
          )}
          {tariff.status === 'active' && (
            <Button 
              variant="outline" 
              onClick={handleDeactivate}
              disabled={isUpdatingStatus}
            >
              <X className="mr-2 h-4 w-4" />
              Deactivate Tariff
            </Button>
          )}
          <Button onClick={() => navigate(`/payment/tariffs/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Tariff
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        {/* Tariff Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tariff Summary</CardTitle>
            <CardDescription>Basic tariff information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div>{getStatusBadge(tariff.status)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Base Price</p>
                <p className="text-lg font-medium">{formatCurrency(tariff.base_price)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Price per kWh</p>
                <p className="text-lg font-medium">{formatCurrency(tariff.price_per_kwh)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Price per Minute</p>
                <p className="text-lg font-medium">{formatCurrency(tariff.price_per_minute)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Price per Session</p>
                <p className="text-lg font-medium">{formatCurrency(tariff.price_per_session)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tax Percentage</p>
                <p className="text-lg font-medium">{tariff.tax_percentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle>Time Restrictions</CardTitle>
            <CardDescription>Time-based pricing multipliers</CardDescription>
          </CardHeader>
          <CardContent>
            {tariff.time_restrictions && tariff.time_restrictions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day of Week</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Price Multiplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tariff.time_restrictions.map((restriction, index) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize">{restriction.day_of_week}</TableCell>
                      <TableCell>{restriction.start_time}</TableCell>
                      <TableCell>{restriction.end_time}</TableCell>
                      <TableCell>
                        {restriction.multiplier}x 
                        {restriction.multiplier > 1 && 
                          <Badge variant="secondary" className="ml-2">
                            Peak
                          </Badge>
                        }
                        {restriction.multiplier < 1 && 
                          <Badge variant="success" className="ml-2">
                            Off-Peak
                          </Badge>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No time restrictions for this tariff.</p>
            )}
          </CardContent>
        </Card>

        {/* User Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle>User Type Restrictions</CardTitle>
            <CardDescription>User type-based pricing multipliers</CardDescription>
          </CardHeader>
          <CardContent>
            {tariff.user_restrictions && tariff.user_restrictions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Type</TableHead>
                    <TableHead>Price Multiplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tariff.user_restrictions.map((restriction, index) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize">{restriction.user_type}</TableCell>
                      <TableCell>
                        {restriction.multiplier}x
                        {restriction.multiplier < 1 && 
                          <Badge variant="success" className="ml-2">
                            Discount
                          </Badge>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No user type restrictions for this tariff.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TariffDetailPage;
