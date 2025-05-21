import React, { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { useProfiles } from '@/modules/users/hooks/useProfiles';
import { UserProfile } from '@/modules/users/services/profileService';
import {
  User as UserIcon, 
  Phone, 
  Mail, 
  Globe,
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  UserPlus,
  Download,
  FilterIcon
} from 'lucide-react';

const ProfilesListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | number | null>(null);
  const [selectedProfileIds, setSelectedProfileIds] = useState<(string | number)[]>([]);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  
  // Use our profiles hook
  const { 
    currentPage, 
    setCurrentPage, 
    pageSize, 
    setPageSize, 
    listProfiles, 
    deleteProfile 
  } = useProfiles();
  
  // Get profiles list
  const { data, isLoading, error, refetch } = listProfiles();
  
  // Extract profiles from the paginated response
  const profiles = data?.results || [];
  
  // Compute pagination values from the API response
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Apply status filter to profiles
  const filteredProfiles = profiles.filter(profile => {
    // Apply status filter
    if (statusFilter === 'verified') {
      return profile.is_email_verified || profile.is_phone_verified;
    } else if (statusFilter === 'unverified') {
      return !profile.is_email_verified && (!profile.phone_number || !profile.is_phone_verified);
    }
    return true;
  });

  // Handler for viewing a profile
  const handleViewProfile = (profile: UserProfile) => {
    navigate(`/users/profiles/${profile.id}`);
  };

  // Handler for editing a profile
  const handleEditProfile = (id: string | number) => {
    navigate(`/users/profiles/${id}/edit`);
  };

  // Handler for deleting a profile confirmation
  const handleDeleteClick = (id: string | number) => {
    setSelectedProfileId(id);
    setIsDeleteDialogOpen(true);
  };

  // Handler for profile deletion
  const handleDeleteConfirm = async () => {
    if (selectedProfileId) {
      try {
        // Assuming deleteProfile is a mutation that needs to be manually triggered
        await deleteProfile.mutateAsync(selectedProfileId as number);
        toast({
          title: "Profile deleted",
          description: "The profile has been successfully deleted.",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedProfileId(null);
      }
    }
  };

  // Handler for profile selection
  const handleProfileSelection = (profiles: UserProfile[]) => {
    setSelectedProfileIds(profiles.map(profile => profile.id as number));
  };

  // Handler for bulk delete click
  const handleBulkDelete = () => {
    setIsMultiDeleteDialogOpen(true);
  };

  // Handler for bulk delete confirmation
  const handleMultiDeleteConfirm = async () => {
    try {
      // In a real app, this would be a bulk delete API call
      for (const id of selectedProfileIds) {
        await deleteProfile.mutateAsync(id as number);
      }
      
      toast({
        title: "Profiles deleted",
        description: `${selectedProfileIds.length} profiles have been successfully deleted.`,
      });
      refetch();
      setSelectedProfileIds([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMultiDeleteDialogOpen(false);
    }
  };

  // Function to handle row actions - return null to hide the three dots menu
  const rowActions = (profile: UserProfile): ReactNode => {
    return null;
  };

  // Define columns for the list template
  const columns: Column<UserProfile>[] = [
    {
      header: 'Username',
      render: (profile) => {
        // UserProfile likely has a user_id or similar property, not a complex user object
        // Use profile.id for avatar and a simpler display
        const id = String(profile.id || '');
        const avatarText = id.length > 0 ? id[0].toUpperCase() : '?';
        
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-primary font-medium">{avatarText}</span>
            </div>
            <div className="font-medium">ID: {profile.id}</div> 
          </div>
        );
      }
    },
    {
      header: 'Email',
      render: (profile) => {
        // Use type assertion to handle potential differences in API structure
        return (profile as any).email || 'Not available in this version';
      }
    },
    {
      header: 'Phone Number', 
      render: (profile) => profile.phone_number || '-'
    },
    {
      header: 'Verification Status', 
      render: (profile) => {
        // Generate verification status text without icons or badges
        if (profile.is_email_verified && profile.is_phone_verified) {
          return 'Fully Verified';
        } else if (profile.is_email_verified || profile.is_phone_verified) {
          return 'Partially Verified';
        } else {
          return 'Not Verified';
        }
      }
    },
    {
      header: 'Location', 
      render: (profile) => {
        // Combine city and state if available
        const city = profile.city || '';
        const state = profile.state || '';
        const location = [city, state].filter(Boolean).join(', ');
        return location || '-';
      }
    }
  ];

  // Create the filter component
  const filterComponent = (
    <select
      id="statusFilter"
      value={statusFilter}
      onChange={e => setStatusFilter(e.target.value as 'all' | 'verified' | 'unverified')}
      className="border rounded-md px-2 py-1 w-full h-9 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30"
    >
      <option value="all">All Status</option>
      <option value="verified">Verified</option>
      <option value="unverified">Unverified</option>
    </select>
  );

  return (
    <>
      <ListTemplate
        title="Profiles"
        icon={<UserIcon className="h-5 w-5" />}
        description="Manage user profiles and their verification status"
        data={filteredProfiles}
        isLoading={isLoading}
        error={error}
        columns={columns}
        onRowClick={handleViewProfile}
        rowActions={rowActions}
        createPath="/users/profiles/create"
        createButtonText="New Profile"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search profiles..."
        filterComponent={filterComponent}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onExport={undefined}
        selectedItems={filteredProfiles.filter(profile => selectedProfileIds.includes(profile.id as number))}
        onSelectItems={handleProfileSelection}
        selectable={true}
        className="shadow-md border border-gray-100 rounded-lg overflow-hidden"
        tableClassName="[&_tr:hover]:bg-gray-50/80 [&_th]:bg-gray-50/70 [&_th]:text-gray-600 [&_th]:font-medium"
        actionBarClassName="border-b border-gray-100 bg-gray-50/40"
      />
      
      {/* Render bulk actions when items are selected */}
      {selectedProfileIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <span className="font-medium">{selectedProfileIds.length} profiles selected</span>
          <div className="h-5 w-px bg-white/20"></div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 text-white border-none">
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 text-white border-none">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" variant="destructive" className="h-8" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the profile and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Multiple delete confirmation dialog */}
      <AlertDialog open={isMultiDeleteDialogOpen} onOpenChange={setIsMultiDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple profiles?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedProfileIds.length} profiles. This action will permanently remove all selected profiles and their associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMultiDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : `Delete ${selectedProfileIds.length} Profiles`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfilesListPage;
