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
        console.log('Fetching users with params:', params);
        return await userService.getUsers(params);
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
  // The axios response structure: response.data contains the API payload
  // Log the full data structure to debug
  console.log("Users hook data structure:", data);
  
  // Properly extract data from Axios response
  // Axios wraps the response in a 'data' property
  return {
    users: data?.data || { results: [], count: 0, next: null, previous: null },
    isLoading,
    error,
    refetch,
    deleteUser
  };
};
