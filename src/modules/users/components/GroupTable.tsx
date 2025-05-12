
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Group } from "@/types/group";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GroupTableProps {
  groups: Group[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onViewGroup: (id: number) => void;
  onEditGroup: (id: number) => void;
  onDeleteGroup: (id: number) => void;
  onCreateGroup: () => void;
  groupUserCounts?: Record<number, number>;
}

export function GroupTable({
  groups,
  loading,
  currentPage,
  totalPages,
  totalItems,
  searchQuery,
  onSearchChange,
  onPageChange,
  onViewGroup,
  onEditGroup,
  onDeleteGroup,
  onCreateGroup,
  groupUserCounts = {},
}: GroupTableProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  // Update local search when prop changes
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

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      enableTooltip: true,
    },
    {
      header: "Members",
      accessorKey: "members",
      cell: (group: Group) => {
        const count = groupUserCounts[group.id] || 0;
        return (
          <Badge variant="secondary">
            {count} {count === 1 ? "user" : "users"}
          </Badge>
        );
      }
    },
    {
      header: "Permissions",
      accessorKey: "permissions",
      cell: (group: Group) => {
        const count = group.permissions ? group.permissions.length : 0;
        return (
          <Badge variant="outline">
            {count} {count === 1 ? "permission" : "permissions"}
          </Badge>
        );
      }
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (group: Group) => (
        <div className="flex items-center gap-2 justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewGroup(group.id);
                  }}
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Group</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditGroup(group.id);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(group.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      className: "text-right w-[120px]"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>User Groups</CardTitle>
            <CardDescription>Manage user groups and their permissions</CardDescription>
          </div>
          <Button onClick={onCreateGroup} className="mt-2 md:mt-0">
            <Plus className="h-4 w-4 mr-2" /> New Group
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={localSearch}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={groups}
          isLoading={loading}
          keyField="id"
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            onPageChange,
          }}
          emptyMessage="No groups found"
          rowClassName={(row: Group) => "hover:bg-accent/50"}
          onRowClick={(row: Group) => onViewGroup(row.id)}
        />
      </CardContent>
    </Card>
  );
}
