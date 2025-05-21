import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import profileService, { UserProfile, PaginatedResponse } from "@/modules/users/services/profileService";
import { useToast } from "@/hooks/use-toast";

export function useProfiles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Basic states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // List profiles
  const listProfiles = useCallback(() => {
    return useQuery({
      queryKey: ["profiles"],
      queryFn: async () => {
        const response = await profileService.getProfiles();
        return response.data;
      },
    });
  }, []);
  
  // Get profile detail
  const getProfile = useCallback((profileId: string | number) => {
    return useQuery({
      queryKey: ["profile", profileId],
      queryFn: async () => {
        if (!profileId) return null;
        
        // Validate profileId to ensure it's a valid number
        const numericId = Number(profileId);
        if (isNaN(numericId)) {
          console.error(`Invalid profile ID: ${profileId}`);
          throw new Error(`Invalid profile ID: ${profileId}`);
        }
        
        try {
          const response = await profileService.getProfile(numericId);
          console.log('Profile API response:', response); // Debug the actual response
          
          // Handle different response formats - API might return the profile directly
          // or nested in a data property
          return response;
        } catch (error) {
          console.error('Error in getProfile:', error);
          throw error;
        }
      },
      enabled: !!profileId && profileId !== "create" && !isNaN(Number(profileId)) // Skip fetching for invalid IDs
    });
  }, []);
  
  // Get current user profile
  const getCurrentUserProfile = useCallback(() => {
    return useQuery({
      queryKey: ["currentUserProfile"],
      queryFn: async () => {
        const response = await profileService.getCurrentUserProfile();
        return response.data;
      }
    });
  }, []);
  
  // Create profile mutation
  const createProfile = useMutation({
    mutationFn: (profileData: Partial<UserProfile>) => profileService.createProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Success",
        description: "Profile created successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create profile",
        variant: "destructive",
      });
    }
  });
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: ({ profileId, profileData }: { profileId: number, profileData: Partial<UserProfile> }) => {
      // Validate profileId to ensure it's a valid number
      if (isNaN(profileId)) {
        console.error(`Invalid profile ID for update: ${profileId}`);
        throw new Error(`Invalid profile ID for update: ${profileId}`);
      }
      return profileService.updateProfile(profileId, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });
  
  // Update current user profile mutation
  const updateCurrentUserProfile = useMutation({
    mutationFn: (profileData: Partial<UserProfile>) => 
      profileService.updateCurrentUserProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast({
        title: "Success",
        description: "Your profile updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update your profile",
        variant: "destructive",
      });
    }
  });
  
  // Delete profile mutation
  const deleteProfile = useMutation({
    mutationFn: (profileId: number) => {
      // Validate profileId to ensure it's a valid number
      if (isNaN(profileId)) {
        console.error(`Invalid profile ID for delete: ${profileId}`);
        throw new Error(`Invalid profile ID for delete: ${profileId}`);
      }
      return profileService.deleteProfile(profileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Success",
        description: "Profile deleted successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete profile",
        variant: "destructive",
      });
    }
  });
  
  // Helper to refresh data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
  };
  
  return {
    // States
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Queries
    listProfiles,
    getProfile,
    getCurrentUserProfile,
    
    // Mutations
    createProfile,
    updateProfile,
    updateCurrentUserProfile,
    deleteProfile,
    
    // Helpers
    refreshData,
  };
}
