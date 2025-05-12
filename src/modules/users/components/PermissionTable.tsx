
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Permission } from "@/types/permission";
import { Search, RefreshCw } from "lucide-react";

interface PermissionTableProps {
  permissions: Permission[];
  isLoading: boolean;
  appLabelFilter?: string;
  modelFilter?: string;
  searchQuery?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onSearchChange: (query: string) => void;
  onAppLabelChange: (appLabel: string | undefined) => void;
  onModelChange: (model: string | undefined) => void;
  onPageChange: (page: number) => void;
  onRefreshPermissions: () => void;
  uniqueAppLabels: string[];
  uniqueModels: string[];
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  isLoading,
  appLabelFilter,
  modelFilter,
  searchQuery = "",
  currentPage,
  totalPages,
  totalItems,
  onSearchChange,
  onAppLabelChange,
  onModelChange,
  onPageChange,
  onRefreshPermissions,
  uniqueAppLabels,
  uniqueModels,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  // Update localSearch when searchQuery prop changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);
  
  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    
    // Debounce search
    const timer = setTimeout(() => {
      onSearchChange(value);
    }, 500);
    
    return () => clearTimeout(timer);
  };
  
  const handleAppLabelChange = (value: string) => {
    onAppLabelChange(value === "all" ? undefined : value);
  };
  
  const handleModelChange = (value: string) => {
    onModelChange(value === "all" ? undefined : value);
  };
  
  const renderAppBadge = (app: string) => (
    <Badge variant="outline" className="font-mono text-xs">
      {app}
    </Badge>
  );
  
  const renderModelBadge = (model: string) => (
    <Badge variant="outline" className="font-mono text-xs bg-muted">
      {model}
    </Badge>
  );
  
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
      className: "w-16"
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Codename",
      accessorKey: "codename",
      cell: (permission: Permission) => (
        <span className="font-mono text-sm">{permission.codename}</span>
      ),
      className: "font-mono"
    },
    {
      header: "App",
      accessorKey: "content_type_app",
      cell: (permission: Permission) => renderAppBadge(permission.content_type_app)
    },
    {
      header: "Model",
      accessorKey: "content_type_model",
      cell: (permission: Permission) => renderModelBadge(permission.content_type_model)
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>System Permissions</CardTitle>
            <CardDescription>Manage system permissions</CardDescription>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onRefreshPermissions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={localSearch}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={appLabelFilter || "all"} onValueChange={handleAppLabelChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="App" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Apps</SelectItem>
                {uniqueAppLabels.map((appLabel) => (
                  <SelectItem key={appLabel} value={appLabel}>
                    {appLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={modelFilter || "all"} onValueChange={handleModelChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {uniqueModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={permissions}
          isLoading={isLoading}
          keyField="id"
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            onPageChange,
          }}
          emptyMessage="No permissions found"
        />
      </CardContent>
    </Card>
  );
};
