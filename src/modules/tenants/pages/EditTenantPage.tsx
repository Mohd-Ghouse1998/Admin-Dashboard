
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTenant } from "@/modules/tenants/hooks/useTenant";
import { TenantForm } from "@/modules/tenants/components/TenantForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Tenant, TenantUpdatePayload } from "@/modules/tenants/types";

const EditTenantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    getTenant, 
    getTenantApps,
    updateTenant,
    isUpdatingTenant
  } = useTenant();
  
  const tenantId = id as string;
  
  const { 
    data: tenant, 
    isLoading: isLoadingTenant,
    error: tenantError
  } = getTenant(tenantId);
  
  const {
    data: appsData,
    isLoading: isLoadingApps
  } = getTenantApps();

  // Handle errors
  useEffect(() => {
    if (tenantError) {
      toast({
        title: "Error",
        description: "Failed to load tenant. Please try again.",
        variant: "destructive",
      });
    }
  }, [tenantError, toast]);

  const handleSubmit = async (data: TenantUpdatePayload) => {
    try {
      await updateTenant({ id: tenantId, data });
      toast({
        title: "Success",
        description: "Tenant updated successfully.",
        variant: "success",
      });
      navigate(`/tenants/${tenantId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tenant. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingTenant || isLoadingApps) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate(`/tenants/${tenantId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tenant
          </Button>
          <Skeleton className="h-8 w-60" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-md" />
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/tenants")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tenants
          </Button>
        </div>
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Tenant not found or you don't have permission to edit it.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(`/tenants/${tenantId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tenant
        </Button>
        <h1 className="text-2xl font-bold ml-4">Edit Tenant: {tenant.name}</h1>
      </div>
      
      <TenantForm
        tenant={tenant}
        availableApps={appsData?.results || []}
        onSubmit={handleSubmit}
        isSubmitting={isUpdatingTenant}
        isEdit={true}
      />
    </div>
  );
};

export default EditTenantPage;
