import React, { useState } from 'react';
import { User } from '@/types/user';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserRound,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: string;
  roleFilter: string;
  sortField: string;
  sortDirection: string;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onRoleFilterChange: (role: string) => void;
  onSortChange: (field: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewUser: (id: string | number) => void;
  onEditUser: (id: string | number) => void;
  onDeleteUser: (id: string | number) => void;
  onCreateUser: () => void;
  onExportUsers: () => void;
  onRefreshUsers: () => void;
  totalUserCount: number;
  activeUserCount: number;
  newUserCount: number;
  selectedUserIds: (string | number)[];
  onSelectUser: (id: string | number, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onBulkDelete: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  searchQuery,
  statusFilter,
  roleFilter,
  sortField,
  sortDirection,
  onSearchChange,
  onStatusFilterChange,
  onRoleFilterChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onCreateUser,
  onExportUsers,
  onRefreshUsers,
  totalUserCount,
  activeUserCount,
  newUserCount,
  selectedUserIds,
  onSelectUser,
  onSelectAll,
  onBulkDelete,
}) => {
  // State for advanced filter panel
  const [showFilters, setShowFilters] = useState(false);

  // Calculate if all items on this page are selected
  const allSelected = users.length > 0 && selectedUserIds.length === users.length && 
    users.every(user => selectedUserIds.includes(user.id));

  // Render loading skeleton
  if (loading && users.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center space-y-2 sm:space-y-0">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-4" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {selectedUserIds.length > 0 && (
            <Button 
              variant="outline" 
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={onBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {selectedUserIds.length} selected
            </Button>
          )}
          
          <Button variant="outline" size="icon" onClick={onRefreshUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" onClick={onExportUsers}>
            <Download className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          <Button onClick={onCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      {/* Filter options */}
      {showFilters && (
        <div className="p-4 border rounded-md space-y-4 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="superuser">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Page Size</label>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(value) => onPageSizeChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSortChange('username')}
              >
                Username
                {sortField === 'username' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSortChange('email')}
              >
                Email
                {sortField === 'email' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={(checked) => onSelectUser(user.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <UserRound className="h-5 w-5 mr-2 text-muted-foreground" />
                      {user.username}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.is_superuser && (
                      <Badge>Admin</Badge>
                    )}
                    {user.is_staff && !user.is_superuser && (
                      <Badge variant="outline">Staff</Badge>
                    )}
                    {!user.is_staff && !user.is_superuser && (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge variant="outline" className="bg-green-100 text-green-600">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewUser(user.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditUser(user.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} users
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around the current page
              let pageNum = i + 1;
              if (currentPage > 3 && totalPages > 5) {
                pageNum = i + currentPage - 2;
                if (pageNum > totalPages - 4) {
                  pageNum = totalPages - 4 + i;
                }
              }
              
              if (pageNum <= 0 || pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
