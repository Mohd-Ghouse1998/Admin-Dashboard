
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useGroup } from "@/modules/users/hooks/useGroup";
import { GroupTable } from "@/modules/users/components/GroupTable";
import { Group, GroupCreatePayload } from "@/types/group";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layout/PageLayout";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GroupForm } from "@/modules/users/components/GroupForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const GroupsListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupUserCounts, setGroupUserCounts] = useState<Record<number, number>>({});

  // Get group-related hooks and states
  const {
    groupsData,
    isLoadingGroups,
    groupsError,
    currentPage,
    searchQuery,
    setCurrentPage,
    setSearchQuery,
    deleteGroup,
    isDeletingGroup,
    createGroup,
    isCreatingGroup,
    getGroupUsers,
  } = useGroup();

  // Fetch user counts for each group
  useEffect(() => {
    const fetchGroupUserCounts = async () => {
      if (!groupsData?.results) return;
      
      const counts: Record<number, number> = {};
      
      await Promise.all(
        groupsData.results.map(async (group) => {
          const { data } = getGroupUsers(group.id);
          if (data) {
            counts[group.id] = data.length;
          }
        })
      );
      
      setGroupUserCounts(counts);
    };
    
    fetchGroupUserCounts();
  }, [groupsData, getGroupUsers]);

  // Handle debounced search
  const [localSearch, setLocalSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Group operations handlers
  const handleViewGroup = (id: number) => {
    navigate(`/users/groups/${id}`);
  };

  const handleEditGroup = (id: number) => {
    navigate(`/users/groups/${id}/edit`);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedGroupId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedGroupId) {
      try {
        await deleteGroup(selectedGroupId);
        toast({
          title: "Group deleted",
          description: "The group has been successfully deleted.",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete group. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedGroupId(null);
      }
    }
  };

  const handleCreateGroup = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (data: GroupCreatePayload) => {
    try {
      await createGroup(data);
      toast({
        title: "Success",
        description: "Group created successfully",
        variant: "success",
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  // Extract data from the API response
  const groups = groupsData?.results || [];
  const totalItems = groupsData?.count || 0;
  const totalPages = Math.ceil(totalItems / (groupsData?.page_size || 10));

  return (
    <PageLayout
      title="Group Management"
      description="Manage user groups and permissions"
    >
      <Helmet>
        <title>Groups | Admin Dashboard</title>
      </Helmet>
      
      {groupsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load groups data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}
      
      <GroupTable
        groups={groups}
        loading={isLoadingGroups || isDeletingGroup}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        searchQuery={localSearch}
        onSearchChange={setLocalSearch}
        onPageChange={setCurrentPage}
        onViewGroup={handleViewGroup}
        onEditGroup={handleEditGroup}
        onDeleteGroup={handleDeleteClick}
        onCreateGroup={handleCreateGroup}
        groupUserCounts={groupUserCounts}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the group.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Group Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group for user management.
            </DialogDescription>
          </DialogHeader>
          
          <GroupForm 
            onSubmit={handleCreateSubmit}
            isSubmitting={isCreatingGroup}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default GroupsListPage;
