
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroup } from "@/hooks/useGroup";
import { Button } from "@/components/ui/button";
import { GroupForm } from "@/modules/users/components/GroupForm";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/group"; // Changed from @/types/user to @/types/group

const EditGroupPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    getGroup,
    updateGroup,
    isUpdatingGroup,
  } = useGroup();
  
  // Fetch group details
  const {
    data: group,
    isLoading: isLoadingGroup,
    error: groupError,
  } = getGroup(Number(id));
  
  const handleSubmit = async (data: { name: string }) => {
    try {
      await updateGroup({
        groupId: Number(id),
        data: {
          id: Number(id),
          name: data.name
        }
      });
      
      toast({
        title: "Success",
        description: "Group updated successfully",
        variant: "success",
      });
      
      navigate(`/user/groups/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (isLoadingGroup) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate(`/user/groups/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (groupError || !group) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/user/groups")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Groups
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            Group not found or you don't have permission to edit it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{`Edit Group: ${group.name} | Admin Portal`}</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4" 
            onClick={() => navigate(`/user/groups/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Group
          </Button>
          <h1 className="text-2xl font-bold">Edit Group: {group.name}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Group</CardTitle>
            <CardDescription>Update the group details</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupForm
              group={group}
              onSubmit={handleSubmit}
              isSubmitting={isUpdatingGroup}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditGroupPage;
