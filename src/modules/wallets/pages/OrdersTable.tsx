
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Filter, FileDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";

// Helper function for status color classes
const getStatusColorClass = (status: string): string => {
  if (!status) return '';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'active' || statusLower === 'completed' || statusLower === 'success') {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  } else if (statusLower === 'pending' || statusLower === 'processing') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  } else if (statusLower === 'failed' || statusLower === 'error' || statusLower === 'cancelled') {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  } else {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

interface Order {
  id: string | number;
  order_id?: string;
  user?: { username?: string; email?: string } | string | number;
  amount: number;
  total?: number;
  status: string;
  created_at: string;
}

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onViewOrder: (id: string | number) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading,
  currentPage,
  totalPages,
  totalItems,
  searchQuery,
  onSearchChange,
  onPageChange,
  onViewOrder,
}) => {
  const getOrderUsername = (order: Order) => {
    if (typeof order.user === 'object' && order.user) {
      return order.user.username || order.user.email || `User ${order.user.toString() || 'Unknown'}`;
    }
    return `User ${order.user || 'Unknown'}`;
  };

  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      accessorKey: "order_id",
      cell: (order) => (
        <span className="font-medium">
          {order.order_id || order.id || 'N/A'}
        </span>
      )
    },
    {
      header: "User",
      accessorKey: "user",
      cell: (order) => getOrderUsername(order)
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (order) => formatCurrency(order.amount || order.total || 0),
      className: "text-right"
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (order) => (
        <Badge className={getStatusColorClass(order.status)}>
          {order.status || 'pending'}
        </Badge>
      )
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: (order) => formatDate(new Date(order.created_at))
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (order) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewOrder(order.id || order.order_id)}
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
        <CardTitle>Orders</CardTitle>
        <CardDescription>View and manage payment orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
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
          data={orders}
          keyField="id"
          isLoading={loading}
          emptyMessage="No orders found"
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
