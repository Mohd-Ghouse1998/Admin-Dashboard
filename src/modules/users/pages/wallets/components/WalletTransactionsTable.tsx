
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Filter, FileDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface WalletTransaction {
  id: string | number;
  username?: string;
  user?: string | number | { username?: string; email?: string };
  amount: number;
  start_balance: number;
  end_balance: number;
  reason: string;
  status?: string;
  created_at: string;
}

interface WalletTransactionsTableProps {
  wallets: WalletTransaction[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onViewWallet: (id: string | number) => void;
}

export const WalletTransactionsTable: React.FC<WalletTransactionsTableProps> = ({
  wallets,
  loading,
  currentPage,
  totalPages,
  totalItems,
  searchQuery,
  onSearchChange,
  onPageChange,
  onViewWallet,
}) => {
  const getUsername = (wallet: WalletTransaction) => {
    if (wallet.username) return wallet.username;
    if (typeof wallet.user === 'object' && wallet.user && wallet.user.username) return wallet.user.username;
    return `User ${wallet.user || 'Unknown'}`;
  };

  const columns: Column<WalletTransaction>[] = [
    {
      header: "User",
      accessorKey: "user",
      cell: (wallet) => <span className="font-medium">{getUsername(wallet)}</span>
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (wallet) => (
        <span className={Number(wallet.amount) >= 0 ? "text-green-600" : "text-red-600"}>
          {Number(wallet.amount) >= 0 ? "+" : ""}{formatCurrency(wallet.amount)}
        </span>
      ),
      className: "text-right"
    },
    {
      header: "Start Balance",
      accessorKey: "start_balance",
      cell: (wallet) => formatCurrency(wallet.start_balance),
      className: "text-right"
    },
    {
      header: "End Balance",
      accessorKey: "end_balance",
      cell: (wallet) => formatCurrency(wallet.end_balance),
      className: "text-right"
    },
    {
      header: "Reason",
      accessorKey: "reason",
      cell: (wallet) => (
        <Badge className={
          wallet.reason === 'CUSTOMER_DEPOSIT' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : wallet.reason === 'CHARGE_DEDUCTION'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }>
          {wallet.reason || 'N/A'}
        </Badge>
      )
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (wallet) => formatDate(new Date(wallet.created_at)),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (wallet) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewWallet(wallet.id)}
        >
          View
        </Button>
      ),
      className: "text-right"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Wallets</CardTitle>
        <CardDescription>View and manage user wallet balances and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
        
        <DataTable
          columns={columns}
          data={wallets}
          keyField="id"
          isLoading={loading}
          emptyMessage="No wallet transactions found"
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            onPageChange
          }}
        />
      </CardContent>
    </Card>
  );
};
