
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

import { formatCurrency } from '@/utils/formatters';

interface WalletBalanceCardProps {
  balance?: {
    balance: number;
    currency: string;
    last_transaction_date?: string;
  };
  onAddFunds: () => void;
  isLoading?: boolean;
  recentDeposit?: {
    amount: number;
    currency: string;
    created_at: string;
  };
  recentWithdrawal?: {
    amount: number;
    currency: string;
    created_at: string;
  };
}

export function WalletBalanceCard({ 
  balance, 
  onAddFunds, 
  isLoading = false,
  recentDeposit,
  recentWithdrawal
}: WalletBalanceCardProps) {
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <div>
          <CardTitle>Wallet Balance</CardTitle>
          <CardDescription>Your current account balance</CardDescription>
        </div>
        {!isLoading && (
          <Button onClick={onAddFunds}>
            <Plus className="mr-2 h-4 w-4" />
            Add Funds
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-4 w-52" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="text-4xl font-bold mb-1">
              {formatCurrency(balance?.balance)}
            </div>
            <p className="text-muted-foreground">
              {balance?.last_transaction_date 
                ? `Last updated: ${format(new Date(balance.last_transaction_date), "MMM d, yyyy h:mm a")}`
                : "No transactions yet"}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="border-green-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recent Deposit</p>
                      <div className="text-xl font-bold text-green-600">
                        {recentDeposit ? formatCurrency(recentDeposit.amount) : "N/A"}
                      </div>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <ArrowDownCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-red-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recent Withdrawal</p>
                      <div className="text-xl font-bold text-red-600">
                        {recentWithdrawal ? formatCurrency(recentWithdrawal.amount) : "N/A"}
                      </div>
                    </div>
                    <div className="bg-red-100 p-2 rounded-full">
                      <ArrowUpCircle className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
