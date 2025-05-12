import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ChargerForm } from '@/modules/chargers/components';
import { useCharger, useCommissionGroups } from '@/modules/chargers/hooks';
import { useToast } from '@/hooks/use-toast';
import { Charger } from '@/types/charger';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';

export const EditChargerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { getCharger, updateCharger, isUpdatingCharger } = useCharger();
  const { data: charger, isLoading, error } = getCharger(id || '');
  const { commissionGroups, isLoading: isLoadingCommissionGroups } = useCommissionGroups();
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load charger data. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  const handleUpdateCharger = async (data: Charger) => {
    try {
      if (!id) throw new Error("Charger ID is required");
      
      await updateCharger({ id, chargerData: data });
      
      toast({
        title: "Charger updated",
        description: "The charger has been updated successfully.",
      });
      
      // Navigate back to the charger details
      navigate(`/chargers/${id}`);
    } catch (error) {
      console.error('Error updating charger:', error);
      
      toast({
        title: "Error",
        description: "Failed to update charger. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <PageLayout
        title="Edit Charger"
        description="Update charger details"
      >
        <Breadcrumb className="mb-4">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/chargers">Chargers</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }
  
  if (!charger) {
    return (
      <PageLayout
        title="Edit Charger"
        description="Update charger details"
      >
        <Breadcrumb className="mb-4">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/chargers">Chargers</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Charger not found</h3>
              <p className="text-gray-500 mt-2">
                The requested charger could not be found or you don't have permission to edit it.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Edit Charger: ${charger.name}`}
      description="Update charger details"
    >
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/chargers">Chargers</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/chargers/${id}`}>{charger.name || charger.charger_id}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Edit</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Card>
        <CardContent className="p-6">
          <ChargerForm
            initialData={charger}
            onSubmit={handleUpdateCharger}
            isLoading={isUpdatingCharger}
            commissionGroups={commissionGroups || []}
            isLoadingCommissionGroups={isLoadingCommissionGroups}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default EditChargerPage;
