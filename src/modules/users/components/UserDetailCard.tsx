
import React from 'react';
import { User } from '@/types/user';
import { Group } from '@/types/group';
import { Permission } from '@/types/permission';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Mail, Phone, User as UserIcon, Calendar, Building2, MapPin } from 'lucide-react';

interface UserDetailCardProps {
  user: User;
  onEdit: () => void;
}

export const UserDetailCard: React.FC<UserDetailCardProps> = ({
  user,
  onEdit,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>{user.first_name} {user.last_name}</span>
            {user.is_active ? (
              <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </CardTitle>
          <div className="text-sm text-muted-foreground">@{user.username}</div>
        </div>
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Edit User
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Basic Information</p>
              <div className="grid grid-cols-1 gap-2 rounded-lg border p-4">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Username:</span>
                  <span className="text-sm">{user.username}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Email:</span>
                  <span className="text-sm">{user.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Phone:</span>
                  <span className="text-sm">{user.profile?.phone_number || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Roles & Permissions</p>
              <div className="grid grid-cols-1 gap-2 rounded-lg border p-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Role:</span>
                  <div className="space-x-1">
                    {user.is_superuser && <Badge variant="default">Admin</Badge>}
                    {user.is_staff && <Badge variant="outline">Staff</Badge>}
                    {!user.is_staff && !user.is_superuser && <Badge variant="secondary">User</Badge>}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-sm font-medium mr-2">Groups:</span>
                  <div className="flex flex-wrap gap-1">
                    {user.groups?.length > 0 ? (
                      user.groups.map(group => (
                        <Badge key={group.id} variant="outline" className="text-xs">
                          {group.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No groups assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Account Information</p>
              <div className="grid grid-cols-1 gap-2 rounded-lg border p-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Date Joined:</span>
                  <span className="text-sm">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Last Login:</span>
                  <span className="text-sm">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleString()
                      : 'Never logged in'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
              <div className="grid grid-cols-1 gap-2 rounded-lg border p-4">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium block">Address:</span>
                    <span className="text-sm">
                      {user.profile?.address ? (
                        <>
                          {user.profile.address}<br />
                          {user.profile.city}, {user.profile.state} {user.profile.postal_code}<br />
                          {user.profile.country}
                        </>
                      ) : (
                        'No address provided'
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Company:</span>
                  <span className="text-sm">{user.profile?.company || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const UserDetailSkeleton: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-24" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <div className="rounded-lg border p-4 space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-24 mr-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <div className="rounded-lg border p-4 space-y-4">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-24 mr-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
