
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tenant } from "@/modules/tenants/types";
import { formatDate } from "@/utils/formatters";

interface TenantTableProps {
  tenants: Tenant[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onViewTenant: (id: string | number) => void;
  onEditTenant: (id: string | number) => void;
  onDeleteTenant: (id: string | number) => void;
  onCreateTenant: () => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  loading,
  currentPage,
  totalPages,
  totalItems,
  searchQuery,
  onSearchChange,
  onPageChange,
  onViewTenant,
  onEditTenant,
  onDeleteTenant,
  onCreateTenant,
}) => {
  const columns: Column<Tenant>[] = [
    {
      header: "Tenant Name",
      accessorKey: "name",
      cell: (tenant) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {tenant.name}
        </span>
      )
    },
    {
      header: "Schema Name",
      accessorKey: "schema_name",
      cell: (tenant) => tenant.schema_name
    },
    {
      header: "Country",
      accessorKey: "country",
      cell: (tenant) => tenant.country
    },
    {
      header: "Currency",
      accessorKey: "currency",
      cell: (tenant) => tenant.currency
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: (tenant) => (
        <StatusBadge 
          status={tenant.is_active ? "Active" : "Inactive"} 
          variant={tenant.is_active ? "success" : "danger"}
        />
      )
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: (tenant) => formatDate(tenant.created_at)
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (tenant) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewTenant(tenant.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEditTenant(tenant.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDeleteTenant(tenant.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tenants</CardTitle>
          <CardDescription>Manage tenant organizations</CardDescription>
        </div>
        <Button onClick={onCreateTenant}>
          <Plus className="h-4 w-4 mr-2" /> New Tenant
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={tenants}
          keyField="id"
          isLoading={loading}
          emptyMessage="No tenants found"
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
