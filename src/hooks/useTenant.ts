
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/services/tenantService';
import { useAuth } from '@/contexts/AuthContext';
import { Tenant, TenantDomain, TenantCreatePayload, TenantUpdatePayload } from '@/types/tenant';
import { toast } from '@/hooks/use-toast';

export function useTenant() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // List tenants
  const {
    data: tenantsData,
    isLoading: isLoadingTenants,
    error: tenantsError,
    refetch: refetchTenants,
  } = useQuery({
    queryKey: ['tenants', currentPage, searchQuery],
    queryFn: () => {
      if (!accessToken) return null;
      return tenantService.getTenants(accessToken, currentPage, searchQuery);
    },
    enabled: !!accessToken,
  });

  // Get tenant detail
  const getTenant = useCallback((tenantId: string | number) => {
    return useQuery({
      queryKey: ['tenant', tenantId],
      queryFn: () => {
        if (!accessToken) return null;
        return tenantService.getTenant(accessToken, tenantId);
      },
      enabled: !!accessToken && !!tenantId,
    });
  }, [accessToken]);

  // Get tenant domains
  const getTenantDomains = useCallback((tenantId?: string | number) => {
    return useQuery({
      queryKey: ['tenantDomains', tenantId],
      queryFn: () => {
        if (!accessToken) return null;
        return tenantService.getDomains(accessToken, tenantId);
      },
      enabled: !!accessToken,
    });
  }, [accessToken]);

  // Get tenant apps
  const getTenantApps = useCallback(() => {
    return useQuery({
      queryKey: ['tenantApps'],
      queryFn: () => {
        if (!accessToken) return null;
        return tenantService.getApps(accessToken);
      },
      enabled: !!accessToken,
    });
  }, [accessToken]);

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: (tenantData: TenantCreatePayload) => {
      if (!accessToken) throw new Error('No access token available');
      return tenantService.createTenant(accessToken, tenantData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tenant created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error) => {
      console.error('Error creating tenant:', error);
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive",
      });
    }
  });

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: (params: { id: string | number; data: TenantUpdatePayload }) => {
      if (!accessToken) throw new Error('No access token available');
      return tenantService.updateTenant(accessToken, params.id, params.data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Tenant updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.id] });
    },
    onError: (error) => {
      console.error('Error updating tenant:', error);
      toast({
        title: "Error",
        description: "Failed to update tenant",
        variant: "destructive",
      });
    }
  });

  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: (id: string | number) => {
      if (!accessToken) throw new Error('No access token available');
      return tenantService.deleteTenant(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tenant deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error) => {
      console.error('Error deleting tenant:', error);
      toast({
        title: "Error",
        description: "Failed to delete tenant",
        variant: "destructive",
      });
    }
  });

  // Activate tenant mutation
  const activateTenantMutation = useMutation({
    mutationFn: (id: string | number) => {
      if (!accessToken) throw new Error('No access token available');
      return tenantService.activateTenant(accessToken, id);
    },
    onSuccess: (_, id) => {
      toast({
        title: "Success",
        description: "Tenant activated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
    },
    onError: (error) => {
      console.error('Error activating tenant:', error);
      toast({
        title: "Error",
        description: "Failed to activate tenant",
        variant: "destructive",
      });
    }
  });

  // Deactivate tenant mutation
  const deactivateTenantMutation = useMutation({
    mutationFn: (id: string | number) => {
      if (!accessToken) throw new Error('No access token available');
      return tenantService.deactivateTenant(accessToken, id);
    },
    onSuccess: (_, id) => {
      toast({
        title: "Success",
        description: "Tenant deactivated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
    },
    onError: (error) => {
      console.error('Error deactivating tenant:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate tenant",
        variant: "destructive",
      });
    }
  });

  // Create domain mutation
  const createDomainMutation = useMutation({
    mutationFn: (params: { domain: string; tenantId: string | number; isPrimary?: boolean }) => {
      if (!accessToken) throw new Error('No access token available');
      return tenantService.createDomain(
        accessToken, 
        params.domain, 
        params.tenantId, 
        params.isPrimary || false
      );
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Domain created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['tenantDomains', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
    },
    onError: (error) => {
      console.error('Error creating domain:', error);
      toast({
        title: "Error",
        description: "Failed to create domain",
        variant: "destructive",
      });
    }
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: (params: { id: string | number; tenantId: string | number }) => {
      if (!accessToken) throw new Error('No access token available');
      return tenantService.deleteDomain(accessToken, params.id);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Domain deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['tenantDomains', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
    },
    onError: (error) => {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive",
      });
    }
  });

  return {
    // Queries
    tenantsData,
    isLoadingTenants,
    tenantsError,
    refetchTenants,
    getTenant,
    getTenantDomains,
    getTenantApps,
    
    // Mutations
    createTenant: createTenantMutation.mutate,
    updateTenant: updateTenantMutation.mutate,
    deleteTenant: deleteTenantMutation.mutate,
    activateTenant: activateTenantMutation.mutate,
    deactivateTenant: deactivateTenantMutation.mutate,
    createDomain: createDomainMutation.mutate,
    deleteDomain: deleteDomainMutation.mutate,
    
    // States
    searchQuery,
    currentPage,
    setSearchQuery,
    setCurrentPage,
    
    // Loading states
    isCreatingTenant: createTenantMutation.isPending,
    isUpdatingTenant: updateTenantMutation.isPending,
    isDeletingTenant: deleteTenantMutation.isPending,
    isActivatingTenant: activateTenantMutation.isPending,
    isDeactivatingTenant: deactivateTenantMutation.isPending,
    isCreatingDomain: createDomainMutation.isPending,
    isDeletingDomain: deleteDomainMutation.isPending,
  };
}
