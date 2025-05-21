import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetailTemplate, DetailSection } from '@/components/templates/detail/DetailTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, WalletStats } from '@/services/api/walletsApi';
import { walletService } from '@/modules/payments/services/walletService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { 
  Plus, 
  RefreshCcw, 
  Wallet as WalletIcon, 
  BarChart3, 
  DollarSign, 
  ArrowDownCircle, 
  ArrowUpCircle,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import AddFundsDialog from './components/AddFundsDialog';
import RefundDialog from './components/RefundDialog';

const WalletDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id); // Convert string ID from URL to number
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    current_balance: 0,
    total_deposits: 0,
    total_withdrawals: 0
  });
  const [username, setUsername] = useState<string>('');
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch wallet transactions and stats
  const fetchWalletData = async () => {
    try {
      if (!userId || isNaN(userId)) {
        console.error('Invalid user ID:', userId);
        toast({
          title: 'Error',
          description: 'Invalid user ID provided',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      console.log(`Fetching wallet data for user ID: ${userId}`);

      // Prepare API parameters for server-side pagination, filtering and sorting
      const params: Record<string, any> = {
        page: currentPage,
        page_size: pageSize,
        ordering: sortOrder === 'desc' ? '-created_at' : 'created_at',
        user: userId, // Explicitly include userId in params for emphasis
      };
      
      // Add transaction type filter if not 'all'
      if (transactionType === 'deposits') {
        params.amount_gt = 0;
      } else if (transactionType === 'withdrawals') {
        params.amount_lt = 0;
      }
      
      // Add search parameter if available
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Get transactions with pagination parameters - ensure userId is passed correctly
      const transactionsData = await walletService.getWalletsByUser(userId, params);
      console.log('Fetched wallet transactions:', transactionsData);
      
      // Transform data for table
      const transformedTransactions = transactionsData.results.map((transaction: Wallet) => ({
        id: transaction.id,
        amount: transaction.amount,
        reason: transaction.reason,
        startBalance: transaction.start_balance,
        endBalance: transaction.end_balance,
        date: formatDate(transaction.created_at),
        createdAt: transaction.created_at,
      }));
      
      // Set data in state
      setTransactions(transformedTransactions);
      setTotalItems(transactionsData.count);
      setTotalPages(Math.ceil(transactionsData.count / pageSize));
      
      // Set username if available in the first transaction
      if (transactionsData.results.length > 0) {
        setUsername(transactionsData.results[0].username);
      }

      // Get wallet statistics
      const stats = await walletService.getWalletStats(userId);
      setWalletStats(stats);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch wallet data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use a ref to track previous userId for comparison
  const prevUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset state when user ID changes to avoid showing previous user's data
    if (userId) {
      const prevUserId = prevUserIdRef.current;
      
      // If the userId changed (not just other parameters like page)
      if (prevUserId !== null && prevUserId !== userId) {
        console.log(`User ID changed from ${prevUserId} to ${userId}`);        
        // Reset pagination and filter state
        setCurrentPage(1);
        setTransactions([]);
        setUsername('');
        setWalletStats({
          current_balance: 0,
          total_deposits: 0,
          total_withdrawals: 0
        });
      }
      
      // Update the ref to current userId for next comparison
      prevUserIdRef.current = userId;
      
      // Fetch data for the current user
      fetchWalletData();
    }
  }, [userId, currentPage, pageSize, transactionType, sortOrder, searchQuery]);

  const handleAddFundsSuccess = () => {
    fetchWalletData();
  };

  const handleRefundSuccess = () => {
    fetchWalletData();
  };

  // Stats cards for the wallet summary
  const statsCards = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Current Balance"
        value={formatCurrency(walletStats.current_balance)}
        icon={<DollarSign className="h-6 w-6" />}
        variant={walletStats.current_balance >= 0 ? "primary" : "danger"}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Total Deposits"
        value={formatCurrency(walletStats.total_deposits)}
        icon={<ArrowDownCircle className="h-6 w-6" />}
        variant="success"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Total Withdrawals"
        value={formatCurrency(walletStats.total_withdrawals)}
        icon={<ArrowUpCircle className="h-6 w-6" />}
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );

  // Filter component for transactions
  const filterComponent = (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search transactions..."
          className="pl-9 w-full md:w-[260px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Select 
        value={transactionType} 
        onValueChange={(value) => setTransactionType(value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Transaction Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Transactions</SelectItem>
          <SelectItem value="deposits">Deposits Only</SelectItem>
          <SelectItem value="withdrawals">Withdrawals Only</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10"
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        title={`Sort by date ${sortOrder === 'asc' ? 'oldest first' : 'newest first'}`}
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
  );

  // Pagination component
  const paginationComponent = (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing page {currentPage} of {totalPages} • {totalItems} total transactions
      </div>
      
      <div className="flex items-center gap-2 border rounded-md px-2 py-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className="h-7 px-2 text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        {/* Page numbers */}
        <div className="hidden sm:flex items-center border-l border-r px-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={cn("h-7 w-7 mx-0.5 p-0 text-sm", 
                  currentPage === pageNum && "bg-primary text-white"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className="h-7 px-2 text-sm"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Transaction table section
  const transactionsSection = (
    <DetailSection
      title="Transaction History"
      icon={<BarChart3 className="h-5 w-5" />}
      description="Complete history of wallet transactions for this user"
      className="mt-6"
    >
      {filterComponent}
      
      <Card className="border rounded-lg shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors bg-primary/5 hover:bg-primary/5">
                  <th className="h-12 px-4 text-left align-middle font-medium">Trans ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Reason</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Start Balance</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">End Balance</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                        <span>Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center text-muted-foreground">
                      No transactions found for this user
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">{transaction.id}</td>
                      <td className="p-4 align-middle">
                        <span className={transaction.amount >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="p-4 align-middle capitalize">
                        {transaction.reason?.replace(/_/g, ' ').toLowerCase()}
                      </td>
                      <td className="p-4 align-middle">{formatCurrency(transaction.startBalance)}</td>
                      <td className="p-4 align-middle">{formatCurrency(transaction.endBalance)}</td>
                      <td className="p-4 align-middle">{transaction.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {!isLoading && transactions.length > 0 && paginationComponent}
    </DetailSection>
  );

  return (
    <>
      <DetailTemplate
        title={`Wallet: ${username}`}
        subtitle={`Balance: ${formatCurrency(walletStats.current_balance)}`}
        description="View and manage wallet transactions"
        backPath="/payment/wallets"
        backLabel="Back to Wallets"
        isLoading={isLoading}
        avatar={
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <WalletIcon className="h-6 w-6 text-primary" />
          </div>
        }
        actions={[
          {
            label: "Add Funds",
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: () => setIsAddFundsDialogOpen(true),
            variant: "outline",
            className: "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200",
          },
          {
            label: "Issue Refund",
            icon: <RefreshCcw className="h-4 w-4 mr-2" />,
            onClick: () => setIsRefundDialogOpen(true),
            variant: "outline",
            className: walletStats.current_balance <= 0 
              ? "opacity-50 pointer-events-none" 
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200",
          }
        ]}
      >
        {/* Stats Cards */}
        {statsCards}
        
        {/* Transactions List */}
        {transactionsSection}
      </DetailTemplate>

      {/* Dialogs */}
      <AddFundsDialog
        isOpen={isAddFundsDialogOpen}
        onClose={() => setIsAddFundsDialogOpen(false)}
        userId={userId}
        username={username}
        onSuccess={handleAddFundsSuccess}
      />
      
      <RefundDialog
        isOpen={isRefundDialogOpen}
        onClose={() => setIsRefundDialogOpen(false)}
        userId={userId}
        username={username}
        currentBalance={walletStats.current_balance}
        onSuccess={handleRefundSuccess}
      />
    </>
  );
};

export default WalletDetailPage;
