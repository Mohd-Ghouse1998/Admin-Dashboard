import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from '@/types/wallet.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, ChevronRight, Download, List as ListIcon, Plus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { TransactionsList } from '@/components/wallets/TransactionsList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';

export default function WalletDetail() {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  
  const {
    getWallet,
    getWalletTransactions,
    depositFunds,
    isLoading: isWalletLoading,
    errorWallet,
    isLoadingTransactions,
    isLoadingDeposit,
    errorDeposit,
    refreshData,
  } = useWallet();
  
  const { data: wallet, error: walletFetchError } = getWallet(walletId as string);
  const { data: transactionsData, error: transactionsError } = getWalletTransactions(walletId as string);
  
  const transactions = transactionsData?.results || [];
  
  const isLoading = isWalletLoading || isLoadingTransactions;
  const error = errorWallet || walletFetchError || transactionsError || errorDeposit;
  
  // Calculate total deposits and withdrawals
  const depositTotal = transactions?.filter(t => t.transaction_type === 'deposit')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  
  const withdrawalTotal = transactions?.filter(t => t.transaction_type === 'withdrawal')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  
  const handleAddFunds = () => {
    setAddFundsOpen(true);
  };
  
  const handleConfirmAddFunds = async () => {
    try {
      const amount = parseFloat(addFundsAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }
      
      await depositFunds.mutateAsync({ walletId: walletId as string, amount });
      toast({
        title: "Success",
        description: "Funds added successfully",
      });
      setAddFundsOpen(false);
      setAddFundsAmount('');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add funds",
        variant: "destructive",
      });
    }
  };
  
  const handleDownloadHistory = () => {
    // Implement download logic here
    toast({
      title: "Download Initiated",
      description: "Downloading transaction history...",
    });
  };
  
  const handleRefresh = () => {
    refreshData();
    toast({
      title: "Refreshing",
      description: "Refreshing wallet data...",
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/wallets')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wallets
          </Button>
          <h1 className="text-2xl font-bold">Wallet Details</h1>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAddFunds}>
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.toString()}</AlertDescription>
        </Alert>
      )}
      
      {/* Content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main wallet info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : wallet ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold">{formatCurrency(wallet.balance)}</h3>
                    <p className="text-muted-foreground">Available Balance</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Wallet ID</p>
                      <p className="font-medium">{wallet.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">User</p>
                      <p className="font-medium">{wallet.user}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">{wallet.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{format(new Date(wallet.created_at), 'PPP')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Wallet not found</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Last {transactions?.length || 0} transactions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(`/wallets/${walletId}/transactions`)}>
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <TransactionsList transactions={transactions || []} />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar with quick actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleAddFunds}>
                <Plus className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/wallets/${walletId}/transactions`)}>
                <ListIcon className="mr-2 h-4 w-4" />
                View Transactions
              </Button>
              <Button variant="outline" className="w-full" onClick={handleDownloadHistory}>
                <Download className="mr-2 h-4 w-4" />
                Download History
              </Button>
            </CardContent>
          </Card>
          
          {/* Stats card */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : transactions?.length ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Transaction</span>
                    <span className="text-sm font-medium">
                      {format(new Date(transactions[0].created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Deposits</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(depositTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Withdrawals</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(withdrawalTotal)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-2">No transaction data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Funds dialog */}
      <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Enter the amount to deposit into the wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input 
                type="number" 
                id="amount" 
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setAddFundsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmAddFunds} disabled={isLoadingDeposit}>
              {isLoadingDeposit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Funds...
                </>
              ) : (
                "Add Funds"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
