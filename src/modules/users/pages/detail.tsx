import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/modules/users/hooks/useUser";
import { usePermission } from "@/hooks/usePermission";
import { useGroup } from "@/hooks/useGroup";
import { UserDetailCard, UserDetailSkeleton } from "@/modules/users/components/UserDetailCard";
import { UserPermissionsTab } from "@/modules/users/components/UserPermissionsTab";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import { Group } from "@/types/group";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  
  const { 
    getUser
  } = useUser();
  
  const {
    getUserPermissions,
    updateUserPermissions,
    isUpdatingUserPermissions,
  } = usePermission();
  
  const {
    getGroup,
  } = useGroup();
  
  const userId = id as string;
  
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError
  } = getUser(userId);

  const {
    data: userPermissions,
    isLoading: isLoadingUserPermissions,
    refetch: refetchUserPermissions,
  } = getUserPermissions(userId);

  // Fetch user's groups
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user?.groups || user.groups.length === 0) {
        setUserGroups([]);
        return;
      }
      
      const groups: Group[] = [];
      
      for (const groupData of user.groups) {
        const { data: group } = getGroup(groupData.id);
        if (group) {
          groups.push(group);
        }
      }
      
      setUserGroups(groups);
    };
    
    fetchUserGroups();
  }, [user, getGroup]);

  // Handle errors
  useEffect(() => {
    if (userError) {
      toast({
        title: "Error",
        description: "Failed to load user. Please try again.",
        variant: "destructive",
      });
    }
  }, [userError, toast]);

  const handleUpdatePermissions = async (userId: string | number, permissionIds: number[]) => {
    try {
      await updateUserPermissions({ userId, permissionIds });
      refetchUserPermissions();
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  const handleGroupClick = (groupId: number) => {
    navigate(`/user-management/groups/${groupId}`);
  };

  if (isLoadingUser) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
          </Button>
        </div>
        <UserDetailSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
          </Button>
        </div>
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            User not found or you don't have permission to view it.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>{`User: ${user.username} | Admin Portal`}</title>
      </Helmet>
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
        </Button>
        <h1 className="text-2xl font-bold ml-4">User: {user.username}</h1>
      </div>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <User className="h-4 w-4" /> User Details
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Permissions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <UserDetailCard
            user={user}
            onEdit={() => navigate(`/users/${userId}/edit`)}
          />
        </TabsContent>
        
        <TabsContent value="permissions">
          <UserPermissionsTab
            userId={userId}
            userPermissions={userPermissions || []}
            userGroups={userGroups}
            isLoadingPermissions={isLoadingUserPermissions}
            isUpdatingPermissions={isUpdatingUserPermissions}
            onUpdatePermissions={handleUpdatePermissions}
            onClickGroup={handleGroupClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetail;
