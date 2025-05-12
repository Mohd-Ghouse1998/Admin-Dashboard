import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/modules/users/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { User, UserFilters, UserCreatePayload, UserUpdatePayload, ProfileUpdatePayload } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useUser() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'superuser' | 'staff' | 'user'>('all');
  const [sortField, setSortField] = useState<string>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Analytics states
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [newUserCount, setNewUserCount] = useState(0);

  // Get filters object for API calls
  const getFilters = useCallback((): UserFilters => {
    return {
      search: searchQuery || undefined,
      status: statusFilter,
      role: roleFilter,
      sortField: sortField,
      sortDirection: sortDirection,
      page: currentPage,
      pageSize: pageSize
    };
  }, [searchQuery, statusFilter, roleFilter, sortField, sortDirection, currentPage, pageSize]);

  // List users with filters
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users', getFilters()],
    queryFn: () => {
      if (!accessToken) return null;
      return userService.getUsers(accessToken, getFilters());
    },
    enabled: !!accessToken,
  });
  
  // Get user analytics
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: () => {
      if (!accessToken) return null;
      return userService.getUserAnalytics(accessToken);
    },
    enabled: !!accessToken,
  });
  
  // Update analytics when data changes
  useEffect(() => {
    if (analyticsData) {
      // Extract counts from the new analytics data structure
      const stats = analyticsData.stats || { total_users: 0, active_users: 0 };
      setTotalUserCount(stats.total_users || analyticsData.count || 0);
      setActiveUserCount(stats.active_users || 0);
      // We don't have new users data in our fallback structure, so default to 0
      setNewUserCount(0);
    }
  }, [analyticsData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, pageSize]);
  
  // Handle sort changes
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };
  
  // Export users
  const exportUsers = async () => {
    try {
      if (!accessToken) throw new Error('No access token available');
      const blob = await userService.exportUsers(accessToken, getFilters());
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: "Export Complete",
        description: "Users data has been exported successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export users. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Refresh data
  const refreshData = () => {
    refetchUsers();
    refetchAnalytics();
    toast({
      title: "Data Refreshed",
      description: "User data has been refreshed.",
      variant: "default",
    });
  };

  // Get user detail
  const getUser = useCallback((userId: string | number) => {
    return useQuery({
      queryKey: ['user', userId],
      queryFn: () => {
        if (!accessToken || !userId) return null;
        return userService.getUser(accessToken, userId);
      },
      enabled: !!accessToken && !!userId && userId !== 'create', // Skip fetching for 'create' route
    });
  }, [accessToken]);
  
  // Get current user
  const getCurrentUser = useCallback(() => {
    return useQuery({
      queryKey: ['currentUser'],
      queryFn: () => {
        if (!accessToken) return null;
        return userService.getCurrentUser(accessToken);
      },
      enabled: !!accessToken,
    });
  }, [accessToken]);

  // List profiles
  const getProfiles = useCallback((page?: number) => {
    return useQuery({
      queryKey: ['profiles', page],
      queryFn: () => {
        if (!accessToken) return null;
        return userService.getProfiles(accessToken, page);
      },
      enabled: !!accessToken,
    });
  }, [accessToken]);

  // Get profile detail
  const getProfile = useCallback((profileId: string | number) => {
    return useQuery({
      queryKey: ['profile', profileId],
      queryFn: () => {
        if (!accessToken) return null;
        return userService.getProfile(accessToken, profileId);
      },
      enabled: !!accessToken && !!profileId,
    });
  }, [accessToken]);

  // Get user profile
  const getUserProfile = useCallback(() => {
    return useQuery({
      queryKey: ['userProfile'],
      queryFn: () => {
        if (!accessToken) return null;
        return userService.getUserProfile(accessToken);
      },
      enabled: !!accessToken,
    });
  }, [accessToken]);

  // List groups
  const getGroups = useCallback((page?: number) => {
    return useQuery({
      queryKey: ['groups', page],
      queryFn: () => {
        if (!accessToken) return null;
        return userService.getGroups(accessToken, page);
      },
      enabled: !!accessToken,
    });
  }, [accessToken]);

  // Get group detail
  const getGroup = useCallback((groupId: number) => {
    return useQuery({
      queryKey: ['group', groupId],
      queryFn: () => {
        if (!accessToken) return null;
        return userService.getGroup(accessToken, groupId);
      },
      enabled: !!accessToken && !!groupId,
    });
  }, [accessToken]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: UserCreatePayload) => {
      console.log("Creating user with:", userData);
      if (!accessToken) throw new Error('No access token available');
      return userService.createUser(accessToken, userData);
    },
    onSuccess: (data) => {
      console.log("User created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error("Error in mutation:", error);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (params: { id: string | number; data: UserUpdatePayload }) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.updateUser(accessToken, params.id, params.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string | number) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.deleteUser(accessToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (params: { id: string | number; data: ProfileUpdatePayload }) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.updateProfile(accessToken, params.id, params.data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Update user profile mutation
  const updateUserProfileMutation = useMutation({
    mutationFn: (profileData: ProfileUpdatePayload) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.updateUserProfile(accessToken, profileData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Update phone mutation
  const updatePhoneMutation = useMutation({
    mutationFn: (phone: string) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.updatePhone(accessToken, phone);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Phone number update initiated. Please verify with OTP.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error('Error updating phone:', error);
      toast({
        title: "Error",
        description: "Failed to update phone number",
        variant: "destructive",
      });
    }
  });

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: (email: string) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.updateEmail(accessToken, email);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email update initiated. Please verify with OTP.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    }
  });

  // Verify update mutation
  const verifyUpdateMutation = useMutation({
    mutationFn: (params: { otp: string; type: 'phone' | 'email' }) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.verifyUpdate(accessToken, params.otp, params.type);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `${variables.type === 'phone' ? 'Phone number' : 'Email'} updated successfully`,
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('Error verifying update:', error);
      toast({
        title: "Error",
        description: "Failed to verify update. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData: any) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.createGroup(accessToken, groupData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: (params: { id: number; data: any }) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.updateGroup(accessToken, params.id, params.data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Group updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.id] });
    },
    onError: (error) => {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => {
      if (!accessToken) throw new Error('No access token available');
      return userService.deleteGroup(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    }
  });

  return {
    // Queries
    usersData,
    isLoadingUsers,
    usersError,
    refetchUsers,
    getUser,
    getCurrentUser,
    getProfiles,
    getProfile,
    getUserProfile,
    getGroups,
    getGroup,
    
    // Mutations
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    updateUserProfile: updateUserProfileMutation.mutate,
    updatePhone: updatePhoneMutation.mutate,
    updateEmail: updateEmailMutation.mutate,
    verifyUpdate: verifyUpdateMutation.mutate,
    createGroup: createGroupMutation.mutate,
    updateGroup: updateGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    
    // Filter states
    searchQuery,
    statusFilter,
    roleFilter,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    
    // Filter setters
    setSearchQuery,
    setStatusFilter,
    setRoleFilter,
    handleSortChange,
    setCurrentPage,
    setPageSize,
    
    // Actions
    exportUsers,
    refreshData,
    
    // Analytics
    totalUserCount,
    activeUserCount,
    newUserCount,
    
    // Loading states
    isLoadingAnalytics,
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingUserProfile: updateUserProfileMutation.isPending,
    isUpdatingPhone: updatePhoneMutation.isPending,
    isUpdatingEmail: updateEmailMutation.isPending,
    isVerifyingUpdate: verifyUpdateMutation.isPending,
    isCreatingGroup: createGroupMutation.isPending,
    isUpdatingGroup: updateGroupMutation.isPending,
    isDeletingGroup: deleteGroupMutation.isPending,
  };
}
