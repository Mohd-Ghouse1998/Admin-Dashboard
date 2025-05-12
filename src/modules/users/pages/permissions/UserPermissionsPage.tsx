
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { permissionService } from '@/services/permissionService';
import { userService } from '@/modules/users/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Permission } from '@/types/permission';
import { UnfoldFormSection, UnfoldFormGroup } from '@/components/ui/unfold-form';

const UserPermissionsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch user details
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(accessToken, id || ''),
    enabled: !!accessToken && !!id,
  });
  
  // Fetch all available permissions
  const {
    data: allPermissions,
    isLoading: isLoadingPermissions,
    error: permissionsError
  } = useQuery({
    queryKey: ['allPermissions'],
    queryFn: () => permissionService.getPermissions(accessToken),
    enabled: !!accessToken,
  });
  
  // Fetch user's current permissions
  const {
    data: userPermissions,
    isLoading: isLoadingUserPermissions,
    error: userPermissionsError
  } = useQuery({
    queryKey: ['userPermissions', id],
    queryFn: () => permissionService.getUserPermissions(accessToken, id || ''),
    enabled: !!accessToken && !!id
  });
  
  // Set the selected permissions when the user permissions load
  useEffect(() => {
    if (userPermissions) {
      const permissionIds = userPermissions.map(permission => permission.id);
      setSelectedPermissions(permissionIds);
    }
  }, [userPermissions]);
  
  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };
  
  const handleSavePermissions = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await permissionService.updateUserPermissions(accessToken, id, { permissions: selectedPermissions });
      
      toast({
        title: "Success",
        description: "User permissions updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Failed to update permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isLoading = isLoadingUser || isLoadingPermissions || isLoadingUserPermissions;
  const error = userError || permissionsError || userPermissionsError;

  // Group permissions by content type
  const groupedPermissions = React.useMemo(() => {
    if (!allPermissions?.results) return {};
    
    return allPermissions.results.reduce((acc: Record<string, Permission[]>, permission) => {
      const contentType = permission.content_type_name || 'Other';
      if (!acc[contentType]) {
        acc[contentType] = [];
      }
      acc[contentType].push(permission);
      return acc;
    }, {});
  }, [allPermissions]);

  return (
    <PageLayout
      title={user ? `Manage Permissions: ${user.username || user.email}` : "Manage User Permissions"}
      description="Assign or remove permissions for this user"
      backButton
      backTo={`/users/users/${id}`}
    >
      <Helmet>
        <title>User Permissions | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load data'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleSavePermissions} disabled={isSubmitting || isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Permissions
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">Loading permissions...</div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              {Object.entries(groupedPermissions).map(([contentType, permissions]) => (
                <UnfoldFormSection key={contentType} title={contentType} className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map((permission) => (
                      <UnfoldFormGroup key={permission.id}>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked === true)
                            }
                          />
                          <label 
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm cursor-pointer flex flex-col"
                          >
                            <span className="font-medium">{permission.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {permission.codename}
                            </span>
                          </label>
                        </div>
                      </UnfoldFormGroup>
                    ))}
                  </div>
                </UnfoldFormSection>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default UserPermissionsPage;
