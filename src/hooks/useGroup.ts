
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GroupCreatePayload, GroupUpdatePayload, GroupUsersUpdatePayload } from '@/types/group';

export function useGroup() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get groups with pagination
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    error: groupsError,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ['groups', currentPage, searchQuery],
    queryFn: () => {
      if (!accessToken) return null;
      return groupService.getGroups(accessToken, currentPage);
    },
    enabled: !!accessToken,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData: GroupCreatePayload) => {
      if (!accessToken) throw new Error('No access token available');
      return groupService.createGroup(accessToken, groupData);
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
    mutationFn: (params: { groupId: number; data: GroupUpdatePayload }) => {
      if (!accessToken) throw new Error('No access token available');
      return groupService.updateGroup(accessToken, params.groupId, params.data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Group updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
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
    mutationFn: (groupId: number) => {
      if (!accessToken) throw new Error('No access token available');
      return groupService.deleteGroup(accessToken, groupId);
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

  // Update group users mutation
  const updateGroupUsersMutation = useMutation({
    mutationFn: (params: { groupId: number; data: GroupUsersUpdatePayload }) => {
      if (!accessToken) throw new Error('No access token available');
      return groupService.updateGroupUsers(accessToken, params.groupId, params.data);
    },
    onSuccess: (_, variables) => {
      const action = variables.data.action === 'add' ? 'added to' : 'removed from';
      toast({
        title: "Success",
        description: `Users ${action} group successfully`,
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['groupUsers', variables.groupId] });
    },
    onError: (error) => {
      console.error('Error updating group users:', error);
      toast({
        title: "Error",
        description: "Failed to update group users",
        variant: "destructive",
      });
    }
  });

  // Get specific group
  const getGroup = useCallback((groupId: number) => {
    return useQuery({
      queryKey: ['group', groupId],
      queryFn: () => {
        if (!accessToken || !groupId) return null;
        return groupService.getGroup(accessToken, groupId);
      },
      enabled: !!accessToken && !!groupId,
    });
  }, [accessToken]);

  // Get group users
  const getGroupUsers = useCallback((groupId: number) => {
    return useQuery({
      queryKey: ['groupUsers', groupId],
      queryFn: () => {
        if (!accessToken || !groupId) return null;
        return groupService.getGroupUsers(accessToken, groupId);
      },
      enabled: !!accessToken && !!groupId,
    });
  }, [accessToken]);

  return {
    // Pagination
    currentPage,
    pageSize,
    searchQuery,
    setCurrentPage,
    setPageSize,
    setSearchQuery,
    
    // Data
    groupsData,
    isLoadingGroups,
    groupsError,
    
    // Actions
    refetchGroups,
    getGroup,
    getGroupUsers,
    createGroup: createGroupMutation.mutate,
    updateGroup: updateGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    updateGroupUsers: updateGroupUsersMutation.mutate,
    
    // Loading states
    isCreatingGroup: createGroupMutation.isPending,
    isUpdatingGroup: updateGroupMutation.isPending,
    isDeletingGroup: deleteGroupMutation.isPending,
    isUpdatingGroupUsers: updateGroupUsersMutation.isPending,
  };
}
