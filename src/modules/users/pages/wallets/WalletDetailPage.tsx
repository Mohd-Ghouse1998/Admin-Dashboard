
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit, ArrowLeft, Wallet, Plus, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/modules/users/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const WalletDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();

  const {
    data: wallet,
    isLoading,
    error
  } = useQuery({
    queryKey: ['wallet', id],
    queryFn: () => userService.getWallet(accessToken, id || ''),
    enabled: !!accessToken && !!id,
  });

  return (
    <PageLayout
      title="Wallet Details"
      description="View wallet details and transaction history"
      backButton
      backTo="/users/wallets"
      actions={
        <Button asChild variant="outline">
          <Link to={`/users/wallets/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Wallet
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Wallet Details | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load wallet details'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Wallet Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            ) : wallet ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(wallet.balance, wallet.currency)}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={wallet.is_active ? 'success' : 'destructive'} className="mt-1">
                    {wallet.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium">
                    {wallet.user?.username || wallet.user?.email || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {wallet.user?.email !== wallet.user?.username ? wallet.user?.email : ''}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDateTime(wallet.created_at)}</p>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                  <Button className="flex-1" variant="secondary">
                    <Minus className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Wallet not found</p>
            )}
          </CardContent>
        </Card>
        
        {/* Transaction History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            ) : wallet ? (
              wallet.transactions && wallet.transactions.length > 0 ? (
                <div className="space-y-4">
                  {wallet.transactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{transaction.description || transaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(transaction.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'deposit' ? '+' : '-'} {formatCurrency(transaction.amount, wallet.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No transactions found for this wallet.</p>
              )
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default WalletDetailPage;
