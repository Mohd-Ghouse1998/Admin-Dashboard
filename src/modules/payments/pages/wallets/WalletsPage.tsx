import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Plus, ArrowUpRight, CreditCard, Users, Calculator } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { getWallets, Wallet, PaginatedResponse } from '@/services/api/walletsApi';
import { useToast } from '@/hooks/use-toast';

// Define an extended wallet interface for UI needs
interface EnhancedWallet {
  id: number;
  userId: number;
  username: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  status: string;
  lastTransaction: string;
  createdAt: string;
}

const WalletsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [wallets, setWallets] = useState<EnhancedWallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<EnhancedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      // Add console logging to debug API response
      console.log('Fetching wallets...');
      const response = await getWallets();
      console.log('API Response:', response);
      
      // Get the data based on the response structure
      let walletData: Wallet[] = [];
      
      // Axios responses contain the actual data in the .data property
      const responseData = response.data;
      
      if (responseData && 'results' in responseData && Array.isArray(responseData.results)) {
        // Handle paginated response
        console.log('Found paginated response with results array');
        walletData = responseData.results;
      } else if (Array.isArray(responseData)) {
        // Handle direct array response
        console.log('Response is a direct array');
        walletData = responseData;
      } else {
        console.error('Unexpected response structure:', responseData);
        toast({
          title: 'Data Structure Error',
          description: 'Received unexpected data structure from API.',
          variant: 'destructive',
        });
        setWallets([]);
        setFilteredWallets([]);
        return;
      }
      
      console.log('Processing wallet data:', walletData);
      const fetchedWallets = walletData.map((wallet: Wallet) => ({
        id: wallet.id,
        userId: wallet.user,
        username: wallet.username || 'User',
        balance: wallet.end_balance || 0,
        availableBalance: wallet.end_balance || 0, // Using end_balance as available balance
        pendingBalance: 0, // No pending balance info in API
        currency: 'USD', // Default currency
        status: (wallet.end_balance > 0) ? 'active' : 'inactive',
        lastTransaction: wallet.updated_at || wallet.created_at,
        createdAt: wallet.created_at
      }));
      
      console.log('Processed wallets:', fetchedWallets);
      setWallets(fetchedWallets);
      setFilteredWallets(fetchedWallets);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallets. Please try again. Error: ' + (error instanceof Error ? error.message : String(error)),
        variant: 'destructive',
      });
      // Initialize with empty arrays on error
      setWallets([]);
      setFilteredWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary metrics
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalActiveWallets = wallets.filter(wallet => wallet.status === 'active').length;
  const averageBalance = totalBalance / (totalActiveWallets || 1);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredWallets(wallets);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = wallets.filter(wallet => 
      wallet.username.toLowerCase().includes(term)
    );
    
    setFilteredWallets(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      setFilteredWallets(wallets);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewWallet = (id: string) => {
    navigate(`/payment/wallets/${id}`);
  };

  const handleTopUp = (id: string) => {
    navigate(`/payment/wallets/${id}/topup`);
  };

  return (
    <PageLayout
      title="Wallet Management"
      description="Manage user wallets and virtual balances"
      actions={
        <Button onClick={() => navigate('/payment/wallets/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Wallet
        </Button>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard 
            title="Total Balance" 
            value={formatCurrency(totalBalance)}
            icon={<CreditCard className="h-4 w-4" />}
            trend={{ value: 3.5, isPositive: true }}
          />
          <StatCard 
            title="Active Wallets" 
            value={totalActiveWallets.toString()}
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 1.2, isPositive: true }}
          />
          <StatCard 
            title="Average Balance" 
            value={formatCurrency(averageBalance)}
            icon={<Calculator className="h-4 w-4" />}
            trend={{ value: 0.8, isPositive: true }}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wallet List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex justify-between items-center">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Search user or wallet..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  className="pr-8"
                />
                <Search
                  className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={handleSearch}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading wallets...
                      </TableCell>
                    </TableRow>
                  ) : filteredWallets.length > 0 ? (
                    filteredWallets.map((wallet) => (
                      <TableRow key={wallet.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{wallet.username}</span>
                            <span className="text-sm text-muted-foreground">ID: {wallet.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">${wallet.balance.toFixed(2)}</span>
                            {wallet.pendingBalance > 0 && (
                              <span className="text-xs text-muted-foreground">
                                (${wallet.pendingBalance.toFixed(2)} pending)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className={wallet.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                          >
                            {wallet.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(wallet.lastTransaction).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/payment/wallets/${wallet.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/payment/wallets/${wallet.id}/topup`)}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No wallets found. {searchTerm && 'Try a different search term.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default WalletsPage;
