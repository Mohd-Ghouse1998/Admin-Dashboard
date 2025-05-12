
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Group, GroupResponse, GroupCreatePayload, GroupUpdatePayload, GroupUsersUpdatePayload } from "@/types/group";
import { useToast } from "@/hooks/use-toast";

export const useGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch groups with filtering and pagination
  const fetchGroups = async () => {
    const params: Record<string, any> = {
      page: currentPage,
      page_size: 10,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    const response = await axios.get("/api/users/groups/", { params });
    return response.data;
  };

  // Get individual group by ID
  const getGroup = (groupId: number) => {
    return useQuery({
      queryKey: ["group", groupId],
      queryFn: async () => {
        if (!groupId) return null;
        const response = await axios.get(`/api/users/groups/${groupId}/`);
        return response.data;
      },
      enabled: !!groupId,
    });
  };

  // Get users in a group
  const getGroupUsers = (groupId: number) => {
    return useQuery({
      queryKey: ["groupUsers", groupId],
      queryFn: async () => {
        if (!groupId) return null;
        const response = await axios.get(`/api/users/groups/${groupId}/users/`);
        return response.data;
      },
      enabled: !!groupId,
    });
  };

  // Fetch groups data
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    error: groupsError,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ["groups", currentPage, searchQuery],
    queryFn: fetchGroups,
  });

  // Create group mutation
  const { mutateAsync: createGroup, isPending: isCreatingGroup } = useMutation({
    mutationFn: async (groupData: GroupCreatePayload) => {
      const response = await axios.post("/api/users/groups/", groupData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  // Update group mutation
  const { mutateAsync: updateGroup, isPending: isUpdatingGroup } = useMutation({
    mutationFn: async ({
      groupId,
      data,
    }: {
      groupId: number;
      data: GroupUpdatePayload;
    }) => {
      const response = await axios.put(`/api/users/groups/${groupId}/`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
  });

  // Delete group mutation
  const { mutateAsync: deleteGroup, isPending: isDeletingGroup } = useMutation({
    mutationFn: async (groupId: number) => {
      await axios.delete(`/api/users/groups/${groupId}/`);
      return groupId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  // Update group users
  const { mutateAsync: updateGroupUsers, isPending: isUpdatingGroupUsers } = useMutation({
    mutationFn: async ({
      groupId,
      data,
    }: {
      groupId: number;
      data: GroupUsersUpdatePayload;
    }) => {
      const response = await axios.post(`/api/users/groups/${groupId}/users/`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupUsers", variables.groupId] });
    },
  });

  return {
    // Data
    groupsData,
    
    // Loading states
    isLoadingGroups,
    isCreatingGroup,
    isUpdatingGroup,
    isDeletingGroup,
    isUpdatingGroupUsers,
    
    // Error states
    groupsError,
    
    // Pagination states
    currentPage,
    searchQuery,
    
    // Actions
    setCurrentPage,
    setSearchQuery,
    
    // CRUD operations
    getGroup,
    getGroupUsers,
    createGroup,
    updateGroup,
    deleteGroup,
    updateGroupUsers,
  };
};
