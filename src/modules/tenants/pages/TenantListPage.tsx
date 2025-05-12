
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/modules/tenants/hooks/useTenant";
import { TenantTable } from "@/modules/tenants/components/TenantTable";
import { Tenant } from "@/modules/tenants/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TenantListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | number | null>(null);

  const {
    tenantsData,
    isLoadingTenants,
    searchQuery,
    currentPage,
    setSearchQuery,
    setCurrentPage,
    deleteTenant,
    isDeletingTenant
  } = useTenant();

  // Update search with debounce
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const handleViewTenant = (id: string | number) => {
    navigate(`/tenants/${id}`);
  };

  const handleEditTenant = (id: string | number) => {
    navigate(`/tenants/${id}/edit`);
  };

  const handleDeleteClick = (id: string | number) => {
    setSelectedTenantId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTenantId) {
      try {
        await deleteTenant(selectedTenantId);
        toast({
          title: "Tenant deleted",
          description: "The tenant has been successfully deleted.",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete tenant. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedTenantId(null);
      }
    }
  };

  const handleCreateTenant = () => {
    navigate("/tenants/create");
  };

  // Extract data from the API response
  const tenants = tenantsData?.results || [];
  const totalItems = tenantsData?.count || 0;
  const totalPages = Math.ceil(totalItems / (tenantsData?.page_size || 10));

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Tenant Management</h1>
      
      <TenantTable
        tenants={tenants}
        loading={isLoadingTenants}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        searchQuery={localSearch}
        onSearchChange={setLocalSearch}
        onPageChange={setCurrentPage}
        onViewTenant={handleViewTenant}
        onEditTenant={handleEditTenant}
        onDeleteTenant={handleDeleteClick}
        onCreateTenant={handleCreateTenant}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tenant
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingTenant}
            >
              {isDeletingTenant ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TenantListPage;
