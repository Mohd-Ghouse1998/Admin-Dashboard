
import React, { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { PermissionTable } from "@/components/permission/PermissionTable";
import { Helmet } from "react-helmet-async";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const PermissionManagementPage = () => {
  const {
    permissionsData,
    isLoadingPermissions,
    permissionsError,
    appLabelFilter,
    modelFilter,
    searchQuery,
    currentPage,
    setAppLabelFilter,
    setModelFilter,
    setSearchQuery,
    setCurrentPage,
    refetchPermissions,
    resetPage,
  } = usePermission();
  
  const [uniqueAppLabels, setUniqueAppLabels] = useState<string[]>([]);
  const [uniqueModels, setUniqueModels] = useState<string[]>([]);
  
  // Extract unique app labels and models for filters
  useEffect(() => {
    if (permissionsData?.results) {
      const appLabels = Array.from(new Set(permissionsData.results.map(p => p.content_type_app)));
      const models = Array.from(new Set(permissionsData.results.map(p => p.content_type_model)));
      
      setUniqueAppLabels(appLabels.sort());
      setUniqueModels(models.sort());
    }
  }, [permissionsData]);
  
  // Reset page when filters change
  useEffect(() => {
    resetPage();
  }, [appLabelFilter, modelFilter, searchQuery, resetPage]);
  
  const renderErrorMessage = () => {
    if (!permissionsError) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load permissions data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <>
      <Helmet>
        <title>Permission Management | Admin Portal</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Permission Management</h1>
        
        {renderErrorMessage()}
        
        <PermissionTable
          permissions={permissionsData?.results || []}
          isLoading={isLoadingPermissions}
          appLabelFilter={appLabelFilter}
          modelFilter={modelFilter}
          searchQuery={searchQuery}
          currentPage={currentPage}
          totalPages={Math.ceil((permissionsData?.count || 0) / 10)}
          totalItems={permissionsData?.count || 0}
          onSearchChange={setSearchQuery}
          onAppLabelChange={setAppLabelFilter}
          onModelChange={setModelFilter}
          onPageChange={setCurrentPage}
          onRefreshPermissions={refetchPermissions}
          uniqueAppLabels={uniqueAppLabels}
          uniqueModels={uniqueModels}
        />
      </div>
    </>
  );
};

export default PermissionManagementPage;
