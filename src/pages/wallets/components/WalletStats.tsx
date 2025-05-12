
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartBar, CreditCard, Users } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

export interface WalletStatsProps {
  totalBalance: number;
  totalActiveWallets: number;
  averageBalance: number;
  isLoading?: boolean;
}

export function WalletStats({
  totalBalance,
  totalActiveWallets,
  averageBalance,
  isLoading = false
}: WalletStatsProps) {
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </div>
  );
}
