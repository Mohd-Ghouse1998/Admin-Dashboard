
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/modules/users/hooks/useUser";
import { UserTable } from "@/modules/users/components/UserTable";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Fixed import from UI components
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  const [derivedStats, setDerivedStats] = useState({
    totalUserCount: 0,
    activeUserCount: 0,
    newUserCount: 0
  });

  const {
    usersData,
    isLoadingUsers,
    searchQuery,
    statusFilter,
    roleFilter,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    setSearchQuery,
    setStatusFilter,
    setRoleFilter,
    handleSortChange,
    setCurrentPage,
    setPageSize,
    deleteUser,
    isDeletingUser,
    exportUsers,
    refreshData,
    totalUserCount,
    activeUserCount,
    newUserCount,
    usersError
  } = useUser();

  useEffect(() => {
    // Reset selected user IDs when data changes
    setSelectedUserIds([]);
  }, [usersData]);

  // Set analytics counts based on the users data when it's available
  useEffect(() => {
    if (usersData?.results?.length && !isLoadingUsers) {
      // Calculate active users
      const active = usersData.results.filter(user => user.is_active).length;
      
      // Calculate users created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recent = usersData.results.filter(user => {
        const createdDate = new Date(user.created_at);
        return createdDate >= thirtyDaysAgo;
      }).length;
      
      // Force update the values if we have the data
      if (usersData.count) {
        setDerivedStats({
          totalUserCount: usersData.count,
          activeUserCount: active,
          newUserCount: recent
        });
      }
    }
  }, [usersData, isLoadingUsers]);

  const handleViewUser = (id: string | number) => {
    navigate(`/users/${id}`);
  };

  const handleEditUser = (id: string | number) => {
    navigate(`/users/${id}/edit`);
  };

  const handleDeleteClick = (id: string | number) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUserId) {
      try {
        await deleteUser(selectedUserId);
        toast({
          title: "User deleted",
          description: "The user has been successfully deleted.",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedUserId(null);
      }
    }
  };

  const handleMultiDeleteConfirm = async () => {
    try {
      await Promise.all(selectedUserIds.map(id => deleteUser(id)));
      
      toast({
        title: "Users deleted",
        description: `${selectedUserIds.length} users have been successfully deleted.`,
        variant: "success",
      });
      setSelectedUserIds([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMultiDeleteDialogOpen(false);
    }
  };

  const handleCreateUser = () => {
    navigate("/users/create");
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length > 0) {
      setIsMultiDeleteDialogOpen(true);
    }
  };

  const handleUserSelection = (userId: string | number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = (isSelected: boolean) => {
    if (isSelected && usersData?.results) {
      setSelectedUserIds(usersData.results.map(user => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  // Extract data from the API response
  const users = usersData?.results || [];
  const totalItems = usersData?.count || 0;
  const totalPages = Math.ceil(totalItems / (usersData?.page_size || pageSize));

  // Use either API values or derived values for stats
  const displayedTotalUserCount = totalUserCount > 0 ? totalUserCount : derivedStats.totalUserCount;
  const displayedActiveUserCount = activeUserCount > 0 ? activeUserCount : derivedStats.activeUserCount;
  const displayedNewUserCount = newUserCount > 0 ? newUserCount : derivedStats.newUserCount;

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as 'all' | 'active' | 'inactive');
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value as 'all' | 'superuser' | 'staff' | 'user');
  };

  const renderAnalyticsCards = () => {
    if (isLoadingUsers) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{displayedTotalUserCount}</div>
            <p className="text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{displayedActiveUserCount}</div>
            <p className="text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{displayedNewUserCount}</div>
            <p className="text-muted-foreground">New Users (30 days)</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderErrorMessage = () => {
    if (!usersError) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load user data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <>
      <Helmet>
        <title>User Management | Admin Portal</title>
      </Helmet>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        {renderAnalyticsCards()}
        {renderErrorMessage()}
        
        <div className="mt-6">
          <UserTable
            users={users as User[]}
            loading={isLoadingUsers || isDeletingUser}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={handleStatusFilterChange}
            onRoleFilterChange={handleRoleFilterChange}
            onSortChange={handleSortChange}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteClick}
            onCreateUser={handleCreateUser}
            onExportUsers={exportUsers}
            onRefreshUsers={refreshData}
            totalUserCount={displayedTotalUserCount}
            activeUserCount={displayedActiveUserCount}
            newUserCount={displayedNewUserCount}
            selectedUserIds={selectedUserIds}
            onSelectUser={handleUserSelection}
            onSelectAll={handleSelectAllUsers}
            onBulkDelete={handleBulkDelete}
          />
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the user and all associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingUser}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeletingUser}
              >
                {isDeletingUser ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isMultiDeleteDialogOpen} onOpenChange={setIsMultiDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete multiple users?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to delete {selectedUserIds.length} users. This action will permanently remove all selected users and their associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingUser}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleMultiDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeletingUser}
              >
                {isDeletingUser ? "Deleting..." : `Delete ${selectedUserIds.length} Users`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default UserManagement;
