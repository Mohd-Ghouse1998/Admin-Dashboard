
import React from 'react';
import { User } from '@/types/user';
import { Group } from '@/types/group';
import { Permission } from '@/types/permission';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PermissionSelect } from '@/components/permission/PermissionSelect';

interface UserPermissionsTabProps {
  userId: string | number;
  userPermissions: Permission[];
  userGroups: Group[];
  isLoadingPermissions: boolean;
  isUpdatingPermissions: boolean;
  onUpdatePermissions: (userId: string | number, permissionIds: number[]) => void;
  onClickGroup: (groupId: number) => void;
}

export const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({
  userId,
  userPermissions,
  userGroups,
  isLoadingPermissions,
  isUpdatingPermissions,
  onUpdatePermissions,
  onClickGroup,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Direct Permissions
          </CardTitle>
          <CardDescription>
            Permissions directly assigned to this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPermissions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <PermissionSelect
                  selectedPermissionIds={userPermissions.map(p => p.id)}
                  onSelect={(permissions) => onUpdatePermissions(userId, permissions.map(p => p.id))}
                  trigger={
                    <Button>
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </Button>
                  }
                />
              </div>
              
              {userPermissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userPermissions.map(permission => (
                    <Badge 
                      key={permission.id} 
                      variant="outline"
                      className="flex items-center gap-1 py-1"
                    >
                      <Shield className="h-3 w-3" />
                      {permission.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No permissions directly assigned to this user
                </p>
              )}
              
              {isUpdatingPermissions && (
                <div className="flex items-center justify-center mt-4">
                  <Badge variant="outline" className="bg-primary/10 flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" /> 
                    Updating permissions...
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Group Memberships
          </CardTitle>
          <CardDescription>
            Permissions inherited from groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userGroups.length > 0 ? (
            <div className="space-y-4">
              {userGroups.map(group => (
                <div key={group.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{group.name}</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onClickGroup(group.id)}
                    >
                      View Group
                    </Button>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(group.permissions) && group.permissions.length > 0 ? (
                      (group.permissions as Permission[]).map(permission => (
                        <Badge 
                          key={permission.id} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Shield className="h-3 w-3" />
                          {permission.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No permissions in this group</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              User is not a member of any groups
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
