import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/modules/users/hooks/useUsers';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';

// Define the actual API response type based on what's coming from the backend
interface UserApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

type ExtendedUser = {
  id: string | number;
  username: string;
  email: string;
  role?: string;
  is_active?: boolean;
  profile?: {
    phone_number?: string;
    is_email_verified?: boolean;
  };
};

const UsersListPage = () => {
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch users with API integration
  const { users, isLoading, error, deleteUser } = useUsers(
    searchQuery,
    statusFilter,
    currentPage
  );

  // Get user data from API response
  const userData = (users?.results || []).map(user => {
    const extendedUser: ExtendedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: (user as any).role || '-', // Use type assertion to avoid TypeScript errors
      is_active: (user as any).is_active ?? false, // Use nullish coalescing with a default value
      profile: user.profile,
    };
    return extendedUser;
  });
  const totalItems = users?.count || 0;
  const totalPages = Math.ceil(totalItems / 10); // Assuming 10 items per page

  // Create filter component with modern styling
  const filterComponent = (
    <select
      id="statusFilter"
      value={statusFilter}
      onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
      className="border rounded-md px-2 py-1 w-full h-9 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30"
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  );

  // Define columns for the modern ListTemplate
  const columns: Column<ExtendedUser>[] = [
    { header: 'Username', key: 'username' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', render: (user) => user?.profile?.phone_number || '-' },
    { header: 'Role', render: (user) => user?.role || '-' },
    { header: 'Status', render: (user) => user?.is_active ? 'Active' : 'Inactive' },
    { header: 'Verified', render: (user) => user?.profile?.is_email_verified ? 'Yes' : 'No' },
  ];

  const handleUserSelection = (selectedUsers: ExtendedUser[]) => {
    setSelectedUserIds(selectedUsers.map(user => user.id));
  };

  return (
    <>
      <ListTemplate
        title="Users Directory"
        icon={<Users className="h-5 w-5" />}
        data={userData}
        isLoading={isLoading}
        error={error ? "Failed to load user data" : null}
        columns={columns}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
        rowActions={null}
        createPath="/users/create"
        createButtonText="Add User"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search users..."
        filterComponent={filterComponent}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setCurrentPage}
        selectable
        selectedItems={selectedUserIds}
        onSelectItems={handleUserSelection}
        className="shadow-md border border-gray-100 rounded-lg overflow-hidden"
        tableClassName="[&_tr:hover]:bg-gray-50/80 [&_th]:bg-gray-50/70 [&_th]:text-gray-600 [&_th]:font-medium"
        actionBarClassName="border-b border-gray-100 bg-gray-50/40"
      />
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                Promise.all(selectedUserIds.map(id => deleteUser(Number(id))))
                  .then(() => {
                    toast({
                      title: "Users deleted",
                      description: `${selectedUserIds.length} users have been successfully deleted.`,
                    });
                    setSelectedUserIds([]);
                  })
                  .catch(() => {
                    toast({
                      title: "Error",
                      description: "Failed to delete users. Please try again.",
                      variant: "destructive",
                    });
                  })
                  .finally(() => {
                    setIsMultiDeleteDialogOpen(false);
                  });
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedUserIds.length} Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UsersListPage;
