import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Wallet } from 'lucide-react';
import { walletService } from '@/modules/payments/services/walletService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';

interface WalletTransactionItem {
  id: string;
  userId: number;
  username: string;
  fullName: string;
  amount: number;
  reason: string;
  startBalance: number;
  endBalance: number;
  createdAt: string;
}

const WalletListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);

  // Define columns for the table
  const columns: Column<WalletTransactionItem>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (row) => row.username,
    },
    {
      key: 'fullName',
      header: 'Full Name',
      render: (row) => row.fullName,
    },
    {
      key: 'amount',
      header: 'Last Transaction',
      render: (row) => (
        <span className={row.amount >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {row.amount >= 0 ? '+' : ''}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => (
        <span className="capitalize">
          {row.reason.replace(/_/g, ' ').toLowerCase()}
        </span>
      ),
    },
    {
      key: 'endBalance',
      header: 'Balance',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.endBalance)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
  ];

  // No action buttons needed since rows are clickable

  // Fetch wallet transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await walletService.getLatestTransactionsByUser();
        
        // Transform data for table
        const transformedData = data.map((item: any) => ({
          id: item.id,
          userId: item.user,
          username: item.username,
          fullName: item.user_details?.full_name || item.username,
          amount: item.amount,
          reason: item.reason,
          startBalance: item.start_balance,
          endBalance: item.end_balance,
          createdAt: item.created_at,
        }));
        
        setTransactions(transformedData);
      } catch (error) {
        console.error('Error fetching wallet transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch wallet transactions',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  return (
    <div className="space-y-4">
      <ListTemplate
        title="Wallet Management"
        icon={<Wallet className="h-5 w-5" />}
        data={transactions}
        columns={columns}
        isLoading={isLoading}
        emptyState={<div>No wallet transactions found</div>}
        onRowClick={(row) => navigate(`/payment/wallets/${row.userId}`)}
        searchPlaceholder="Search wallets..."
        className="border border-border rounded-lg shadow-sm"
      />
    </div>
  );
};

export default WalletListPage;
