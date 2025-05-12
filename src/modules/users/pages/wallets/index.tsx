
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { WalletBalanceCard } from '@/components/wallets/WalletBalanceCard';
import { AddFundsForm } from '@/components/wallets/AddFundsForm';
import { TransactionsList } from '@/components/wallets/TransactionsList';
import { WalletStats } from '@/components/wallets/WalletStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallets } from '@/hooks/useWallets';
import { useNavigate } from 'react-router-dom';

const WalletsPage = () => {
  const { getWalletStatistics, getWalletBalance, getWalletTransactions } = useWallets();
  const { data: statsData, isLoading: statsLoading, error: statsError } = getWalletStatistics();
  const { data: balanceData, isLoading: balanceLoading } = getWalletBalance();
  const { data: transactionsData, isLoading: transactionsLoading } = getWalletTransactions(1);
  const navigate = useNavigate();
  
  // Handler for Add Funds button
  const handleAddFunds = () => {
    // This will scroll to the Add Funds form
    document.getElementById('add-funds-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handler for View All transactions
  const handleViewAllTransactions = (type?: string) => {
    if (type) {
      navigate(`/wallets/transactions?type=${type}`);
    } else {
      navigate('/wallets/transactions');
    }
  };
  
  // Find transactions by type and ensure they match the required interface
  const findRecentTransaction = (type: string) => {
    const transaction = transactionsData?.results.find(t => t.transaction_type === type);
    if (transaction && transaction.amount !== undefined) {
      return {
        amount: transaction.amount,
        currency: transaction.currency || 'USD',
        created_at: transaction.created_at
      };
    }
    return undefined;
  };

  return (
    <PageLayout 
      title="Wallet Management" 
      description="Manage your wallet, view transactions, and add funds"
    >
      {/* Wallet Statistics */}
      <WalletStats 
        totalBalance={statsData?.totalBalance || 0}
        totalActiveWallets={statsData?.totalActiveWallets || 0}
        averageBalance={statsData?.averageBalance || 0}
        transactionsCount={statsData?.transactionsCount || 0}
        isLoading={statsLoading}
        error={statsError instanceof Error ? statsError : null}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <div className="col-span-1">
          <WalletBalanceCard 
            balance={balanceData}
            isLoading={balanceLoading}
            onAddFunds={handleAddFunds}
            recentDeposit={findRecentTransaction('deposit')}
            recentWithdrawal={findRecentTransaction('withdrawal')}
          />
        </div>
        
        <div className="col-span-1 lg:col-span-2" id="add-funds-form">
          <AddFundsForm />
        </div>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <TransactionsList 
                transactions={transactionsData?.results || []}
                limit={5} 
                showViewAll 
                onViewAll={() => handleViewAllTransactions()} 
              />
            </TabsContent>
            
            <TabsContent value="deposits">
              <TransactionsList 
                transactions={transactionsData?.results || []}
                limit={5} 
                showViewAll 
                type="deposit" 
                onViewAll={() => handleViewAllTransactions('deposit')} 
              />
            </TabsContent>
            
            <TabsContent value="payments">
              <TransactionsList 
                transactions={transactionsData?.results || []}
                limit={5} 
                showViewAll 
                type="payment" 
                onViewAll={() => handleViewAllTransactions('payment')} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default WalletsPage;
