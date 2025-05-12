
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartBar, CreditCard, Users, Wallet } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { useToast } from '@/hooks/use-toast';

export interface WalletStatsProps {
  totalBalance: number;
  totalActiveWallets: number;
  averageBalance: number;
  transactionsCount?: number;
  isLoading?: boolean;
  error?: Error | null;
}

export function WalletStats({
  totalBalance,
  totalActiveWallets,
  averageBalance,
  transactionsCount = 0,
  isLoading = false,
  error = null
}: WalletStatsProps) {
  const { toast } = useToast();
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Show toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading wallet statistics",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Balance"
        value={formatCurrency(totalBalance)}
        icon={<CreditCard className="h-6 w-6" />}
        variant="primary"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Active Wallets"
        value={totalActiveWallets.toString()}
        icon={<Users className="h-6 w-6" />}
        variant="default"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Average Balance"
        value={formatCurrency(averageBalance)}
        icon={<ChartBar className="h-6 w-6" />}
        variant="default"
        isLoading={isLoading}
      />

      <StatCard
        title="Transactions"
        value={transactionsCount.toString()}
        icon={<Wallet className="h-6 w-6" />}
        variant="default"
        isLoading={isLoading}
      />
    </div>
  );
}
