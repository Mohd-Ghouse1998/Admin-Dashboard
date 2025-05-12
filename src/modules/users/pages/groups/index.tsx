import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGroup } from "@/modules/users/hooks/useGroup";
import { GroupTable } from "@/modules/users/components/GroupTable";
import { Group, GroupCreatePayload } from "@/types/group";
import { useToast } from "@/hooks/use-toast";
import { 
  DeleteGroupDialog, 
  CreateGroupDialog, 
  EditGroupDialog 
} from "@/modules/users/components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const GroupManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    groupsData,
    isLoadingGroups,
    isCreatingGroup,
    isUpdatingGroup,
    isDeletingGroup,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    setCurrentPage: setGroupsCurrentPage,
    setSearchQuery: setGroupsSearchQuery
  } = useGroup();

  // Fetch selected group when editing
  const {
    data: groupDetail,
    refetch: refetchGroupDetail,
  } = getGroup(selectedGroupId || 0);

  // Set selected group when available
  useEffect(() => {
    if (groupDetail && selectedGroupId) {
      setSelectedGroup(groupDetail);
    }
  }, [groupDetail, selectedGroupId]);

  // Update search with debounce
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setGroupsSearchQuery(localSearch);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localSearch, setGroupsSearchQuery]);

  // Update current page in the useGroup hook when local state changes
  useEffect(() => {
    setGroupsCurrentPage(currentPage);
  }, [currentPage, setGroupsCurrentPage]);

  const handleViewGroup = (id: number) => {
    setSelectedGroupId(id);
    refetchGroupDetail();
    setIsEditDialogOpen(true);
  };

  const handleEditGroup = (id: number) => {
    setSelectedGroupId(id);
    refetchGroupDetail();
    setIsEditDialogOpen(true);
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
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleEditSubmit = async (data: GroupCreatePayload) => {
    if (selectedGroupId) {
      try {
        await updateGroup({
          groupId: selectedGroupId,
          data: {
            id: selectedGroupId,  // Add the missing id property
            name: data.name,
            description: data.description,
            permissions: data.permissions,
          }
        });
        setIsEditDialogOpen(false);
        setSelectedGroupId(null);
        setSelectedGroup(null);
      } catch (error) {
        console.error("Error updating group:", error);
      }
    }
  };

  // Extract data from the API response
  const groups = groupsData?.results || [];
  const totalItems = groupsData?.count || 0;
  const totalPages = Math.ceil(totalItems / (groupsData?.page_size || 10));

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Group Management</h1>
      
      {/* Error alert */}
      {groupsData && groupsData.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load groups. Please try refreshing the page.
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
      />

      {/* Delete Confirmation Dialog */}
      <DeleteGroupDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeletingGroup}
      />

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreatingGroup}
      />

      {/* Edit Group Dialog */}
      <EditGroupDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        group={selectedGroup}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdatingGroup}
      />
    </div>
  );
};

export default GroupManagement;
