
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/modules/users/services/userService';

interface User {
  id: number | string;
  username: string;
  email: string;
}

interface Wallet {
  id: number | string;
  user: User;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_transaction_date?: string;
  last_transaction_type?: 'deposit' | 'withdrawal';
}

interface WalletsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Wallet[];
}

export const useWallets = (searchQuery = '') => {
  const { accessToken } = useAuth();
  
  // Fetch wallets
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['wallets', searchQuery],
    queryFn: async () => {
      try {
        // Use the real API endpoint instead of mock data
        return await userService.getWallets(accessToken, searchQuery);
      } catch (err) {
        console.error('Error fetching wallets:', err);
        throw err;
      }
    }
  });

  return {
    wallets: data,
    isLoading,
    error,
    refetch
  };
};
