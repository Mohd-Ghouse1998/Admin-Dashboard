
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/modules/tenants/hooks/useTenant";
import { TenantForm } from "@/modules/tenants/components/TenantForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { TenantCreatePayload } from "@/modules/tenants/types";

const CreateTenantPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    getTenantApps,
    createTenant,
    isCreatingTenant
  } = useTenant();
  
  const {
    data: appsData,
    isLoading: isLoadingApps
  } = getTenantApps();

  const handleSubmit = async (data: TenantCreatePayload) => {
    try {
      await createTenant(data, {
        onSuccess: (result) => {
          toast({
            title: "Success",
            description: "Tenant created successfully.",
            variant: "success",
          });
          
          // Navigate based on whether we have a result with an ID
          if (result && result.id) {
            navigate(`/tenants/${result.id}`);
          } else {
            navigate('/tenants');
          }
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tenant. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingApps) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate("/tenants")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tenants
          </Button>
          <Skeleton className="h-8 w-60" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-md" />
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/tenants")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tenants
        </Button>
        <h1 className="text-2xl font-bold ml-4">Create New Tenant</h1>
      </div>
      
      <TenantForm
        availableApps={appsData?.results || []}
        onSubmit={handleSubmit}
        isSubmitting={isCreatingTenant}
      />
    </div>
  );
};

export default CreateTenantPage;
