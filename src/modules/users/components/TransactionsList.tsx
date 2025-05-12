
// Import with proper functions and types
import React from 'react';
import { format } from 'date-fns';
import { Wallet } from '@/types/wallet.types';
import { formatCurrency } from '@/utils/formatters';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionsListProps {
  transactions: Wallet[];
  limit?: number;
  showViewAll?: boolean;
  type?: string;
  onViewAll?: () => void;
}

const getTransactionTypeVariant = (type: string | undefined) => {
  switch (type) {
    case 'deposit':
      return 'default';
    case 'withdrawal':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const formatTransactionType = (type: string | undefined): string => {
  if (!type) return 'N/A';
  
  const typeMap = {
    'deposit': 'Deposit',
    'withdrawal': 'Withdrawal',
    'transfer': 'Transfer',
    'payment': 'Payment',
    'refund': 'Refund',
  };
  
  return typeMap[type] || type;
};

export function TransactionsList({ transactions, limit, showViewAll = false, type, onViewAll }: TransactionsListProps) {
  // Filter transactions by type if provided
  const filteredTransactions = type 
    ? transactions.filter(t => t.transaction_type === type) 
    : transactions;
    
  // Apply limit if provided
  const displayedTransactions = limit 
    ? filteredTransactions.slice(0, limit) 
    : filteredTransactions;
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground p-4">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            displayedTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-muted/50">
                <TableCell>
                  {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.created_at), 'h:mm a')}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getTransactionTypeVariant(transaction.transaction_type)}
                    className="flex items-center gap-1"
                  >
                    {transaction.transaction_type === 'deposit' ? (
                      <ArrowDownIcon className="h-3 w-3" />
                    ) : (
                      <ArrowUpIcon className="h-3 w-3" />
                    )}
                    {formatTransactionType(transaction.transaction_type)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {transaction.description || 'N/A'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transaction.new_balance)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {showViewAll && filteredTransactions.length > 0 && (
        <div className="py-2 px-4 border-t text-center">
          <Button 
            variant="link" 
            size="sm" 
            onClick={onViewAll}
          >
            View all {filteredTransactions.length} transactions
          </Button>
        </div>
      )}
    </div>
  );
}
