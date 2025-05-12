import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, User, PaginatedResponse } from '@/modules/users/services/userService';

export const useUsers = (
  searchQuery = '', 
  statusFilter: 'all' | 'active' | 'inactive' = 'all',
  page = 1
) => {
  const queryClient = useQueryClient();
  
  // Prepare API parameters
  const params: Record<string, string> = {
    search: searchQuery,
    page: page.toString()
  };
  
  // Add status filter if not 'all'
  if (statusFilter !== 'all') {
    params.is_active = statusFilter === 'active' ? 'true' : 'false';
  }
  
  // Fetch users with real API integration
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users', searchQuery, statusFilter, page],
    queryFn: async () => {
      try {
        return await userService.getUsers();
      } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
      }
    }
  });

  // Delete user mutation
  const { mutateAsync: deleteUser } = useMutation({
    mutationFn: async (id: number) => {
      return await userService.deleteUser(id);
    },
    onSuccess: () => {
      // Invalidate the users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Process data for UI display
  // The axios response has data property that contains the actual API response
  // Log the full data structure to debug
  console.log("Users hook data structure:", data);
  
  return {
    users: data?.data || { results: [], count: 0, next: null, previous: null },
    isLoading,
    error,
    refetch,
    deleteUser
  };
};
