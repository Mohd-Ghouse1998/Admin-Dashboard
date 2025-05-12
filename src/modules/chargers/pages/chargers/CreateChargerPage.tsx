import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ChargerForm } from '@/modules/chargers/components';
import { useCharger, useCommissionGroups } from '@/modules/chargers/hooks';
import { useToast } from '@/hooks/use-toast';
import { Charger } from '@/types/charger';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';

export const CreateChargerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createCharger, isCreatingCharger } = useCharger();
  const { commissionGroups, isLoading: isLoadingCommissionGroups, error: commissionGroupsError } = useCommissionGroups();
  
  const handleCreateCharger = async (data: Charger) => {
    try {
      console.log('Submitting charger data:', data);
      await createCharger(data);
      
      toast({
        title: "Charger created",
        description: "The charger has been created successfully.",
        variant: "success",
      });
      
      // Navigate back to the charger list
      navigate('/chargers');
    } catch (error) {
      console.error('Error creating charger:', error);
      
      toast({
        title: "Error",
        description: "Failed to create charger. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout
      title="Create Charger"
      description="Register a new charging station"
    >
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/chargers">Chargers</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Create</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      {commissionGroupsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load commission groups. You can still create a charger but won't be able to assign a commission group.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="p-6">
          <ChargerForm
            onSubmit={handleCreateCharger}
            isLoading={isCreatingCharger}
            commissionGroups={commissionGroups || []}
            isLoadingCommissionGroups={isLoadingCommissionGroups}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CreateChargerPage;
