import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, User, PaginatedResponse } from "@/modules/users/services/userService";
import { useToast } from "@/hooks/use-toast";

export interface UserFilters {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  page_size?: number;
}

export function useUser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Basic states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Get filters object for API calls
  const getFilters = useCallback((): UserFilters => {
    const filters: UserFilters = {
      search: searchQuery || undefined,
      page: currentPage,
      page_size: pageSize
    };
    
    // Add status filter if not "all"
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }
    
    return filters;
  }, [searchQuery, statusFilter, currentPage, pageSize]);
  
  // List users
  const listUsers = useCallback(() => {
    return useQuery({
      queryKey: ["users", getFilters()],
      queryFn: () => userService.getUsers()
    });
  }, [getFilters]);
  
  // Get user detail
  const getUser = useCallback((userId: string | number) => {
    return useQuery({
      queryKey: ["user", userId],
      queryFn: async () => {
        if (!userId) return null;
        
        // Validate userId to ensure it's a valid number
        const numericId = Number(userId);
        if (isNaN(numericId)) {
          console.error(`Invalid user ID: ${userId}`);
          throw new Error(`Invalid user ID: ${userId}`);
        }
        
        const response = await userService.getUser(numericId);
        return response.data; // Extract the data from the response
      },
      enabled: !!userId && userId !== "create" && !isNaN(Number(userId)) // Skip fetching for invalid IDs
    });
  }, []);
  
  // Get current user
  const getCurrentUser = useCallback(() => {
    return useQuery({
      queryKey: ["currentUser"],
      queryFn: () => userService.getCurrentUser()
    });
  }, []);
  
  // Create user mutation
  const createUser = useMutation({
    mutationFn: (userData: Partial<User>) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User created successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: ({ userId, userData }: { userId: number, userData: Partial<User> }) => {
      // Validate userId to ensure it's a valid number
      if (isNaN(userId)) {
        console.error(`Invalid user ID for update: ${userId}`);
        throw new Error(`Invalid user ID for update: ${userId}`);
      }
      return userService.updateUser(userId, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: (userId: number) => {
      // Validate userId to ensure it's a valid number
      if (isNaN(userId)) {
        console.error(`Invalid user ID for delete: ${userId}`);
        throw new Error(`Invalid user ID for delete: ${userId}`);
      }
      return userService.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  });

  // Helper to refresh data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    toast({
      title: "Data Refreshed",
      description: "User data has been refreshed.",
      variant: "default",
    });
  };

  return {
    // States
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Queries
    listUsers,
    getUser,
    getCurrentUser,
    
    // Mutations
    createUser,
    updateUser,
    deleteUser,
    
    // Helpers
    refreshData,
    getFilters
  };
}

export default useUser;
