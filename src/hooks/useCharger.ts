
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargerApi } from '@/services/chargerService';
import { useValidToken } from '@/utils/authUtils';
import { 
  Charger, 
  ChargerConfig,
  RemoteStartParams, 
  RemoteStopParams, 
  ResetParams,
  ChangeAvailabilityParams, 
  SetConfigParams,
  TriggerMessageParams,
  UpdateFirmwareParams
} from '@/types/charger';
import { handleApiError } from '@/utils/apiUtils';

export function useCharger() {
  const queryClient = useQueryClient();
  const { hasValidToken, accessToken } = useValidToken();
  
  // Debug message for auth status
  useEffect(() => {
    console.log("useCharger - Auth status:", { hasValidToken, hasToken: !!accessToken });
  }, [hasValidToken, accessToken]);

  // Query for fetching all chargers
  const getChargers = () => {
    return useQuery({
      queryKey: ['chargers'],
      queryFn: async () => {
        try {
          console.log("Fetching chargers with token:", accessToken ? `${accessToken.substring(0, 5)}...` : 'no token');
          if (!hasValidToken) return [];
          return await chargerApi.getChargers(accessToken!);
        } catch (error) {
          const errorMsg = handleApiError(error, "Failed to fetch chargers", "Chargers fetch error");
          throw new Error(errorMsg);
        }
      },
      enabled: hasValidToken,
    });
  };
  
  // Query for fetching a single charger
  const getCharger = (id: string) => {
    return useQuery({
      queryKey: ['charger', id],
      queryFn: async () => {
        try {
          console.log(`Fetching charger with ID: ${id}`);
          if (!hasValidToken || !id) return null;
          return await chargerApi.getCharger(accessToken!, id);
        } catch (error) {
          handleApiError(error, `Failed to fetch charger ${id}`, "Charger fetch error");
          return null;
        }
      },
      enabled: hasValidToken && !!id,
    });
  };
  
  // Query for fetching connectors for a specific charger
  const getConnectors = (chargerId?: string) => {
    return useQuery({
      queryKey: ['connectors', chargerId],
      queryFn: async () => {
        try {
          if (!hasValidToken || !chargerId) return [];
          console.log(`Fetching connectors for charger: ${chargerId}`);
          return await chargerApi.getConnectors(accessToken!, chargerId);
        } catch (error) {
          handleApiError(error, "Failed to fetch connectors", "Connectors fetch error");
          return [];
        }
      },
      enabled: hasValidToken && !!chargerId,
    });
  };
  
  // Get charger configuration query
  const getConfigurationQuery = (chargerId: string) => {
    return useQuery({
      queryKey: ['chargerConfig', chargerId],
      queryFn: async () => {
        try {
          if (!hasValidToken) throw new Error("No valid authentication token");
          return await chargerApi.getConfiguration(accessToken!, chargerId);
        } catch (error) {
          const errorMsg = handleApiError(error, "Failed to get configuration", "Configuration error");
          throw new Error(errorMsg);
        }
      },
      enabled: false, // This query will not run automatically, must be triggered manually
    });
  };

  // Get charger configs
  const getChargerConfigs = (chargerId?: string) => {
    return useQuery({
      queryKey: ['chargerConfigs', chargerId],
      queryFn: async () => {
        try {
          if (!hasValidToken) return [];
          return await chargerApi.getChargerConfigs(accessToken!, chargerId);
        } catch (error) {
          handleApiError(error, "Failed to fetch charger configs", "Config fetch error");
          return [];
        }
      },
      enabled: hasValidToken,
    });
  };

  // Create charger mutation
  const createChargerMutation = useMutation({
    mutationFn: async (chargerData: Charger) => {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.createCharger(accessToken!, chargerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
    },
    onError: (error) => {
      handleApiError(error, "Failed to create charger", "Create charger error");
    }
  });

  // Create charger function
  const createCharger = async (chargerData: Charger) => {
    return await createChargerMutation.mutateAsync(chargerData);
  };

  // Update charger mutation
  const updateChargerMutation = useMutation({
    mutationFn: async ({ id, chargerData }: { id: string, chargerData: Charger }) => {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.updateCharger(accessToken!, id, chargerData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
      queryClient.invalidateQueries({ queryKey: ['charger', variables.id] });
    },
    onError: (error) => {
      handleApiError(error, "Failed to update charger", "Update charger error");
    }
  });

  // Update charger function
  const updateCharger = async (params: { id: string, chargerData: Charger }) => {
    return await updateChargerMutation.mutateAsync(params);
  };

  // Delete charger mutation
  const deleteChargerMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.deleteCharger(accessToken!, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
    },
    onError: (error) => {
      handleApiError(error, "Failed to delete charger", "Delete charger error");
    }
  });

  // Delete charger function
  const deleteCharger = async (id: string) => {
    return await deleteChargerMutation.mutateAsync(id);
  };

  // Create config mutation
  const createConfigMutation = useMutation({
    mutationFn: async (configData: ChargerConfig) => {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.createChargerConfig(accessToken!, configData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chargerConfigs', variables.charger] });
    },
    onError: (error) => {
      handleApiError(error, "Failed to create config", "Create config error");
    }
  });

  // Create config function
  const createConfig = async (configData: ChargerConfig) => {
    return await createConfigMutation.mutateAsync(configData);
  };

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, configData }: { id: string, configData: ChargerConfig }) => {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.updateChargerConfig(accessToken!, id, configData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chargerConfigs'] });
    },
    onError: (error) => {
      handleApiError(error, "Failed to update config", "Update config error");
    }
  });

  // Update config function
  const updateConfig = async (params: { id: string, configData: ChargerConfig }) => {
    return await updateConfigMutation.mutateAsync(params);
  };

  // Delete config mutation
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string | number) => {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.deleteChargerConfig(accessToken!, id.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargerConfigs'] });
    },
    onError: (error) => {
      handleApiError(error, "Failed to delete config", "Delete config error");
    }
  });

  // Delete config function
  const deleteConfig = async (id: string | number) => {
    return await deleteConfigMutation.mutateAsync(id);
  };

  // Remote start transaction function
  const remoteStart = async (params: RemoteStartParams) => {
    try {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.remoteStartTransaction(accessToken!, params);
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to start transaction", "Remote start error"));
    }
  };

  // Remote stop transaction function
  const remoteStop = async (params: RemoteStopParams) => {
    try {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.remoteStopTransaction(accessToken!, params);
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to stop transaction", "Remote stop error"));
    }
  };

  // Reset charger function
  const resetCharger = async (params: ResetParams) => {
    try {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.resetCharger(accessToken!, params);
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to reset charger", "Reset charger error"));
    }
  };

  // Clear cache function
  const clearCache = async (chargerId: string) => {
    try {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.clearCache(accessToken!, chargerId);
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to clear cache", "Clear cache error"));
    }
  };

  // Set configuration function
  const setConfiguration = async (params: SetConfigParams) => {
    try {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.setConfiguration(accessToken!, params);
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to set configuration", "Set configuration error"));
    }
  };

  // Change availability function
  const changeAvailability = async (params: ChangeAvailabilityParams) => {
    try {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.changeAvailability(accessToken!, params);
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to change availability", "Change availability error"));
    }
  };

  // Trigger message function
  const triggerMessage = async (params: TriggerMessageParams) => {
    try {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.triggerMessage(accessToken!, params);
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to trigger message", "Trigger message error"));
    }
  };

  // Update firmware function
  const updateFirmware = async (params: UpdateFirmwareParams) => {
    try {
      if (!hasValidToken) throw new Error("No valid authentication token");
      return await chargerApi.updateFirmware(accessToken!, params);
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to update firmware", "Update firmware error"));
    }
  };

  return {
    hasValidToken,
    getChargers,
    getCharger,
    getConnectors,
    getConfigurationQuery,
    getChargerConfigs,
    
    // Charger CRUD operations
    createCharger: (chargerData: Charger) => createChargerMutation.mutateAsync(chargerData),
    updateCharger: (params: { id: string, chargerData: Charger }) => updateChargerMutation.mutateAsync(params),
    deleteCharger: (id: string) => deleteChargerMutation.mutateAsync(id),
    isCreatingCharger: createChargerMutation.isPending,
    isUpdatingCharger: updateChargerMutation.isPending,
    isDeletingCharger: deleteChargerMutation.isPending,
    
    // Config CRUD operations  
    createConfig: (configData: ChargerConfig) => createConfigMutation.mutateAsync(configData),
    updateConfig: (params: { id: string, configData: ChargerConfig }) => updateConfigMutation.mutateAsync(params),
    deleteConfig: (id: string | number) => deleteConfigMutation.mutateAsync(id),
    isCreatingConfig: createConfigMutation.isPending,
    isUpdatingConfig: updateConfigMutation.isPending,
    isDeletingConfig: deleteConfigMutation.isPending,
    
    // Remote commands
    remoteStart,
    remoteStop,
    resetCharger,
    clearCache,
    setConfiguration,
    changeAvailability,
    triggerMessage,
    updateFirmware,
    
    // Loading states for remote commands
    isResettingCharger: false, // These would ideally be tracked with separate mutations
    isClearingCache: false,
    isSettingConfiguration: false,
    isTriggeringMessage: false,
    isUpdatingFirmware: false
  };
}
